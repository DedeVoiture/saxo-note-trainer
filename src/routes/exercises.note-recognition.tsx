import { createFileRoute } from "@tanstack/react-router";
import { NoteRecognitionPage } from "@/exercises/noteRecognition/NoteRecognitionPage";

export const Route = createFileRoute("/exercises/note-recognition")({
  head: () => ({ meta: [
    { title: "Note Recognition — Alto Practice Studio" },
    { name: "description", content: "Practice written alto saxophone notes with live pitch recognition and fingering guidance." },
    { property: "og:title", content: "Note Recognition — Alto Practice Studio" },
    { property: "og:description", content: "Practice written alto saxophone notes with live pitch recognition and fingering guidance." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: NoteRecognitionPage,
});
