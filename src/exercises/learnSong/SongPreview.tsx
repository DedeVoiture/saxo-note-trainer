import { Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/song/midiImport";
import { useSectionPlayer } from "@/song/sectionPlayer";
import type { Section, Song, SongNote, SongTrack } from "@/song/types";

export function SongPreview({ song, track, notes, sections, onStart, onBack }: { song: Song; track: SongTrack; notes: SongNote[]; sections: Section[]; onStart: () => void; onBack: () => void }) {
  const { play, stop, playing } = useSectionPlayer();
  const facts = [
    ["Tempo", `${song.tempo} BPM`],
    ["Time signature", song.timeSignature],
    ["Key", song.keySignature ?? "Not specified"],
    ["Length", formatDuration(song.durationSeconds)],
  ] as const;
  const outOfRange = notes.filter((note) => note.outOfRange).length;

  return (
    <section className="frost-panel p-6 sm:p-8" aria-label="Song preview">
      <h2 className="font-display text-3xl">{song.title}</h2>
      <dl className="mt-6 grid gap-4 sm:grid-cols-4">
        {facts.map(([label, value]) => (
          <div key={label}><dt className="text-[10px] font-semibold uppercase text-muted-foreground">{label}</dt><dd className="mt-1 text-sm font-semibold">{value}</dd></div>
        ))}
      </dl>
      <div className="mt-7 border-t border-border/70 pt-6">
        <p className="text-sm font-semibold">{track.name}</p>
        <p className="mt-1 text-xs text-muted-foreground">{notes.length} notes · {track.measures} measures · {sections.length} passages · written for E♭ alto</p>
        <p className="mt-5 text-[10px] font-semibold uppercase text-muted-foreground">Melody in written solfège</p>
        <p className="mt-2 flex flex-wrap gap-x-3 gap-y-2 font-display text-xl leading-none">
          {notes.slice(0, 48).map((note) => <span key={note.index} className={note.outOfRange ? "text-muted-foreground/60" : undefined}>{note.solfege}</span>)}
          {notes.length > 48 && <span className="text-sm text-muted-foreground">+{notes.length - 48} more</span>}
        </p>
        {outOfRange > 0 && <p className="mt-4 text-xs text-muted-foreground">{outOfRange} notes fall outside the practice range and will be skipped.</p>}
      </div>
      <div className="mt-7 flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" onClick={() => (playing ? stop() : play(notes.slice(0, 24), 1))}>{playing ? <Square className="size-3 fill-current" /> : <Play className="size-4" />}{playing ? "Stop preview" : "Hear the opening"}</Button>
        <Button className="sm:flex-1" size="lg" onClick={() => { stop(); onStart(); }}>Start learning</Button>
        <Button variant="ghost" onClick={() => { stop(); onBack(); }}>Choose another part</Button>
      </div>
    </section>
  );
}
