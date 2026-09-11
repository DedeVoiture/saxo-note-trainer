import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { exercises } from "@/exercises/exerciseRegistry";

export const Route = createFileRoute("/exercises/")({
  head: () => ({ meta: [
    { title: "Exercises — Alto Practice Studio" }, { name: "description", content: "Choose a focused alto saxophone practice exercise." },
    { property: "og:title", content: "Exercises — Alto Practice Studio" }, { property: "og:description", content: "Choose a focused alto saxophone practice exercise." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: ExercisesPage,
});

function ExercisesPage() {
  return <main className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-8 sm:py-20"><p className="eyebrow">Practice library</p><h1 className="mt-3 max-w-2xl font-display text-5xl leading-tight sm:text-7xl">Focused exercises. Less fiddling.</h1><p className="mt-5 max-w-xl leading-7 text-muted-foreground">Choose a session and spend your time playing. New modules will join this library without changing your routine.</p><div className="mt-12 grid gap-4 sm:grid-cols-2">{exercises.map(({ id, title, description, route, icon: Icon, status }) => <Link key={id} to={route} className="frost-panel group p-6 transition-transform hover:-translate-y-0.5"><div className="flex items-center justify-between"><span className="grid size-11 place-items-center rounded-lg bg-primary text-primary-foreground"><Icon className="size-5" /></span><span className="text-xs font-semibold text-success">{status}</span></div><h2 className="mt-8 font-display text-3xl">{title}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p><span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold">Open exercise <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span></Link>)}<div className="rounded-lg border border-dashed border-border p-6 text-muted-foreground"><LockKeyhole className="size-5" /><p className="mt-8 font-display text-2xl text-foreground">More exercises</p><p className="mt-2 text-sm">Intervals, scales, rhythm, and sight-reading are coming next.</p></div></div></main>;
}