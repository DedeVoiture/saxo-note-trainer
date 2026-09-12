import { useRef, useState } from "react";
import { FileMusic, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatFileSize, isMidiFile } from "@/song/midiImport";

export function MidiDropzone({ onFile, busy, file, error }: { onFile: (file: File) => void; busy: boolean; file: File | null; error: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const accept = (candidate: File | undefined) => {
    if (!candidate) return;
    if (!isMidiFile(candidate)) {
      setLocalError("That file isn’t a MIDI file. Choose a .mid or .midi file.");
      return;
    }
    setLocalError(null);
    onFile(candidate);
  };

  return (
    <div>
      <div
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); accept(event.dataTransfer.files[0]); }}
        className={cn("frost-panel grid place-items-center px-6 py-14 text-center transition-colors", dragging && "border-primary bg-primary/5")}
      >
        <Upload className="size-7 text-primary" />
        <p className="mt-5 font-display text-2xl">Drop your MIDI file here</p>
        <p className="mt-2 text-sm text-muted-foreground">or</p>
        <Button className="mt-4" onClick={() => inputRef.current?.click()} disabled={busy}>Choose file</Button>
        <p className="mt-4 text-xs text-muted-foreground">.mid / .midi</p>
        <input ref={inputRef} type="file" accept=".mid,.midi,audio/midi" className="sr-only" aria-label="Choose a MIDI file" onChange={(event) => accept(event.target.files?.[0])} />
      </div>
      {file && (
        <div className="mt-5 flex items-center gap-3 rounded-lg border border-border/70 bg-surface/60 p-4 backdrop-blur-md">
          <FileMusic className="size-5 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}{busy ? " · Analyzing your song…" : ""}</p>
          </div>
        </div>
      )}
      {(error ?? localError) && <p role="alert" className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error ?? localError}</p>}
    </div>
  );
}
