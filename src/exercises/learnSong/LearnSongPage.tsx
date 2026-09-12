import { useCallback, useState } from "react";
import { MidiDropzone } from "./MidiDropzone";
import { TrackSelector } from "./TrackSelector";
import { SongPreview } from "./SongPreview";
import { SectionPractice } from "./SectionPractice";
import { Button } from "@/components/ui/button";
import { parseMidiFile, suggestedTrackId } from "@/song/midiImport";
import { splitIntoSections } from "@/song/sections";
import { toSongNotes, fitToAltoRange } from "@/song/transpose";
import type { Song, SongNote, Section } from "@/song/types";

export function LearnSongPage() {
  const [file, setFile] = useState<File | null>(null);
  const [song, setSong] = useState<Song | null>(null);
  const [trackId, setTrackId] = useState<string | null>(null);
  const [notes, setNotes] = useState<SongNote[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [step, setStep] = useState<"import" | "track" | "preview" | "practice" | "complete">("import");
  const [error, setError] = useState<string | null>(null);
  const [sectionIndex, setSectionIndex] = useState(0);

  const handleFile = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setSong(null);
    setTrackId(null);
    setNotes([]);
    setSections([]);
    setCompleted([]);
    setStep("import");
    setError(null);

    try {
      const parsedSong = await parseMidiFile(selectedFile);
      setSong(parsedSong);

      // Auto-select the best track (non-percussion with highest melody score)
      const suggestedId = suggestedTrackId(parsedSong);
      if (suggestedId) {
        setTrackId(suggestedId);
      } else if (parsedSong.tracks.length > 0) {
        setTrackId(parsedSong.tracks[0].id);
      }

      setStep("track");
    } catch (err: any) {
      console.error("MIDI parsing error:", err);

      // Provide more specific error messages based on the error
      let errorMessage = "Failed to parse MIDI file. Please try another file.";

      if (err.message) {
        const msg = err.message.toLowerCase();
        if (msg.includes("failed to fetch") || msg.includes("network")) {
          errorMessage = "Network error while processing the file. Please try again.";
        } else if (msg.includes("invalid") || msg.includes("not a midi")) {
          errorMessage = "The file doesn't appear to be a valid MIDI file. Please check the file format.";
        } else if (msg.includes("timeout")) {
          errorMessage = "Parsing timed out. The file might be too large or complex.";
        } else if (msg.includes("memory")) {
          errorMessage = "Not enough memory to process this file. Please try a smaller MIDI file.";
        } else {
          errorMessage = `Error parsing MIDI file: ${err.message}`;
        }
      }

      setError(errorMessage);
      setStep("import");
    }
  }, []);

  const handleTrackChange = useCallback((id: string) => {
    setTrackId(id);
  }, []);

  const handleContinueToPreview = useCallback(() => {
    if (!song || !trackId) return;

    const track = song.tracks.find(t => t.id === trackId);
    if (!track) return;

    // Convert notes to SongNote format with transposition
    const songNotes = toSongNotes(track.notes);

    // Fit to alto saxophone range
    const { shift, notes: shiftedNotes } = fitToAltoRange(track.notes);
    const songNotesShifted = toSongNotes(shiftedNotes);

    setNotes(songNotesShifted);

    // Split into sections
    const songSections = splitIntoSections(songNotesShifted);
    setSections(songSections);

    setCompleted([]);
    setSectionIndex(0);
    setStep("preview");
  }, [song, trackId]);

  const handleBackToTrack = useCallback(() => {
    setStep("track");
  }, []);

  const handleStartPractice = useCallback(() => {
    setStep("practice");
  }, []);

  const handleSectionChange = useCallback((index: number) => {
    setSectionIndex(index);
  }, []);

  const handleSectionComplete = useCallback((sectionId: string) => {
    setCompleted(prev => [...prev, sectionId]);

    // Move to next section if not looping
    if (sectionIndex < sections.length - 1) {
      setSectionIndex(prev => prev + 1);
    }
  }, [sectionIndex, sections.length]);

  const handleExitPractice = useCallback(() => {
    setStep("preview");
  }, []);

  const handleRestart = useCallback(() => {
    setFile(null);
    setSong(null);
    setTrackId(null);
    setNotes([]);
    setSections([]);
    setCompleted([]);
    setStep("import");
    setError(null);
  }, []);

  // Determine if all sections are completed
  const isAllCompleted = sections.length > 0 && completed.length === sections.length;

  if (isAllCompleted && step === "practice") {
    setStep("complete");
  }

  // Render based on current step
  switch (step) {
    case "import":
      return (
        <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="mt-4 font-display text-5xl leading-tight sm:text-7xl">Learn a Song</h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-muted-foreground">
              Turn any MIDI song into an interactive alto saxophone lesson.
              Import a MIDI file and learn it one small section at a time.
            </p>
          </div>

          <MidiDropzone
            onFile={handleFile}
            busy={song === null && file !== null}
            file={file}
            error={error}
          />

          {song && trackId && (
            <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-5">
              <div>
                <p className="text-sm font-semibold">Ready to continue</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {song.title} · {song.tracks.filter(t => !t.isPercussion).length} parts
                </p>
              </div>
              <Button onClick={handleContinueToPreview} className="mt-4 w-full">
                Continue
              </Button>
            </div>
          )}
        </main>
      );

    case "track":
      if (!song) return <main>Loading...</main>;

      return (
        <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="mt-4 font-display text-5xl leading-tight sm:text-7xl">Learn a Song</h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-muted-foreground">
              {song.title}
            </p>
          </div>

          <TrackSelector
            song={song}
            value={trackId}
            onChange={handleTrackChange}
            onContinue={handleContinueToPreview}
          />

          <div className="mt-6">
            <Button onClick={handleBackToTrack} variant="outline">
              Back
            </Button>
          </div>
        </main>
      );

    case "preview":
      if (!song || !trackId || notes.length === 0 || sections.length === 0) return <main>Loading...</main>;

      const track = song.tracks.find(t => t.id === trackId);
      if (!track) return <main>Invalid track</main>;

      return (
        <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="mt-4 font-display text-5xl leading-tight sm:text-7xl">Learn a Song</h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-muted-foreground">
              {song.title}
            </p>
          </div>

          <SongPreview
            song={song}
            track={track}
            notes={notes}
            sections={sections}
            onStart={handleStartPractice}
            onBack={handleBackToTrack}
          />

          {completed.length > 0 && (
            <div className="mt-6 flex justify-center">
              <p className="text-sm text-muted-foreground">
                {completed.length}/{sections.length} passages mastered
              </p>
            </div>
          )}
        </main>
      );

    case "practice":
      if (!sections[sectionIndex]) return <main>Loading...</main>;

      return (
        <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-8 sm:py-20">
          <SectionPractice
            sections={sections}
            sectionIndex={sectionIndex}
            completed={completed}
            onSectionChange={handleSectionChange}
            onSectionComplete={handleSectionComplete}
            onExit={handleExitPractice}
          />
        </main>
      );

    case "complete":
      return (
        <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="mt-4 font-display text-5xl leading-tight sm:text-7xl">Congratulations!</h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-muted-foreground">
              You've mastered all {sections.length} passages of "{song?.title || "the song"}".
            </p>

            <div className="mt-8">
              <Button onClick={handleRestart} className="mt-4">
                Learn Another Song
              </Button>
              <Button onClick={handleBackToTrack} variant="outline" className="mt-4 ml-4">
                Practice Again
              </Button>
            </div>
          </div>
        </main>
      );

    default:
      return <main>Unknown state</main>;
  }
}