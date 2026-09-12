import type { Fingering } from "./types";

type Base = { left: Fingering["left"]; right: Fingering["right"]; extras?: string[] };

const base = (left: Fingering["left"], right: Fingering["right"], extras?: string[]): Base => ({ left, right, extras });

const ALL: Fingering["left"] = [true, true, true];
const NONE: Fingering["left"] = [false, false, false];

/** Written alto notes B♭3 (58) through C♯5 (73). Upper octave repeats these with the octave key. */
const BASE_FINGERINGS: Record<number, Base> = {
  58: base(ALL, ALL, ["Low B♭"]),
  59: base(ALL, ALL, ["Low B"]),
  60: base(ALL, ALL, ["Low Do"]),
  61: base(ALL, ALL, ["Low C♯"]),
  62: base(ALL, ALL),
  63: base(ALL, ALL, ["E♭ key"]),
  64: base(ALL, [true, true, false]),
  65: base(ALL, [true, false, false]),
  66: base(ALL, [false, true, false], ["F♯"]),
  67: base(ALL, NONE),
  68: base(ALL, NONE, ["G♯ key"]),
  69: base([true, true, false], NONE),
  70: base([true, false, false], [true, false, false], ["B♭"]),
  71: base([true, false, false], NONE),
  72: base([false, true, false], NONE),
  73: base(NONE, NONE, ["C♯"]),
};

export const LOWEST_WRITTEN_MIDI = 58;
export const HIGHEST_WRITTEN_MIDI = 85;

export function fingeringForWrittenMidi(writtenMidi: number): Fingering | null {
  const octave = writtenMidi >= 74;
  const key = octave ? writtenMidi - 12 : writtenMidi;
  const found = BASE_FINGERINGS[key];
  if (!found) return null;
  return { left: found.left, right: found.right, octave, palm: false, side: Boolean(found.extras?.length), extras: found.extras };
}

export function isPlayableWrittenMidi(writtenMidi: number) {
  return fingeringForWrittenMidi(writtenMidi) !== null;
}
