import { useCallback, useEffect, useRef, useState } from "react";
import type { SongNote } from "./types";

/** Plays a passage back as simple reference tones, at the chosen practice speed. */
export function useSectionPlayer() {
  const contextRef = useRef<AudioContext | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);

  const stop = useCallback(() => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    const context = contextRef.current;
    contextRef.current = null;
    if (context && context.state !== "closed") void context.close();
    setPlaying(false);
  }, []);

  const play = useCallback((notes: SongNote[], speed: number) => {
    stop();
    if (!notes.length || typeof window === "undefined" || !window.AudioContext) return;
    const context = new AudioContext();
    contextRef.current = context;
    setPlaying(true);
    const origin = notes[0]!.startTime;
    let end = 0;
    for (const note of notes) {
      const start = context.currentTime + 0.15 + (note.startTime - origin) / speed;
      const length = Math.max(0.12, note.duration / speed);
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.value = note.concertFrequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.22, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + length + 0.05);
      end = Math.max(end, start + length);
    }
    timeoutRef.current = window.setTimeout(stop, (end - context.currentTime + 0.2) * 1000);
  }, [stop]);

  // Update playback position periodically while playing
  useEffect(() => {
    if (!playing || !playbackStartRef.current || !contextRef.current) return;

    const interval = setInterval(() => {
      // The interval will keep running even when not playing, but we check playing above
    }, 100); // Update 10 times per second

    return () => clearInterval(interval);
  }, [playing]);

  // Function to get current playback position in the piece's timeline
  const getCurrentPosition = useCallback((): number | null => {
    if (!playing || !playbackStartRef.current || !contextRef.current) return null;

    const context = contextRef.current;
    const elapsed = context.currentTime - playbackStartRef.current;
    // Apply the same 0.15 second offset used in note scheduling
    const adjustedElapsed = Math.max(0, elapsed - 0.15);
    return adjustedElapsed;
  }, [playing]);

  useEffect(() => stop, [stop]);

  return { play, stop, playing, getCurrentPosition };
}
