import { useEffect, useState, useRef } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../contexts/AuthContext';
import { BellRing } from 'lucide-react';

export default function NotificationManager() {
  const { activities, markTaskNotified } = useTasks();
  const { currentUser } = useAuth();
  
  const [activeAlarms, setActiveAlarms] = useState([]);
  const [permission, setPermission] = useState('default');
  const activeAlarmsRef = useRef([]); 
  const lastPushAt = useRef({}); 
  const audioRef = useRef(null);

  // Sync ref
  useEffect(() => {
    activeAlarmsRef.current = activeAlarms;
  }, [activeAlarms]);

  // Sync Permission
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(status => {
        setPermission(status);
        console.log('🔔 [NotificationManager] Permission status updated:', status);
      });
    }
  };

  // 1. Stable Event Listener (Independent of activities)
  useEffect(() => {
    if (!currentUser) return;

    const handleManualAlarm = (e) => {
      const alarmData = e.detail;
      console.log('🔔 [NotificationManager] Event received:', alarmData);
      if (!alarmData) return;

      setActiveAlarms(prev => {
        if (prev.some(a => a.id === alarmData.id)) return prev;
        return [...prev, alarmData];
      });

      // Side Effects
      playAlertSound();
      triggerSystemNotification(`🚨 Nexus Alert: ${alarmData.title}`, alarmData.title, alarmData.id);
    };

    window.addEventListener('nexus:trigger-alarm', handleManualAlarm);
    return () => window.removeEventListener('nexus:trigger-alarm', handleManualAlarm);
  }, [currentUser]);

  // 2. Task Checking Loop
  useEffect(() => {
    if (!currentUser) return;

    const checkInterval = setInterval(() => {
      if (!activities || !Array.isArray(activities)) return;
      const now = new Date();
      const alarmsToTrigger = [];

      activities.forEach(task => {
        // SAFETY: Ignore incomplete or completed tasks
        if (!task || !task.id || task.isCompleted || task.notified30Min) return;
        
        const isTask = task.type === 'task';
        const isEvent = task.type === 'event';
        if (!isTask && !isEvent) return;

        const dateVal = isTask ? task.deadlineDate : task.date;
        const timeVal = isTask ? task.deadlineTime : task.time;
        if (!dateVal || !timeVal) return;

        try {
          const [y, m, d] = dateVal.split('-').map(Number);
          const [hh, mm] = timeVal.split(':').map(Number);
          const deadline = new Date(y, m - 1, d, hh, mm);
          if (isNaN(deadline.getTime())) return;

          const diffMins = (deadline - now) / 60000;

          // SPAM LOGIC: Start at T-15 minutes
          const thresholdMins = 15;
          if (diffMins <= thresholdMins && diffMins > -1440) { // Limit to 24h past
            const lastPush = lastPushAt.current[task.id] || 0;
            const minsSinceLast = (now.getTime() - lastPush) / 60000;
            const isCurrentActive = activeAlarmsRef.current.some(a => a.id === task.id);

            // Trigger if not in UI yet OR it's been 15 minutes since last system notification
            if (!isCurrentActive || minsSinceLast >= 15) {
              lastPushAt.current[task.id] = now.getTime();

              if (!isCurrentActive) {
                console.log('🔔 [NotificationManager] Task/Event Triggered (New):', task.title);
                alarmsToTrigger.push(task);
              } else {
                console.log('🔔 [NotificationManager] Task/Event Spammed:', task.title);
              }

              // Side Effects
              playAlertSound();
              const bodyText = diffMins > 0 
                ? `Upcoming in ${Math.round(diffMins)} mins` 
                : `Active now! Scheduled for ${timeVal}`;
              triggerSystemNotification(`🚨 Nexus Alert: ${task.title}`, bodyText, task.id);
            }
          }
        } catch (e) {
          console.error('🔔 [NotificationManager] Error processing task:', task.id, e);
        }
      });

      if (alarmsToTrigger.length > 0) {
        setActiveAlarms(prev => {
          const reallyNew = alarmsToTrigger.filter(na => !prev.some(p => p.id === na.id));
          return [...prev, ...reallyNew];
        });
      }
    }, 2000);

    return () => clearInterval(checkInterval);
  }, [activities, currentUser]);

  const triggerSystemNotification = (title, body, tag) => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body, tag,
          requireInteraction: true,
          vibrate: [200, 100, 200],
          icon: '/favicon.svg'
        });
      } catch (e) { console.error('Notification failed', e); }
    }
  };

  const playAlertSound = () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
      } else {
        audioRef.current.pause();
      }
      audioRef.current.currentTime = 0;
      audioRef.current.loop = false;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
          playPromise.catch(e => console.warn('Audio play blocked:', e));
      }
    } catch (err) { console.error('Audio play error:', err); }
  };

  const stopAlarm = (taskId) => {
    setActiveAlarms(prev => prev.filter(t => t.id !== taskId));
    if (!taskId.toString().startsWith('pomo-')) {
      markTaskNotified(taskId);
    }
    delete lastPushAt.current[taskId];
  };

  // UI rendering
  return (
    <>
      {/* Permission Reminder */}
      {permission === 'default' && (
        <div style={{
          position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 100000, width: '92%', maxWidth: '350px',
          backgroundColor: '#1d4ed8', color: 'white', padding: '12px 20px', borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: '15px'
        }}>
          <div style={{ flex: 1, fontSize: '12px', fontWeight: 600 }}>
            🔔 Allow notifications to hear the signal.
          </div>
          <button 
            onClick={requestPermission}
            style={{ 
              backgroundColor: 'white', color: '#1d4ed8', border: 'none', 
              padding: '8px 16px', borderRadius: '10px', fontSize: '11px', 
              fontWeight: 800, cursor: 'pointer' 
            }}>
            Enable
          </button>
        </div>
      )}

      {activeAlarms.length > 0 && (
        <div style={{
          position: 'fixed', bottom: '110px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 99999, display: 'flex', flexDirection: 'column', gap: '12px', width: '92%', maxWidth: '400px',
          pointerEvents: 'none'
        }}>
          {activeAlarms.map((task) => (
            <div key={task.id} className="animate-slide-up" style={{
              backgroundColor: '#0f172a', color: 'white', padding: '20px', borderRadius: '24px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)', 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              pointerEvents: 'auto', border: '1px solid #3b82f6', gap: '15px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1, minWidth: 0 }}>
                <div style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', padding: '12px', borderRadius: '16px' }}>
                  <BellRing size={24} className="animate-ring" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '11px', fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase' }}>
                    {task.type === 'pomodoro' ? 'Timer' : task.type === 'event' ? 'Event (~30m)' : 'Deadline'}
                  </p>
                  <p style={{ fontSize: '15px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.title}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => stopAlarm(task.id)} 
                className="hover:scale-105 active:scale-95 transition-all" 
                style={{
                  background: '#ef4444', color: 'white', border: 'none', borderRadius: '15px',
                  padding: '12px 24px', fontSize: '14px', fontWeight: 900, cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(239,68,68,0.4)', textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                }}>
                STOP
              </button>
            </div>
          ))}
        </div>
      )}
      <style>{`
        @keyframes ring { 0% { transform: rotate(0); } 10% { transform: rotate(15deg); } 20% { transform: rotate(-15deg); } 30% { transform: rotate(15deg); } 40% { transform: rotate(-15deg); } 50% { transform: rotate(0); } 100% { transform: rotate(0); } }
        .animate-ring { animation: ring 1.5s infinite ease-in-out; }
        .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </>
  );
}
