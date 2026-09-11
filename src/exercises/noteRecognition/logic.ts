import type { SaxNote } from "@/music/types";

export function pickRandomNote(notes: SaxNote[], previousId?: string) {
  const candidates = notes.length > 1 ? notes.filter((note) => note.id !== previousId) : notes;
  return candidates[Math.floor(Math.random() * candidates.length)] ?? notes[0];
}

export type SessionStats = { correct: number; attempts: number; streak: number };
export const emptyStats: SessionStats = { correct: 0, attempts: 0, streak: 0 };
export const accuracy = (stats: SessionStats) => stats.attempts === 0 ? 0 : Math.round((stats.correct / stats.attempts) * 100);
