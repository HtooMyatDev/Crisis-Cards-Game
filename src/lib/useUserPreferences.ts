"use client"
import { useEffect, useState } from 'react';

export type UserPreferences = {
  theme: 'system' | 'light' | 'dark';
  sound: boolean;
  animations: boolean;
};

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  sound: true,
  animations: true,
};

const STORAGE_KEY = 'ccg_user_preferences_v1';

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<UserPreferences>;
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch (_) {
      // ignore parse errors, fall back to defaults
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (_) {}
  }, [preferences, loaded]);

  return {
    preferences,
    setPreferences,
    loaded,
  };
}
