import type { Fingering } from "@/music/types";

export type NoteEvent = {
  concertMidi: number;
  startTime: number;
  duration: number;
  velocity: number;
  measure: number;
  beat: number;
};

export type SongTrack = {
  id: string;
  name: string;
  instrument: string;
  isPercussion: boolean;
  notes: NoteEvent[];
  measures: number;
  melodyScore: number;
};

export type Song = {
  id: string;
  title: string;
  tempo: number;
  timeSignature: string;
  keySignature: string | null;
  durationSeconds: number;
  tracks: SongTrack[];
};

/** A note as the alto saxophonist reads and plays it. */
export type SongNote = NoteEvent & {
  index: number;
  writtenMidi: number;
  concertName: string;
  solfege: string;
  concertFrequency: number;
  fingering: Fingering | null;
  outOfRange: boolean;
};

export type Section = {
  id: string;
  index: number;
  label: string;
  fromMeasure: number;
  toMeasure: number;
  notes: SongNote[];
};
