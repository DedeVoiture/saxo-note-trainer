import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Play, Repeat, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FingeringDiagram } from "@/components/sax/FingeringDiagram";
import { LivePitchDisplay } from "@/components/sax/LivePitchDisplay";
import { usePitchInput } from "@/audio/usePitchInput";
import { centsBetween, frequencyToWrittenAlto } from "@/music/altoSaxophone";
import { usePracticeSettings } from "@/settings/settingsStore";
import { useSectionPlayer } from "@/song/sectionPlayer";
import { cn } from "@/lib/utils";
import type { Section } from "@/song/types";

const SPEEDS = [0.5, 0.75, 1];

export function SectionPractice({ sections, sectionIndex, completed, onSectionChange, onSectionComplete, onExit }: {
  sections: Section[];
  sectionIndex: number;
  completed: string[];
  onSectionChange: (index: number) => void;
  onSectionComplete: (sectionId: string) => void;
  onExit: () => void;
}) {
  const { settings, updateSettings } = usePracticeSettings();
  const [frequency, setFrequency] = useState<number | null>(null);
  const [noteIndex, setNoteIndex] = useState(0);
  const [success, setSuccess] = useState(false);
  const [loop, setLoop] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [justFinished, setJustFinished] = useState(false);
  const stableSince = useRef<number | null>(null);
  const awaitingRelease = useRef(false);
  const lockedUntil = useRef(0);

  const handleFrequency = useCallback((value: number | null) => setFrequency(value), []);
  const { state, error, stop } = usePitchInput(settings.deviceId, handleFrequency);
  const { play, stop: stopPlayback, playing } = useSectionPlayer();

  const section = sections[sectionIndex];
  const playable = useMemo(() => section?.notes.filter((note) => !note.outOfRange) ?? [], [section]);
  const target = playable[noteIndex];

  useEffect(() => {
    setNoteIndex(0);
    setSuccess(false);
    setJustFinished(false);
    stableSince.current = null;
    awaitingRelease.current = false;
  }, [sectionIndex]);

  const finishSection = useCallback(() => {
    if (!section) return;
    onSectionComplete(section.id);
    setJustFinished(true);
    window.setTimeout(() => {
      setJustFinished(false);
      if (loop || sectionIndex >= sections.length - 1) setNoteIndex(0);
      else onSectionChange(sectionIndex + 1);
    }, 1400);
  }, [loop, onSectionChange, onSectionComplete, section, sectionIndex, sections.length]);

  useEffect(() => {
    if (justFinished || !target || Date.now() < lockedUntil.current) {
      stableSince.current = null;
      return;
    }
    if (frequency === null) {
      stableSince.current = null;
      awaitingRelease.current = false;
      return;
    }
    if (awaitingRelease.current) return;
    const detected = frequencyToWrittenAlto(frequency);
    const cents = centsBetween(frequency, target.concertFrequency);
    if (detected.writtenMidi !== target.writtenMidi || Math.abs(cents) > settings.pitchTolerance) {
      stableSince.current = null;
      return;
    }
    if (stableSince.current === null) {
      stableSince.current = performance.now();
      return;
    }
    if (performance.now() - stableSince.current < settings.stabilityMs) return;
    stableSince.current = null;
    lockedUntil.current = Date.now() + 350;
    const next = noteIndex + 1;
    const repeats = playable[next]?.writtenMidi === target.writtenMidi;
    awaitingRelease.current = repeats;
    setSuccess(true);
    window.setTimeout(() => setSuccess(false), 500);
    if (next >= playable.length) finishSection();
    else setNoteIndex(next);
  }, [finishSection, frequency, justFinished, noteIndex, playable, settings.pitchTolerance, settings.stabilityMs, target]);

  useEffect(() => () => { void stop(); stopPlayback(); }, [stop, stopPlayback]);

  const live = frequency === null ? null : { ...frequencyToWrittenAlto(frequency), frequency };
  if (!section) return null;
  const progress = playable.length ? Math.round((noteIndex / playable.length) * 100) : 0;

  return (
    <section className="frost-panel p-5 sm:p-8" aria-label="Section practice">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow text-primary">{section.label} of {sections.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Measures {section.fromMeasure}–{section.toMeasure} · {completed.length}/{sections.length} passages mastered</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onSectionChange(Math.max(0, sectionIndex - 1))} disabled={sectionIndex === 0} aria-label="Previous passage"><ChevronLeft className="size-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => onSectionChange(Math.min(sections.length - 1, sectionIndex + 1))} disabled={sectionIndex >= sections.length - 1} aria-label="Next passage"><ChevronRight className="size-4" /></Button>
          <Button size="sm" onClick={() => void onExit()}><Square className="size-3 fill-current" />Stop</Button>
        </div>
      </div>

      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_11rem]">
        <div>
          <div className="flex flex-wrap gap-2" aria-label="Notes in this passage">
            {playable.map((note, index) => (
              <span key={note.index} className={cn("rounded-md border border-border/70 px-2.5 py-1.5 font-display text-lg leading-none", index < noteIndex && "border-success/60 text-success", index === noteIndex && "border-primary bg-primary/10 text-foreground")}>{note.solfege}</span>
            ))}
          </div>
          <div className="mt-8 text-center">
            <p className="eyebrow text-primary">Play</p>
            <div key={`${section.id}-${noteIndex}`} className="note-enter mt-2 font-display text-[clamp(5rem,15vw,10rem)] leading-none" aria-label={`Target note ${target?.solfege ?? "done"}`}>{target?.solfege ?? "✓"}</div>
            {target && <p className="mt-3 text-sm text-muted-foreground">Written note {target.writtenMidi} · concert {target.concertName} · {Math.round(target.concertFrequency)} Hz</p>}
          </div>
        </div>
        <div className="justify-self-center lg:justify-self-end"><LivePitchDisplay reading={live} state={state} /></div>
      </div>

      {settings.showFingering && target?.fingering && <div className="mx-auto mt-8 max-w-sm"><FingeringDiagram fingering={target.fingering} /></div>}

      <div className="mt-6 flex min-h-8 items-center justify-center gap-2.5" aria-live="polite">
        {justFinished ? <><Check className="success-pop size-5 text-success" /><span className="font-semibold text-success">Passage complete!</span></>
          : success ? <><Check className="size-5 text-success" /><span className="font-semibold text-success">Correct</span></>
          : <><span className={state === "listening" ? "size-2.5 animate-pulse rounded-full bg-success" : "size-2.5 rounded-full bg-muted-foreground/50"} /><span className="text-sm">{state === "initializing" ? "Starting audio…" : "Play the highlighted note"}</span></>}
      </div>
      {error && <p role="alert" className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-6">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => (playing ? stopPlayback() : play(section.notes, speed))}>{playing ? <Square className="size-3 fill-current" /> : <Play className="size-4" />}Hear passage</Button>
          <div className="flex items-center gap-1" role="group" aria-label="Practice speed">
            {SPEEDS.map((option) => <Button key={option} size="sm" variant={speed === option ? "default" : "ghost"} onClick={() => setSpeed(option)}>{option === 1 ? "1×" : `${option}×`}</Button>)}
          </div>
          <Button variant={loop ? "default" : "outline"} size="sm" onClick={() => setLoop(!loop)}><Repeat className="size-4" />Loop {loop ? "on" : "off"}</Button>
        </div>
        <Button variant="ghost" size="sm" onClick={() => updateSettings({ showFingering: !settings.showFingering })}>{settings.showFingering ? "Hide fingering" : "Show fingering"}</Button>
      </div>
    </section>
  );
}
