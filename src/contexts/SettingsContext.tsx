import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../types';
import { storageService } from '../services';
import { useAuth } from './AuthContext';

interface SettingsContextType {
  settings: AppSettings;
  loading: boolean;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Load settings when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadSettings();
    } else {
      setSettings(DEFAULT_SETTINGS);
      applyTheme(DEFAULT_SETTINGS.theme);
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Apply theme whenever settings change
  useEffect(() => {
    applyTheme(settings.theme);
    applyFontSize(settings.fontSize);
  }, [settings.theme, settings.fontSize]);

  const loadSettings = () => {
    setLoading(true);
    try {
      const loadedSettings = storageService.getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);

    if (isAuthenticated) {
      storageService.saveSettings(newSettings);
    }
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    if (isAuthenticated) {
      storageService.saveSettings(DEFAULT_SETTINGS);
    }
  };

  const applyTheme = (theme: 'light' | 'dark' | 'auto') => {
    const root = document.documentElement;

    if (theme === 'auto') {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark-mode', prefersDark);
    } else {
      root.classList.toggle('dark-mode', theme === 'dark');
    }
  };

  const applyFontSize = (fontSize: 'small' | 'medium' | 'large') => {
    const root = document.documentElement;
    root.setAttribute('data-font-size', fontSize);
  };

  // Listen to system theme changes when in auto mode
  useEffect(() => {
    if (settings.theme !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('auto');

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [settings.theme]);

  const value: SettingsContextType = {
    settings,
    loading,
    updateSettings,
    resetSettings,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
