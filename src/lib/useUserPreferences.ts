import { useState, useEffect } from 'react';

interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  soundEnabled: boolean;
  musicEnabled: boolean;
  reducedMotion: boolean;
}

const defaultPreferences: UserPreferences = {
  theme: 'dark',
  soundEnabled: true,
  musicEnabled: true,
  reducedMotion: false,
};

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem('userPreferences');
    if (stored) {
      try {
        setPreferences({ ...defaultPreferences, ...JSON.parse(stored) });
      } catch (e) {
        console.error('Failed to parse user preferences', e);
      }
    }
    setLoaded(true);
  }, []);

  const updatePreference = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    localStorage.setItem('userPreferences', JSON.stringify(newPreferences));

    // Apply theme immediately if changed
    if (key === 'theme') {
        if (value === 'dark') {
            document.documentElement.classList.add('dark');
        } else if (value === 'light') {
            document.documentElement.classList.remove('dark');
        }
    }
  };

  return {
    preferences,
    updatePreference,
    loaded
  };
}
