import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Eye, EyeOff, Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioInputSelector } from "@/components/sax/AudioInputSelector";
import { ExerciseStats } from "@/components/sax/ExerciseStats";
import { FingeringDiagram } from "@/components/sax/FingeringDiagram";
import { LivePitchDisplay } from "@/components/sax/LivePitchDisplay";
import { usePitchInput } from "@/audio/usePitchInput";
import { beginnerNotes } from "@/music/altoSaxophone";
import { centsBetween, frequencyToWrittenAlto } from "@/music/altoSaxophone";
import { usePracticeSettings } from "@/settings/settingsStore";
import { emptyStats, pickRandomNote, type SessionStats } from "./logic";

export function NoteRecognitionPage() {
  const { settings, updateSettings } = usePracticeSettings();
  const [target, setTarget] = useState(() => beginnerNotes[0]);
  const [active, setActive] = useState(false);
  const [stats, setStats] = useState<SessionStats>(emptyStats);
  const [frequency, setFrequency] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);
  const stableSince = useRef<number | null>(null);
  const lastAttempt = useRef<number | null>(null);
  const lockedUntil = useRef(0);

  const handleFrequency = useCallback((value: number | null) => setFrequency(value), []);
  const { devices, state, error, start, stop } = usePitchInput(settings.deviceId, handleFrequency);

  const begin = async () => {
    const next = pickRandomNote(beginnerNotes);
    if (!next) return;
    setTarget(next);
    setStats(emptyStats);
    stableSince.current = null;
    lastAttempt.current = null;
    const started = await start();
    setActive(started);
  };

  const end = async () => {
    await stop();
    setActive(false);
    setFrequency(null);
    setSuccess(false);
  };

  useEffect(() => {
    if (!active || frequency === null || !target || Date.now() < lockedUntil.current) {
      stableSince.current = null;
      return;
    }
    const detected = frequencyToWrittenAlto(frequency);
    const centsToTarget = centsBetween(frequency, target.concertFrequency);
    const isTarget = detected.writtenMidi === target.writtenMidi && Math.abs(centsToTarget) <= settings.pitchTolerance;
    if (!isTarget) {
      stableSince.current = null;
      if (lastAttempt.current !== detected.writtenMidi) {
        lastAttempt.current = detected.writtenMidi;
        setStats((current) => ({ ...current, attempts: current.attempts + 1, streak: 0 }));
      }
      return;
    }
    if (stableSince.current === null) {
      stableSince.current = performance.now();
      return;
    }
    if (performance.now() - stableSince.current < settings.stabilityMs) return;
    lockedUntil.current = Date.now() + 1400;
    stableSince.current = null;
    lastAttempt.current = null;
    setSuccess(true);
    setStats((current) => ({ correct: current.correct + 1, attempts: current.attempts + 1, streak: current.streak + 1 }));
    const timeout = window.setTimeout(() => {
      setSuccess(false);
      setTarget((current) => pickRandomNote(beginnerNotes, current?.id));
    }, 1100);
    return () => window.clearTimeout(timeout);
  }, [active, frequency, settings.pitchTolerance, settings.stabilityMs, target]);

  useEffect(() => () => { void stop(); }, [stop]);

  const live = frequency === null ? null : { ...frequencyToWrittenAlto(frequency), frequency };
  const statusCopy = success ? "Correct — next note" : state === "initializing" ? "Starting audio…" : state === "no-signal" ? "Play a note to begin" : state === "listening" ? "Listening…" : "Audio detection inactive";

  if (!active) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Exercises / Note Recognition</p>
          <h1 className="mt-4 font-display text-5xl leading-tight sm:text-7xl">Play what you see.</h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-muted-foreground">Read the written note, play it on your E♭ alto saxophone, and move forward automatically when the pitch settles.</p>
        </div>
        <section className="frost-panel mx-auto mt-12 max-w-xl p-6 sm:p-8" aria-label="Exercise setup">
          <AudioInputSelector devices={devices} value={settings.deviceId} onChange={(deviceId) => updateSettings({ deviceId })} />
          <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-5"><div><p className="text-sm font-semibold">Fingering assistance</p><p className="mt-1 text-xs text-muted-foreground">Show the key pattern while you play.</p></div><Button variant="outline" size="sm" onClick={() => updateSettings({ showFingering: !settings.showFingering })}>{settings.showFingering ? <Eye className="size-4" /> : <EyeOff className="size-4" />}{settings.showFingering ? "Shown" : "Hidden"}</Button></div>
          {error && <p className="mt-5 rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</p>}
          <Button size="lg" className="mt-7 w-full" onClick={() => void begin()}><Mic className="size-4" />Start Exercise</Button>
          <p className="mt-4 text-center text-xs text-muted-foreground">Your audio stays on this device and is never uploaded.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-8 sm:py-10">
      <div className="mb-6 flex items-end justify-between"><div><p className="eyebrow">Exercises / Note Recognition</p><h1 className="mt-1 font-display text-2xl sm:text-3xl">Alto saxophone note recognition</h1></div><span className="hidden rounded-full border border-border/70 bg-surface/55 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-md md:inline">E♭ transposition active</span></div>
      <section className="frost-panel relative overflow-hidden p-5 sm:p-9 lg:p-12">
        <div className="sm:absolute sm:right-8 sm:top-8"><LivePitchDisplay reading={live} state={state} /></div>
        <div className="mx-auto mt-8 max-w-2xl text-center sm:mt-20 lg:mt-24">
          <p className="eyebrow text-primary">Target</p>
          <div key={target?.id} className="note-enter mt-3 font-display text-[clamp(7rem,19vw,14rem)] font-medium leading-none" aria-label={`Target note ${target?.syllable}`}>{target?.syllable}</div>
          <p className="mt-4 text-sm text-muted-foreground">Written {target?.writtenPitch} · Concert {target?.concertPitch} · {Math.round(target?.concertFrequency ?? 0)} Hz</p>
        </div>
        <div className="mx-auto mt-8 max-w-sm sm:mt-10">
          <div className="mb-4 flex items-center justify-between"><span className="eyebrow">Alto fingering</span><Button variant="ghost" size="sm" onClick={() => updateSettings({ showFingering: !settings.showFingering })}>{settings.showFingering ? <EyeOff /> : <Eye />}{settings.showFingering ? "Hide" : "Show"}</Button></div>
          {settings.showFingering ? <FingeringDiagram fingering={target?.fingering ?? beginnerNotes[0]!.fingering} /> : <div className="grid h-40 place-items-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">Memory mode</div>}
        </div>
        <div className="mt-7 flex min-h-9 items-center justify-center gap-2.5" aria-live="polite">{success ? <><Check className="success-pop size-5 text-success" /><span className="font-semibold text-success">Correct!</span></> : <><span className={state === "listening" ? "size-2.5 animate-pulse rounded-full bg-success" : "size-2.5 rounded-full bg-muted-foreground/50"} /><span className="text-sm font-medium">{statusCopy}</span></>}</div>
        <div className="mt-8 flex flex-col gap-7 border-t border-border/70 pt-7 sm:flex-row sm:items-end sm:justify-between"><ExerciseStats stats={stats} /><div className="flex gap-2"><Button variant="outline" onClick={() => updateSettings({ showFingering: !settings.showFingering })}>{settings.showFingering ? <EyeOff /> : <Eye />}</Button><Button onClick={() => void end()}><Square className="size-3 fill-current" />Stop Exercise</Button></div></div>
      </section>
      <p className="mt-5 text-center text-xs text-muted-foreground">Advances automatically · tolerance ±{settings.pitchTolerance} cents · stability {settings.stabilityMs} ms</p>
    </main>
  );
}
