import { useEffect, useState, useRef } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../contexts/AuthContext';
import { BellRing, Smartphone, ShieldCheck, X } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

export default function NotificationManager() {
  const { activities, markTaskNotified } = useTasks();
  const { currentUser } = useAuth();
  const { permission, token, requestPermission, initForegroundListener } = useNotifications(currentUser);
  
  const [activeAlarms, setActiveAlarms] = useState([]);
  const [showPWAHint, setShowPWAHint] = useState(false);
  const activeAlarmsRef = useRef([]); 
  const audioRef = useRef(null);

  useEffect(() => {
    console.log("🔔 [NotificationManager] Current Status:", { permission, hasToken: !!token });
  }, [permission, token]);

  useEffect(() => {
    activeAlarmsRef.current = activeAlarms;
  }, [activeAlarms]);

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = initForegroundListener();
      return () => unsubscribe();
    }
  }, [currentUser, initForegroundListener]);

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isMobile && !isStandalone) {
      setShowPWAHint(true);
    }
  }, []);

  // Task Checking Loop
  useEffect(() => {
    if (!currentUser) return;

    const checkInterval = setInterval(() => {
      if (!activities || !Array.isArray(activities)) return;
      const now = new Date();
      const alarmsToTrigger = [];

      activities.forEach(task => {
        if (!task || !task.id || task.isCompleted || task.notified30Min) return;
        
        const dateVal = task.type === 'task' ? task.deadlineDate : task.date;
        const timeVal = task.type === 'task' ? task.deadlineTime : task.time;
        if (!dateVal || !timeVal) return;

        try {
          const [y, m, d] = dateVal.split('-').map(Number);
          const [hh, mm] = timeVal.split(':').map(Number);
          const deadline = new Date(y, m - 1, d, hh, mm);
          if (isNaN(deadline.getTime())) return;

          const diffMins = (deadline - now) / 60000;

          // TRIGGER LOGIC: Bunyi 15 menit sebelum (Upcoming) atau Pas Hari H
          if (diffMins <= 15 && diffMins > -10) { 
            if (!activeAlarmsRef.current.some(a => a.id === task.id)) {
              console.log("🚨 [NotificationManager] Triggering Alarm for:", task.title);
              alarmsToTrigger.push(task);
              playAlertSound();
              
              // Push Browser Notification
              if (Notification.permission === 'granted') {
                new Notification(`🚨 Nexus Alert: ${task.title}`, {
                  body: diffMins > 0 ? `Dimulai dalam ${Math.round(diffMins)} menit!` : `Sedang berlangsung!`,
                  icon: '/favicon.svg'
                });
              }
            }
          }
        } catch (e) {
          console.error('[NotificationManager] Error:', e);
        }
      });

      if (alarmsToTrigger.length > 0) {
        setActiveAlarms(prev => [...prev, ...alarmsToTrigger]);
      }
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [activities, currentUser]);

  const playAlertSound = () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.warn('Audio blocked', e));
    } catch (err) {}
  };

  // Global Alarm Listener (for Pomodoro, etc.)
  useEffect(() => {
    const handleGlobalAlarm = (e) => {
      const alarmData = e.detail;
      if (!alarmData) return;

      console.log("🚨 [NotificationManager] Global Alarm Received:", alarmData.title);
      
      // Add to active alarms list
      setActiveAlarms(prev => {
        if (prev.some(a => a.id === alarmData.id)) return prev;
        return [...prev, alarmData];
      });

      // Play Sound
      playAlertSound();

      // Browser Notification
      if (Notification.permission === 'granted') {
        new Notification(`🚨 Nexus Alert: ${alarmData.title}`, {
          body: `Time's up! Check your terminal.`,
          icon: '/favicon.svg'
        });
      }
    };

    window.addEventListener('nexus:trigger-alarm', handleGlobalAlarm);
    return () => window.removeEventListener('nexus:trigger-alarm', handleGlobalAlarm);
  }, []);

  const stopAlarm = (taskId) => {
    setActiveAlarms(prev => prev.filter(t => t.id !== taskId));
    // Only mark as notified if it's a real activity ID (starts with Firestore ID length usually, not 'pomo-')
    if (taskId && typeof taskId === 'string' && !taskId.startsWith('pomo-')) {
      markTaskNotified(taskId);
    }
  };

  return (
    <>
      {/* 1. Request Permission Banner */}
      {permission === 'default' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[99999] w-[92%] max-w-[400px] animate-slide-down">
          <div className="bg-indigo-600 rounded-3xl p-5 shadow-2x border border-white/20 flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="p-3 bg-white/10 rounded-2xl">
                <ShieldCheck size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">Security & Mission Alert</p>
                <p className="text-white/70 text-[11px] font-medium leading-relaxed mt-1">
                  Nexus needs permission to sync your mission reminders to this device.
                </p>
              </div>
            </div>
            <button 
              onClick={requestPermission}
              className="w-full bg-white text-indigo-600 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Enable Missions Alert
            </button>
          </div>
        </div>
      )}

      {/* 2. PWA Installation Hint (Only on Mobile Browser) */}
      {showPWAHint && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[99999] w-[92%] max-w-[400px]">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl flex items-center gap-4">
             <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                <Smartphone size={20} />
             </div>
             <div className="flex-1">
                <p className="text-[11px] font-bold text-white">Install Nexus to Home Screen</p>
                <p className="text-[9px] text-slate-400 font-medium mt-0.5">Required for background reminders on iOS/Android.</p>
             </div>
             <button onClick={() => setShowPWAHint(false)} className="p-1.5 text-slate-600"><X size={16} /></button>
          </div>
        </div>
      )}

      {/* 3. Active Alarm Popups */}
      {activeAlarms.length > 0 && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[100000] flex flex-col gap-3 w-[92%] max-w-[420px]">
          {activeAlarms.map((task) => (
            <div key={task.id} className="bg-[#0f172a] border-2 border-indigo-500 rounded-3xl p-5 shadow-2xl flex items-center justify-between gap-4 animate-slide-up">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="p-3 bg-indigo-500 rounded-2xl text-white">
                  <BellRing size={24} className="animate-ring" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">Mission Critical</p>
                  <p className="text-base font-bold text-white truncate">{task.title}</p>
                </div>
              </div>
              <button 
                onClick={() => stopAlarm(task.id)} 
                className="bg-red-500 text-white font-black text-xs py-4 px-8 rounded-2xl shadow-lg shadow-red-500/30 hover:scale-105 active:scale-95 transition-all"
              >
                DISMISSED
              </button>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes slide-down { from { transform: translate(-50%, -20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
        .animate-slide-down { animation: slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-ring { animation: ring 1.5s infinite ease-in-out; }
        @keyframes ring { 0% { transform: rotate(0); } 10% { transform: rotate(15deg); } 20% { transform: rotate(-15deg); } 30% { transform: rotate(15deg); } 40% { transform: rotate(-15deg); } 100% { transform: rotate(0); } }
      `}</style>
    </>
  );
}
