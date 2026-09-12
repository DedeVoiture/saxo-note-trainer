import midiPackage from "@tonejs/midi";
const { Midi } = midiPackage;
import type { NoteEvent, Song, SongTrack } from "./types";

export const ACCEPTED_MIDI_EXTENSIONS = [".mid", ".midi"];

export function isMidiFile(file: File) {
  return ACCEPTED_MIDI_EXTENSIONS.some((extension) => file.name.toLowerCase().endsWith(extension));
}

const KEY_NAMES: Record<string, string> = { major: "major", minor: "minor" };

function melodyScore(notes: NoteEvent[], isPercussion: boolean) {
  if (isPercussion || notes.length < 4) return 0;
  const average = notes.reduce((sum, note) => sum + note.concertMidi, 0) / notes.length;
  let overlaps = 0;
  for (let i = 1; i < notes.length; i += 1) {
    const previous = notes[i - 1]!;
    const current = notes[i]!;
    if (current.startTime < previous.startTime + previous.duration - 0.02) overlaps += 1;
  }
  const monophonic = 1 - overlaps / notes.length;
  const registerFit = Math.max(0, 1 - Math.abs(average - 68) / 24);
  const density = Math.min(1, notes.length / 60);
  return monophonic * 0.6 + registerFit * 0.25 + density * 0.15;
}

export async function parseMidiFile(file: File): Promise<Song> {
  const buffer = await file.arrayBuffer();
  const midi = new Midi(buffer);
  const tempo = Math.round(midi.header.tempos[0]?.bpm ?? 120);
  const signature = midi.header.timeSignatures[0]?.timeSignature ?? [4, 4];
  const beatsPerMeasure = signature[0] ?? 4;
  const beatUnit = signature[1] ?? 4;
  const key = midi.header.keySignatures[0];
  const ppq = midi.header.ppq || 480;
  const ticksPerMeasure = ppq * beatsPerMeasure * (4 / beatUnit);

  const tracks: SongTrack[] = midi.tracks
    .map((track, trackIndex) => {
      const isPercussion = track.channel === 9;
      const notes: NoteEvent[] = track.notes.map((note) => {
        const measure = Math.floor(note.ticks / ticksPerMeasure) + 1;
        const beat = ((note.ticks % ticksPerMeasure) / ticksPerMeasure) * beatsPerMeasure + 1;
        return {
          concertMidi: note.midi,
          startTime: note.time,
          duration: note.duration,
          velocity: note.velocity,
          measure,
          beat: Math.round(beat * 100) / 100,
        };
      });
      const measures = notes.length ? Math.max(...notes.map((note) => note.measure)) : 0;
      return {
        id: `track-${trackIndex}`,
        name: track.name?.trim() || `Track ${trackIndex + 1}`,
        instrument: track.instrument?.name ?? "unknown",
        isPercussion,
        notes,
        measures,
        melodyScore: melodyScore(notes, isPercussion),
      };
    })
    .filter((track) => track.notes.length > 0);

  return {
    id: `${file.name}-${file.size}`,
    title: midi.header.name?.trim() || file.name.replace(/\.midi?$/i, ""),
    tempo,
    timeSignature: `${beatsPerMeasure}/${beatUnit}`,
    keySignature: key ? `${key.key} ${KEY_NAMES[key.scale] ?? key.scale}` : null,
    durationSeconds: midi.duration,
    tracks,
  };
}

export function suggestedTrackId(song: Song) {
  const candidates = song.tracks.filter((track) => !track.isPercussion);
  const best = [...candidates].sort((a, b) => b.melodyScore - a.melodyScore)[0];
  return best?.id ?? song.tracks[0]?.id ?? null;
}

export function formatDuration(seconds: number) {
  const total = Math.max(0, Math.round(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}