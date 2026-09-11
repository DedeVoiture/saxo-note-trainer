import { Radio } from "lucide-react";
import type { AudioState } from "@/audio/usePitchInput";

type LiveReading = { writtenName: string; concertName: string; frequency: number; cents: number } | null;
export function LivePitchDisplay({ reading, state }: { reading: LiveReading; state: AudioState }) {
  return (
    <aside className="w-full rounded-lg border border-border/70 bg-surface/65 p-4 shadow-frost backdrop-blur-xl sm:w-44" aria-label="Live detected note" aria-live="polite">
      <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase text-muted-foreground">Live</span><Radio className={state === "listening" ? "size-4 animate-pulse text-success" : "size-4 text-muted-foreground"} /></div>
      <div className="mt-3 font-display text-5xl leading-none">{reading?.writtenName ?? "—"}</div>
      <div className="mt-3 min-h-9 text-[11px] leading-5 text-muted-foreground">
        {reading ? <><div>Concert {reading.concertName} · {Math.round(reading.frequency)} Hz</div><div className="font-semibold text-foreground">{reading.cents >= 0 ? "+" : ""}{Math.round(reading.cents)} cents</div></> : <div>No clear signal</div>}
      </div>
    </aside>
  );
}
