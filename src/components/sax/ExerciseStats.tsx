import { accuracy, type SessionStats } from "@/exercises/noteRecognition/logic";
export function ExerciseStats({ stats }: { stats: SessionStats }) {
  const items = [["Correct", stats.correct], ["Attempts", stats.attempts], ["Streak", stats.streak], ["Accuracy", `${accuracy(stats)}%`]];
  return <dl className="grid grid-cols-4 gap-3">{items.map(([label, value]) => <div key={label} className="min-w-0"><dt className="truncate text-[10px] font-semibold uppercase text-muted-foreground">{label}</dt><dd className="mt-1 font-display text-2xl leading-none">{value}</dd></div>)}</dl>;
}
