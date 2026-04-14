import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors, ThemeColors } from './index';

interface ThemeContextValue {
  colors: ThemeColors;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: darkColors,
  theme: 'dark',
  toggleTheme: () => {},
});

const THEME_KEY = '@numrush_settings';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Read saved theme from settings
    AsyncStorage.getItem(THEME_KEY).then((raw) => {
      if (raw) {
        try {
          const settings = JSON.parse(raw);
          if (settings.theme === 'light' || settings.theme === 'dark') {
            setTheme(settings.theme);
          }
        } catch {}
      }
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      // Persist in settings
      AsyncStorage.getItem(THEME_KEY).then((raw) => {
        try {
          const settings = raw ? JSON.parse(raw) : {};
          settings.theme = next;
          AsyncStorage.setItem(THEME_KEY, JSON.stringify(settings));
        } catch {}
      });
      return next;
    });
  }, []);

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
