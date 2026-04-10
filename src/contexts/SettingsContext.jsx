import { createContext, useContext, useEffect, useState } from 'react';

const SettingsContext = createContext();

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }) {
  const [operatorName, setOperatorName] = useState(() => localStorage.getItem('nexus_operator') || '');
  const [theme, setTheme] = useState(() => localStorage.getItem('nexus_theme') || 'dark');
  const [focusDuration, setFocusDuration] = useState(() => Number(localStorage.getItem('nexus_focus')) || 25);
  const [breakDuration, setBreakDuration] = useState(() => Number(localStorage.getItem('nexus_break')) || 5);

  useEffect(() => {
    localStorage.setItem('nexus_operator', operatorName);
    localStorage.setItem('nexus_theme', theme);
    localStorage.setItem('nexus_focus', focusDuration);
    localStorage.setItem('nexus_break', breakDuration);

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [operatorName, theme, focusDuration, breakDuration]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const value = {
    operatorName, setOperatorName,
    theme, toggleTheme,
    focusDuration, setFocusDuration,
    breakDuration, setBreakDuration
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
