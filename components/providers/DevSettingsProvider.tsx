'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DevSettings {
  enableAudioMode: boolean;
  enableDeepgram: boolean;
  enableClaude: boolean;
}

interface DevSettingsContextType {
  settings: DevSettings;
  updateSettings: (newSettings: Partial<DevSettings>) => void;
  isDevMode: boolean;
}

const defaultSettings: DevSettings = {
  enableAudioMode: true,
  enableDeepgram: true,
  enableClaude: true
};

const STORAGE_KEY = 'dev_settings';

const DevSettingsContext = createContext<DevSettingsContextType | undefined>(undefined);

export function DevSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<DevSettings>(defaultSettings);
  const [isHydrated, setIsHydrated] = useState(false);

  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

  // Load settings from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && isDevMode) {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setSettings(JSON.parse(stored));
        } catch (error) {
          console.error('Failed to parse dev settings:', error);
        }
      }
      setIsHydrated(true);
    }
  }, [isDevMode]);

  // Save settings to sessionStorage when they change
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined' && isDevMode) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings, isHydrated, isDevMode]);

  const updateSettings = (newSettings: Partial<DevSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const value: DevSettingsContextType = {
    settings,
    updateSettings,
    isDevMode
  };

  return (
    <DevSettingsContext.Provider value={value}>
      {children}
    </DevSettingsContext.Provider>
  );
}

export function useDevSettings() {
  const context = useContext(DevSettingsContext);
  if (!context) {
    throw new Error('useDevSettings must be used within DevSettingsProvider');
  }
  return context;
}
