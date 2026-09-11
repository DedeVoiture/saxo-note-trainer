import type { Fingering } from "@/music/types";
import { cn } from "@/lib/utils";

function Key({ pressed, label }: { pressed: boolean; label: string }) {
  return <span title={`${label}: ${pressed ? "pressed" : "open"}`} aria-label={`${label} ${pressed ? "pressed" : "open"}`} className={cn("grid size-10 place-items-center rounded-full border transition-colors", pressed ? "border-key-pressed bg-key-pressed" : "border-key bg-key/30")}><span className={cn("size-2.5 rounded-full", pressed ? "bg-background/75" : "bg-key/50")} /></span>;
}

export function FingeringDiagram({ fingering }: { fingering: Fingering }) {
  return (
    <div className="relative mx-auto w-56" role="img" aria-label="Alto saxophone fingering diagram">
      <div className="absolute left-1/2 top-5 h-[230px] w-2 -translate-x-1/2 rounded-full bg-key/45" />
      <div className="absolute left-1/2 top-[225px] h-12 w-24 -translate-x-2 rounded-br-full border-b-[8px] border-r-[8px] border-key/45" />
      <div className="relative grid grid-cols-[1fr_28px_1fr] gap-x-2">
        <div className="flex flex-col items-end gap-3 pt-14">
          {fingering.left.map((pressed, index) => <Key key={`left-${index}`} pressed={pressed} label={`Left ${index + 1}`} />)}
        </div>
        <div className="flex flex-col items-center">
          <span className={cn("mt-1 h-8 w-4 rounded-full border", fingering.octave ? "border-key-pressed bg-key-pressed" : "border-key bg-key/30")} title={`Octave key ${fingering.octave ? "pressed" : "open"}`} />
          <span className="mt-2 h-[214px] w-4 rounded-full border border-key/60 bg-key/15" />
        </div>
        <div className="flex flex-col gap-3 pt-[126px]">
          {fingering.right.map((pressed, index) => <Key key={`right-${index}`} pressed={pressed} label={`Right ${index + 1}`} />)}
        </div>
      </div>
      <div className="mt-4 flex justify-center gap-5 text-[11px] text-muted-foreground"><span className="inline-flex items-center gap-1.5"><span className="size-3 rounded-full bg-key-pressed" />Pressed</span><span className="inline-flex items-center gap-1.5"><span className="size-3 rounded-full border border-key bg-key/30" />Open</span></div>
    </div>
  );
}
