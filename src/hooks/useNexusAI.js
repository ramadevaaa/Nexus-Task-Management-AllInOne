import { useState, useCallback, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, limit, serverTimestamp, getDocs, writeBatch } from 'firebase/firestore';
import { startNexusChat } from '../lib/gemini';
import { useTasks } from './useTasks';

export function useNexusAI(user) {
  const { activities } = useTasks();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  // 1. Fetch Chat History from Firestore
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'ai_history'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).reverse();
      
      setMessages(msgs);
      
      // Convert to Gemini history format (last 10 messages)
      let slicedMsgs = msgs.slice(-10);
      
      // CRITICAL FIX: Gemini requires the first message in history to be from 'user'
      while (slicedMsgs.length > 0 && slicedMsgs[0].role !== 'user') {
        slicedMsgs.shift();
      }

      const geminiHistory = slicedMsgs.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));
      setHistory(geminiHistory);
    });

    return () => unsubscribe();
  }, [user]);

  // 2. Build Dashboard Context with full IDs
  const getDashboardContext = useCallback(() => {
    const activeTasks = activities.filter(a => a.type === 'task' && !a.isCompleted).slice(0, 15);
    const upcomingEvents = activities.filter(a => a.type === 'event').slice(0, 10);
    const vaultItems = activities.filter(a => a.type === 'vault').slice(0, 10);
    const folders = activities.filter(a => a.type === 'folder').slice(0, 10);

    return `
CURRENT USER CONTEXT:
Date: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Time: ${new Date().toLocaleTimeString('id-ID')}

ACTIVE TASKS:
${activeTasks.length > 0
  ? activeTasks.map(t => `- [ID: ${t.id}] "${t.title}" | Due: ${t.deadlineDate || 'Tidak ada'} | Priority: ${t.priority || 'normal'} | Detail: ${t.detail?.substring(0, 80) || '-'}`).join('\n')
  : '(tidak ada tugas aktif)'}

UPCOMING EVENTS:
${upcomingEvents.length > 0
  ? upcomingEvents.map(e => `- [ID: ${e.id}] "${e.title}" | Date: ${e.date || '-'} | Time: ${e.time || '-'}`).join('\n')
  : '(tidak ada event)'}

NEXUS VAULT:
${vaultItems.length > 0
  ? vaultItems.map(v => `- [ID: ${v.id}] [${v.vaultType?.toUpperCase() || 'NOTE'}] "${v.title}": ${v.content?.substring(0, 100) || '-'}${v.content?.length > 100 ? '...' : ''}`).join('\n')
  : '(vault kosong)'}

FOLDERS:
${folders.length > 0
  ? folders.map(f => `- [ID: ${f.id}] Folder: "${f.title}"`).join('\n')
  : '(tidak ada folder)'}
    `;
  }, [activities]);

  // 3. Send Message to Gemini
  const sendMessage = async (text) => {
    if (!user || !text.trim()) return;

    setLoading(true);
    setError(null);
    const context = getDashboardContext();
    const fullPrompt = `${context}\n\nPESAN PENGGUNA: ${text}`;

    try {
      // Save User Message to Firestore
      await addDoc(collection(db, 'ai_history'), {
        userId: user.uid,
        role: 'user',
        text: text,
        createdAt: serverTimestamp(),
      });

      // Start Gemini Chat
      const chat = startNexusChat(history);
      const result = await chat.sendMessage(fullPrompt);
      const responseText = result.response.text();

      // Save AI Response to Firestore
      await addDoc(collection(db, 'ai_history'), {
        userId: user.uid,
        role: 'model',
        text: responseText,
        createdAt: serverTimestamp(),
      });

    } catch (err) {
      console.error("Nexus AI Error:", err);
      const errorMessage = err.message || "Unknown neural error";
      
      if (errorMessage.includes('429')) {
        setError("Neural link saturated (Quota Exceeded). Tunggu sebentar lalu coba lagi.");
      } else {
        setError(`Neural link interrupted: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'ai_history'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    } catch (error) {
      console.error("Error clearing history:", error);
    } finally {
      setLoading(false);
    }
  };

  return { messages, loading, error, sendMessage, clearHistory };
}
