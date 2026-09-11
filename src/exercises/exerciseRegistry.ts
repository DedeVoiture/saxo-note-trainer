import { AudioLines } from "lucide-react";

export const exercises = [{
  id: "note-recognition",
  title: "Note Recognition",
  description: "Play the written note and let the console hear when it rings true.",
  route: "/exercises/note-recognition" as const,
  icon: AudioLines,
  status: "Ready",
}];
