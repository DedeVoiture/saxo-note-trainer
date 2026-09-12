import type { Section, SongNote } from "./types";

const MAX_NOTES = 8;
const MAX_MEASURES = 2;

/** Split a part into short passages, breaking on long rests, measure lines, and note count. */
export function splitIntoSections(notes: SongNote[]): Section[] {
  if (!notes.length) return [];
  const sections: Section[] = [];
  let current: SongNote[] = [];

  const flush = () => {
    if (!current.length) return;
    const first = current[0]!;
    const last = current[current.length - 1]!;
    sections.push({
      id: `section-${sections.length + 1}`,
      index: sections.length,
      label: `Passage ${sections.length + 1}`,
      fromMeasure: first.measure,
      toMeasure: last.measure,
      notes: current,
    });
    current = [];
  };

  for (const note of notes) {
    if (current.length) {
      const previous = current[current.length - 1]!;
      const gap = note.startTime - (previous.startTime + previous.duration);
      const spannedMeasures = note.measure - current[0]!.measure + 1;
      if (current.length >= MAX_NOTES || spannedMeasures > MAX_MEASURES || gap > 1.2) flush();
    }
    current.push(note);
  }
  flush();
  return sections;
}
