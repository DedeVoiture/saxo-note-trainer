import type { Fingering, SaxNote } from "./types";

export const ALTO_SAX_CONCERT_OFFSET = -9;

export function midiToFrequency(midi: number) {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function writtenToConcertMidi(writtenMidi: number) {
  return writtenMidi + ALTO_SAX_CONCERT_OFFSET;
}

const names = ["Do", "Do♯", "Ré", "Mi♭", "Mi", "Fa", "Fa♯", "Sol", "Sol♯", "La", "Si♭", "Si"];

export function midiToFrenchName(midi: number) {
  const normalized = ((midi % 12) + 12) % 12;
  return names[normalized] ?? "—";
}

export function frequencyToMidi(frequency: number) {
  return 69 + 12 * Math.log2(frequency / 440);
}

export function centsBetween(frequency: number, targetFrequency: number) {
  return 1200 * Math.log2(frequency / targetFrequency);
}

export function frequencyToWrittenAlto(frequency: number) {
  const concertMidiFloat = frequencyToMidi(frequency);
  const concertMidi = Math.round(concertMidiFloat);
  const writtenMidi = concertMidi - ALTO_SAX_CONCERT_OFFSET;
  return {
    writtenMidi,
    writtenName: midiToFrenchName(writtenMidi),
    concertName: midiToFrenchName(concertMidi),
    cents: (concertMidiFloat - concertMidi) * 100,
  };
}

const fingering = (left: Fingering["left"], right: Fingering["right"], octave: boolean): Fingering => ({
  left,
  right,
  octave,
  palm: false,
  side: false,
});

const rawNotes = [
  ["re4", "Ré", "D4", 62, "Fa 3", fingering([true, true, true], [true, true, true], false)],
  ["mi4", "Mi", "E4", 64, "Sol 3", fingering([true, true, true], [true, true, false], false)],
  ["fa4", "Fa", "F4", 65, "La♭ 3", fingering([true, true, true], [true, false, false], false)],
  ["sol4", "Sol", "G4", 67, "Si♭ 3", fingering([true, true, true], [false, false, false], false)],
  ["la4", "La", "A4", 69, "Do 4", fingering([true, true, false], [false, false, false], false)],
  ["si4", "Si", "B4", 71, "Ré 4", fingering([true, false, false], [false, false, false], false)],
  ["do5", "Do", "C5", 72, "Mi♭ 4", fingering([false, true, false], [false, false, false], false)],
  ["re5", "Ré", "D5", 74, "Fa 4", fingering([true, true, true], [true, true, true], true)],
  ["mi5", "Mi", "E5", 76, "Sol 4", fingering([true, true, true], [true, true, false], true)],
  ["fa5", "Fa", "F5", 77, "La♭ 4", fingering([true, true, true], [true, false, false], true)],
  ["sol5", "Sol", "G5", 79, "Si♭ 4", fingering([true, true, true], [false, false, false], true)],
] as const;

export const beginnerNotes: SaxNote[] = rawNotes.map(([id, syllable, writtenPitch, writtenMidi, concertPitch, keys]) => {
  const concertMidi = writtenToConcertMidi(writtenMidi);
  return { id, syllable, writtenPitch, writtenMidi, concertPitch, concertMidi, concertFrequency: midiToFrequency(concertMidi), fingering: keys };
});
