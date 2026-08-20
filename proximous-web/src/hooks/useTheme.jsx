import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'luxury-dark',
  setTheme: () => null,
  toggleTheme: () => null,
  isDark: true,
});

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('proximous-theme');
      if (savedTheme === 'luxury-light' || savedTheme === 'luxury-dark') {
        return savedTheme;
      }
      // Check system preference default
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'luxury-light';
      }
    } catch (e) {
      console.warn('Unable to access localStorage for theme preference', e);
    }
    return 'luxury-dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Clean existing theme classes
    root.classList.remove('light', 'dark', 'luxury-light', 'luxury-dark');

    if (theme === 'luxury-dark') {
      root.classList.add('dark', 'luxury-dark');
    } else {
      root.classList.add('light', 'luxury-light');
    }

    try {
      localStorage.setItem('proximous-theme', theme);
    } catch (e) {
      console.warn('Unable to save theme to localStorage', e);
    }
  }, [theme]);

  const setTheme = (newTheme) => {
    if (newTheme === 'luxury-dark' || newTheme === 'luxury-light') {
      setThemeState(newTheme);
      try {
        const token = localStorage.getItem('proximous_token');
        if (token) {
          import('../lib/api').then(({ usersAPI }) => {
            usersAPI.updateProfile({ theme_preference: newTheme === 'luxury-light' ? 'light' : 'dark' }).catch(() => {});
          });
        }
      } catch (e) {}
    }
  };

  const toggleTheme = () => {
    const next = theme === 'luxury-dark' ? 'luxury-light' : 'luxury-dark';
    setTheme(next);
  };

  const isDark = theme === 'luxury-dark';

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
