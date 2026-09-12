import { ALTO_SAX_CONCERT_OFFSET, midiToFrenchName, midiToFrequency } from "@/music/altoSaxophone";
import { fingeringForWrittenMidi } from "@/music/fingerings";
import type { NoteEvent, SongNote } from "./types";

/** Concert pitch from the MIDI file to the note the alto saxophonist actually reads. */
export function concertToWrittenMidi(concertMidi: number) {
  return concertMidi - ALTO_SAX_CONCERT_OFFSET;
}

export function toSongNote(note: NoteEvent, index: number): SongNote {
  const writtenMidi = concertToWrittenMidi(note.concertMidi);
  const fingering = fingeringForWrittenMidi(writtenMidi);
  return {
    ...note,
    index,
    writtenMidi,
    concertName: midiToFrenchName(note.concertMidi),
    solfege: midiToFrenchName(writtenMidi),
    concertFrequency: midiToFrequency(note.concertMidi),
    fingering,
    outOfRange: fingering === null,
  };
}

/** Shift the whole part by octaves until as much of it as possible sits in the playable alto range. */
export function fitToAltoRange(notes: NoteEvent[]) {
  const shifts = [0, 12, -12, 24, -24];
  let bestShift = 0;
  let bestPlayable = -1;
  for (const shift of shifts) {
    const playable = notes.filter((note) => !toSongNote({ ...note, concertMidi: note.concertMidi + shift }, 0).outOfRange).length;
    if (playable > bestPlayable) {
      bestPlayable = playable;
      bestShift = shift;
    }
  }
  return { shift: bestShift, notes: notes.map((note) => ({ ...note, concertMidi: note.concertMidi + bestShift })) };
}

export function toSongNotes(notes: NoteEvent[]) {
  return notes.map((note, index) => toSongNote(note, index));
}
