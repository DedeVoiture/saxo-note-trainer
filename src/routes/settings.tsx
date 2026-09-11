import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mic } from "lucide-react";
import { AudioInputSelector } from "@/components/sax/AudioInputSelector";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { usePracticeSettings } from "@/settings/settingsStore";
import type { AudioDevice } from "@/audio/usePitchInput";

export const Route = createFileRoute("/settings")({ head: () => ({ meta: [
  { title: "Settings — Alto Practice Studio" }, { name: "description", content: "Adjust microphone, fingering, pitch tolerance, and stability for alto saxophone practice." },
  { property: "og:title", content: "Settings — Alto Practice Studio" }, { property: "og:description", content: "Adjust microphone, fingering, pitch tolerance, and stability for alto saxophone practice." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: SettingsPage });
function SettingsPage() {
  const { settings, updateSettings } = usePracticeSettings();
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  useEffect(() => { const refresh = async () => { if (!navigator.mediaDevices?.enumerateDevices) return; const list = await navigator.mediaDevices.enumerateDevices(); setDevices(list.filter((item) => item.kind === "audioinput").map((item, index) => ({ deviceId: item.deviceId || "default", label: item.label || `Audio input ${index + 1}` }))); }; void refresh(); navigator.mediaDevices?.addEventListener?.("devicechange", refresh); return () => navigator.mediaDevices?.removeEventListener?.("devicechange", refresh); }, []);
  return <main className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-8 sm:py-20"><p className="eyebrow">Practice setup</p><h1 className="mt-3 font-display text-5xl sm:text-6xl">Settings</h1><div className="frost-panel mt-10 divide-y divide-border/70 p-6 sm:p-8"><section className="pb-7"><div className="mb-5 flex items-center gap-3"><Mic className="size-5 text-primary" /><div><h2 className="font-semibold">Audio input</h2><p className="text-sm text-muted-foreground">Choose the microphone used during practice.</p></div></div><AudioInputSelector devices={devices} value={settings.deviceId} onChange={(deviceId) => updateSettings({ deviceId })} /></section><section className="flex items-center justify-between py-7"><div><h2 className="font-semibold">Show fingering by default</h2><p className="mt-1 text-sm text-muted-foreground">Turn this off for memory practice.</p></div><Switch checked={settings.showFingering} onCheckedChange={(showFingering) => updateSettings({ showFingering })} aria-label="Show fingering by default" /></section><section className="py-7"><div className="flex justify-between"><div><h2 className="font-semibold">Pitch tolerance</h2><p className="mt-1 text-sm text-muted-foreground">How close the played pitch needs to be.</p></div><output className="font-display text-2xl">±{settings.pitchTolerance}¢</output></div><Slider className="mt-6" min={20} max={100} step={5} value={[settings.pitchTolerance]} onValueChange={([value]) => { if (value !== undefined) updateSettings({ pitchTolerance: value }); }} aria-label="Pitch tolerance" /></section><section className="pt-7"><div className="flex justify-between"><div><h2 className="font-semibold">Pitch stability</h2><p className="mt-1 text-sm text-muted-foreground">How long a note must stay steady.</p></div><output className="font-display text-2xl">{settings.stabilityMs} ms</output></div><Slider className="mt-6" min={100} max={300} step={10} value={[settings.stabilityMs]} onValueChange={([value]) => { if (value !== undefined) updateSettings({ stabilityMs: value }); }} aria-label="Pitch stability" /></section></div><p className="mt-5 text-sm text-muted-foreground">Beginner range: written Ré 4 through Sol 5 · natural notes</p></main>;
}
