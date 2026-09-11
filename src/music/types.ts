export type Fingering = {
  left: [boolean, boolean, boolean];
  right: [boolean, boolean, boolean];
  octave: boolean;
  palm: boolean;
  side: boolean;
};

export type SaxNote = {
  id: string;
  syllable: "Do" | "Ré" | "Mi" | "Fa" | "Sol" | "La" | "Si";
  writtenPitch: string;
  writtenMidi: number;
  concertPitch: string;
  concertMidi: number;
  concertFrequency: number;
  fingering: Fingering;
};
