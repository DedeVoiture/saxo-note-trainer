import { createFileRoute } from "@tanstack/react-router";
import { LearnSongPage } from "@/exercises/learnSong/LearnSongPage";

const description = "Import a MIDI file and learn it on E♭ alto saxophone, one short passage at a time, with fingerings and live pitch detection.";

export const Route = createFileRoute("/learn-a-song")({
  head: () => ({ meta: [
    { title: "Learn a Song — Alto Practice Studio" },
    { name: "description", content: description },
    { property: "og:title", content: "Learn a Song — Alto Practice Studio" },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: LearnSongPage,
});
