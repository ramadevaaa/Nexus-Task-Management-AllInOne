import { useState, useCallback, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, limit, serverTimestamp, getDocs, writeBatch, doc } from 'firebase/firestore';
import { startNexusChat } from '../lib/gemini';
import { useTasks } from './useTasks';

export function useNexusAI(user) {
  const { activities } = useTasks();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  // 1. Fetch Chat History from Firestore (Sync multi-device)
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'ai_history'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20) // Keep history small
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).reverse();
      
      setMessages(msgs);
      
      // Convert to Gemini history format (LIMIT TO LAST 10 FOR EFFICIENCY)
      const geminiHistory = msgs.slice(-10).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));
      setHistory(geminiHistory);
    });

    return () => unsubscribe();
  }, [user]);

  // 2. Data Aggregator (Context) - LIMITING DATA TO SAVE TOKENS
  const getDashboardContext = useCallback(() => {
    const activeTasks = activities.filter(a => a.type === 'task' && !a.isCompleted).slice(0, 15);
    const upcomingEvents = activities.filter(a => a.type === 'event').slice(0, 10);
    const vaultNotes = activities.filter(a => a.type === 'vault').slice(0, 8);

    return `
    CURRENT USER CONTEXT:
    Date: ${new Date().toLocaleDateString()}
    Time: ${new Date().toLocaleTimeString()}
    
    RECENT TASKS:
    ${activeTasks.map(t => `- ${t.title} (Due: ${t.deadlineDate})`).join('\n')}
    
    RECENT EVENTS:
    ${upcomingEvents.map(e => `- ${e.title} (Time: ${e.date})`).join('\n')}
    
    RECENT VAULT BITS:
    ${vaultNotes.map(v => `- ${v.title}`).join('\n')}
    `;
  }, [activities]);

  // 3. Send Message to Gemini
  const sendMessage = async (text) => {
    if (!user || !text.trim()) return;

    setLoading(true);
    setError(null);
    const context = getDashboardContext();
    const fullPrompt = `${context}\n\nUSER MESSAGE: ${text}`;

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
      if (err.message?.includes('429')) {
        setError("Neural link saturated (Quota Exceeded). Please wait a moment.");
      } else {
        setError("Neural link interrupted. Please try again.");
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
