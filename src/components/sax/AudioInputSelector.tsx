import { Mic } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AudioDevice } from "@/audio/usePitchInput";

export function AudioInputSelector({ devices, value, onChange, disabled = false }: { devices: AudioDevice[]; value: string; onChange: (value: string) => void; disabled?: boolean }) {
  const available = devices.length ? devices : [{ deviceId: "default", label: "Default microphone" }];
  const safeValue = available.some((device) => device.deviceId === value) ? value : available[0]?.deviceId ?? "default";
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase text-muted-foreground" htmlFor="audio-input">Audio input</label>
      <Select value={safeValue} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="audio-input" className="h-11 bg-surface/70 backdrop-blur-md"><span className="flex min-w-0 items-center gap-2"><Mic className="size-4 shrink-0 text-primary" /><SelectValue /></span></SelectTrigger>
        <SelectContent>{available.map((device) => <SelectItem key={device.deviceId} value={device.deviceId}>{device.label}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}
