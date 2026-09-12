import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "alto-song-progress";
type ProgressMap = Record<string, string[]>;

function read(): ProgressMap {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as ProgressMap;
  } catch {
    return {};
  }
}

export function useSongProgress(songId: string | null) {
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    if (!songId) return setCompleted([]);
    setCompleted(read()[songId] ?? []);
  }, [songId]);

  const markComplete = useCallback((sectionId: string) => {
    if (!songId) return;
    setCompleted((current) => {
      if (current.includes(sectionId)) return current;
      const next = [...current, sectionId];
      try {
        const all = read();
        all[songId] = next;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      } catch { /* Progress stays for this visit only. */ }
      return next;
    });
  }, [songId]);

  const reset = useCallback(() => {
    if (!songId) return;
    setCompleted([]);
    try {
      const all = read();
      delete all[songId];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch { /* Nothing stored. */ }
  }, [songId]);

  return { completed, markComplete, reset };
}
