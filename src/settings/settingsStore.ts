import { useEffect, useState } from "react";

export type PracticeSettings = {
  deviceId: string;
  showFingering: boolean;
  pitchTolerance: number;
  stabilityMs: number;
};

const STORAGE_KEY = "alto-practice-settings";
export const defaultSettings: PracticeSettings = { deviceId: "default", showFingering: true, pitchTolerance: 50, stabilityMs: 180 };

export function usePracticeSettings() {
  const [settings, setSettings] = useState<PracticeSettings>(defaultSettings);
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setSettings({ ...defaultSettings, ...JSON.parse(saved) });
    } catch { /* Browser storage may be unavailable. */ }
  }, []);
  const updateSettings = (patch: Partial<PracticeSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Preference remains active for this visit. */ }
      return next;
    });
  };
  return { settings, updateSettings };
}
