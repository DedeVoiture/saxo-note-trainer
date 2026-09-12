import { AudioLines, Music4 } from "lucide-react";

export const exercises = [{
  id: "note-recognition",
  title: "Note Recognition",
  description: "Play the written note and let the console hear when it rings true.",
  route: "/exercises/note-recognition" as const,
  icon: AudioLines,
  status: "Ready",
}, {
  id: "learn-a-song",
  title: "Learn a Song",
  description: "Import a MIDI file and learn it passage by passage with fingerings and live detection.",
  route: "/learn-a-song" as const,
  icon: Music4,
  status: "Ready",
}];
