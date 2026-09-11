import { useCallback, useEffect, useRef, useState } from "react";
import { detectPitchYin } from "./pitchDetector";

export type AudioDevice = { deviceId: string; label: string };
export type AudioState = "inactive" | "initializing" | "listening" | "no-signal" | "error";

export function usePitchInput(deviceId: string, onFrequency: (frequency: number | null) => void) {
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [state, setState] = useState<AudioState>("inactive");
  const [error, setError] = useState<string | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const callbackRef = useRef(onFrequency);
  callbackRef.current = onFrequency;

  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    const list = await navigator.mediaDevices.enumerateDevices();
    const inputs = list.filter((item) => item.kind === "audioinput");
    setDevices(inputs.map((item, index) => ({ deviceId: item.deviceId || "default", label: item.label || `Audio input ${index + 1}` })));
  }, []);

  const stop = useCallback(async () => {
    runningRef.current = false;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    const context = contextRef.current;
    contextRef.current = null;
    if (context && context.state !== "closed") await context.close();
    callbackRef.current(null);
    setState("inactive");
  }, []);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.AudioContext) {
      setError("Audio listening isn’t supported in this browser.");
      setState("error");
      return false;
    }
    await stop();
    setState("initializing");
    setError(null);
    try {
      const audioConstraints: MediaTrackConstraints = { echoCancellation: false, noiseSuppression: false, autoGainControl: false };
      if (deviceId !== "default") audioConstraints.deviceId = { exact: deviceId };
      const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
      const context = new AudioContext();
      await context.resume();
      const analyser = context.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0;
      context.createMediaStreamSource(stream).connect(analyser);
      const buffer = new Float32Array(analyser.fftSize);
      contextRef.current = context;
      streamRef.current = stream;
      runningRef.current = true;
      await refreshDevices();
      const history: number[] = [];
      let lastGood: number | null = null;
      let lastGoodAt = 0;
      const HOLD_MS = 320;
      const analyze = () => {
        if (!runningRef.current) return;
        analyser.getFloatTimeDomainData(buffer);
        const reading = detectPitchYin(buffer, context.sampleRate);
        const now = performance.now();
        if (reading) {
          history.push(reading.frequency);
          if (history.length > 5) history.shift();
          const sorted = [...history].sort((a, b) => a - b);
          const median = sorted[Math.floor(sorted.length / 2)] ?? reading.frequency;
          lastGood = median;
          lastGoodAt = now;
          callbackRef.current(median);
          setState("listening");
        } else if (lastGood !== null && now - lastGoodAt < HOLD_MS) {
          callbackRef.current(lastGood);
          setState("listening");
        } else {
          history.length = 0;
          lastGood = null;
          callbackRef.current(null);
          setState("no-signal");
        }
        frameRef.current = requestAnimationFrame(analyze);
      };
      setState("no-signal");
      analyze();
      return true;
    } catch (cause) {
      console.error("Audio input error", cause);
      setError("We can’t access this audio input. Check browser permissions or choose another input.");
      setState("error");
      return false;
    }
  }, [deviceId, refreshDevices, stop]);

  useEffect(() => {
    void refreshDevices();
    const handleChange = () => void refreshDevices();
    navigator.mediaDevices?.addEventListener?.("devicechange", handleChange);
    return () => {
      navigator.mediaDevices?.removeEventListener?.("devicechange", handleChange);
      void stop();
    };
  }, [refreshDevices, stop]);

  return { devices, state, error, start, stop, refreshDevices };
}
