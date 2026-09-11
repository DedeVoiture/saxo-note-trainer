import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/exercises")({
  head: () => ({ meta: [
    { title: "Exercises — Alto Practice Studio" }, { name: "description", content: "Choose a focused alto saxophone practice exercise." },
    { property: "og:title", content: "Exercises — Alto Practice Studio" }, { property: "og:description", content: "Choose a focused alto saxophone practice exercise." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: ExercisesLayout,
});
function ExercisesLayout() { return <Outlet />; }
