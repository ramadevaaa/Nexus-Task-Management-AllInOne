import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
  limit
} from 'firebase/firestore';
import { encryptData, decryptData } from '../utils/cryptoUtils';

export function useTasks() {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [indexError, setIndexError] = useState(false);

  // ── HELPER: PROCESS READ (DECRYPT) ──
  const decryptActivity = useCallback((data, userId) => {
    return {
      ...data,
      title: decryptData(data.title, userId),
      detail: decryptData(data.detail, userId),
      location: decryptData(data.location, userId),
      content: decryptData(data.content, userId),
      url: decryptData(data.url, userId),
      imageUrl: decryptData(data.imageUrl, userId),
    };
  }, []);

  // ── HELPER: PROCESS WRITE (ENCRYPT) ──
  const encryptActivity = useCallback((data, userId) => {
    if (!data || !userId) return data;
    const res = { ...data, _enc: true };
    
    // Only encrypt if the field exists to avoid sending 'undefined' to Firestore
    if (typeof data.title === 'string') res.title = encryptData(data.title, userId);
    if (typeof data.detail === 'string') res.detail = encryptData(data.detail, userId);
    if (typeof data.location === 'string') res.location = encryptData(data.location, userId);
    if (typeof data.content === 'string') res.content = encryptData(data.content, userId);
    if (typeof data.url === 'string') res.url = encryptData(data.url, userId);
    if (typeof data.imageUrl === 'string') res.imageUrl = encryptData(data.imageUrl, userId);
    
    return res;
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setActivities([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Try with orderBy first (requires composite index)
    const qWithOrder = query(
      collection(db, 'activities'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    // Fallback query without orderBy (works without index)
    const qSimple = query(
      collection(db, 'activities'),
      where('userId', '==', currentUser.uid)
    );

    let unsubscribe = () => {};

    const tryWithOrder = () => {
      unsubscribe = onSnapshot(qWithOrder, (snapshot) => {
        const data = snapshot.docs.map(d => {
          const raw = d.data();
          return { id: d.id, ...decryptActivity(raw, currentUser.uid) };
        });
        
        // Filter out archived items client-side for "lightweight" feel
        const filtered = data.filter(item => !item.isArchived);
        
        console.log(`[Firestore] TryWithOrder loaded ${filtered.length} active items (Total in snapshot: ${data.length}).`);
        setActivities(filtered);
        setLoading(false);
        setIndexError(false);
      }, (err) => {
        if (err.code === 'failed-precondition' || err.code === 'unimplemented') {
          console.warn('⚠️ Firestore index not ready, using fallback query.');
          setIndexError(true);
          useFallback();
        } else {
          console.error('[Firestore] Error in TryWithOrder:', err);
          setLoading(false);
        }
      });
    };

    const useFallback = () => {
      unsubscribe = onSnapshot(qSimple, (snapshot) => {
        const data = snapshot.docs
          .map(d => {
            const raw = d.data();
            return { id: d.id, ...decryptActivity(raw, currentUser.uid) };
          })
          .filter(item => !item.isArchived) // Archive filter
          .sort((a, b) => {
            const aTime = a.createdAt?.seconds ?? 0;
            const bTime = b.createdAt?.seconds ?? 0;
            return bTime - aTime;
          });

        console.log(`[Firestore] Fallback loaded ${data.length} active items.`);
        setActivities(data);
        setLoading(false);
      }, (err) => {
        console.error('[Firestore] Fallback query failed:', err);
        setLoading(false);
      });
    };

    tryWithOrder();
    return () => unsubscribe();
  }, [currentUser]);

  // ── OPTIMISTIC ADD ──
  const addActivity = useCallback(async (activityData) => {
    if (!currentUser || !activityData.title?.trim()) return;

    const tempId = `temp_${Date.now()}`;
    const tempItem = {
      id: tempId,
      ...activityData,
      userId: currentUser.uid,
      createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
      _optimistic: true,
    };
    setActivities(prev => [tempItem, ...prev]);

    try {
      const encrypted = encryptActivity({
        ...activityData,
        isArchived: false,
      }, currentUser.uid);

      const docRef = await addDoc(collection(db, 'activities'), {
        ...encrypted,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      });
      // Replace temp with real doc on success (in case onSnapshot doesn't fire fast)
      setActivities(prev =>
        prev.map(a => a.id === tempId ? { ...tempItem, id: docRef.id, _optimistic: false } : a)
      );
    } catch (err) {
      console.error('Error adding activity:', err);
      setActivities(prev => prev.filter(a => a.id !== tempId));
    }
  }, [currentUser]);

  // ── OPTIMISTIC TOGGLE ──
  const toggleTask = useCallback(async (taskId, currentStatus) => {
    if (taskId.startsWith('temp_')) return;
    setActivities(prev => prev.map(a => a.id === taskId ? { ...a, isCompleted: !currentStatus } : a));
    try {
      await updateDoc(doc(db, 'activities', taskId), { isCompleted: !currentStatus });
    } catch (err) {
      console.error('Toggle failed:', err);
      setActivities(prev => prev.map(a => a.id === taskId ? { ...a, isCompleted: currentStatus } : a));
    }
  }, []);

  // ── OPTIMISTIC DELETE ──
  const deleteTask = useCallback(async (taskId) => {
    const backup = activities.find(a => a.id === taskId);
    setActivities(prev => prev.filter(a => a.id !== taskId));
    if (taskId.startsWith('temp_')) return;
    try {
      await deleteDoc(doc(db, 'activities', taskId));
    } catch (err) {
      console.error('Delete failed:', err);
      if (backup) setActivities(prev => [...prev, backup]);
    }
  }, [activities]);

  // ── PURGE COMPLETED ──
  const purgeCompleted = useCallback(async () => {
    const toDelete = activities.filter(a => a.isCompleted && !a.id.startsWith('temp_'));
    setActivities(prev => prev.filter(a => !a.isCompleted));
    await Promise.all(toDelete.map(item =>
      deleteDoc(doc(db, 'activities', item.id)).catch(e => console.error('Purge error:', e))
    ));
  }, [activities]);

  // ── MARK NOTIFIED ──
  const markTaskNotified = useCallback(async (taskId) => {
    if (taskId.startsWith('temp_')) return;
    setActivities(prev => prev.map(a => a.id === taskId ? { ...a, notified30Min: true } : a));
    try {
      await updateDoc(doc(db, 'activities', taskId), { notified30Min: true });
    } catch (err) {
      console.error('Mark notified failed:', err);
    }
  }, []);

  // ── OPTIMISTIC UPDATE ──
  const updateActivity = useCallback(async (taskId, updatedData) => {
    if (!taskId || taskId.startsWith('temp_')) return;
    
    const backup = activities.find(a => a.id === taskId);
    setActivities(prev => prev.map(a => a.id === taskId ? { ...a, ...updatedData } : a));

    try {
      const encrypted = encryptActivity(updatedData, currentUser.uid);
      await updateDoc(doc(db, 'activities', taskId), {
        ...encrypted
      });
    } catch (err) {
      console.error('Update failed:', err);
      if (backup) setActivities(prev => prev.map(a => a.id === taskId ? backup : a));
    }
  }, [activities]);

  // ── ADD PORTAL ──
  const addPortal = useCallback(async (portalData) => {
    if (!currentUser) return;
    const tempId = `temp_${Date.now()}`;
    const tempItem = {
      id: tempId,
      ...portalData,
      userId: currentUser.uid,
      type: 'portal',
      createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
      _optimistic: true,
    };
    setActivities(prev => [...prev, tempItem]);
    try {
      const encrypted = encryptActivity({
        ...portalData,
        type: 'portal',
        isArchived: false,
      }, currentUser.uid);

      const docRef = await addDoc(collection(db, 'activities'), {
        ...encrypted,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      });
      setActivities(prev =>
        prev.map(a => a.id === tempId ? { ...tempItem, id: docRef.id, _optimistic: false } : a)
      );
    } catch (err) {
      console.error('Error adding portal:', err);
      setActivities(prev => prev.filter(a => a.id !== tempId));
    }
  }, [currentUser]);

  return {
    activities,
    loading,
    indexError,        // expose so we can warn user if needed
    addActivity,
    toggleTask,
    deleteTask,
    updateActivity,
    markTaskNotified,
    purgeCompleted,
    addPortal,
  };
}
