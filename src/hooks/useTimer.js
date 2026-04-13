import { useState, useEffect, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';

export function useTimer(onComplete) {
  const { focusDuration, breakDuration } = useSettings();
  
  const [mode, setMode] = useState('focus'); // 'focus' or 'break'
  const [timeLeft, setTimeLeft] = useState(focusDuration * 60);
  const [isActive, setIsActive] = useState(false);
  
  const timerRef = useRef(null);

  // Sync initial time when setting changes or mode changes
  useEffect(() => {
    setTimeLeft((mode === 'focus' ? focusDuration : breakDuration) * 60);
  }, [focusDuration, breakDuration, mode]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      clearInterval(timerRef.current);
      setIsActive(false);
      // Reset to original duration when finished
      setTimeLeft((mode === 'focus' ? focusDuration : breakDuration) * 60);
      if (onComplete) onComplete(mode);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft, mode, onComplete]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft((mode === 'focus' ? focusDuration : breakDuration) * 60);
  };

  const switchMode = (newMode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft((newMode === 'focus' ? focusDuration : breakDuration) * 60);
  };

  const getFormatTime = () => {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getProgressPct = () => {
    const total = (mode === 'focus' ? focusDuration : breakDuration) * 60;
    return ((total - timeLeft) / total) * 100;
  };

  return { 
    mode, switchMode, 
    isActive, toggleTimer, resetTimer, 
    timeLeft, formatTime: getFormatTime(), 
    progressPct: getProgressPct()
  };
}
