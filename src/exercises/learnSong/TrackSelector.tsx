import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Song } from "@/song/types";

export function TrackSelector({ song, value, onChange, onContinue }: { song: Song; value: string | null; onChange: (id: string) => void; onContinue: () => void }) {
  const tracks = song.tracks.filter((track) => !track.isPercussion);
  const list = tracks.length ? tracks : song.tracks;
  return (
    <section className="frost-panel p-6 sm:p-8" aria-label="Track selection">
      <h2 className="font-display text-3xl">Which part do you want to learn?</h2>
      <p className="mt-2 text-sm text-muted-foreground">Percussion parts are left out. The most melodic part is picked for you.</p>
      <div className="mt-6 space-y-2" role="radiogroup" aria-label="Available parts">
        {list.map((track) => (
          <button
            key={track.id}
            role="radio"
            aria-checked={value === track.id}
            onClick={() => onChange(track.id)}
            className={cn("flex w-full items-center gap-3 rounded-lg border border-border/70 bg-surface/50 p-4 text-left transition-colors hover:border-primary/60", value === track.id && "border-primary bg-primary/5")}
          >
            <span className={cn("grid size-4 shrink-0 place-items-center rounded-full border", value === track.id ? "border-primary" : "border-border")}>{value === track.id && <span className="size-2 rounded-full bg-primary" />}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{track.name}</span>
              <span className="block text-xs text-muted-foreground">{track.instrument} · {track.notes.length} notes · {track.measures} measures</span>
            </span>
          </button>
        ))}
      </div>
      <Button className="mt-6 w-full" size="lg" disabled={!value} onClick={onContinue}>Continue</Button>
    </section>
  );
}
