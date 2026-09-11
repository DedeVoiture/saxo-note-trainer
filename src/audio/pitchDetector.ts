export type PitchReading = { frequency: number; clarity: number; rms: number } | null;

export function detectPitchYin(buffer: Float32Array, sampleRate: number, minVolume = 0.015): PitchReading {
  let sumSquares = 0;
  for (const value of buffer) sumSquares += value * value;
  const rms = Math.sqrt(sumSquares / buffer.length);
  if (rms < minVolume) return null;

  const minTau = Math.max(2, Math.floor(sampleRate / 1000));
  const maxTau = Math.min(Math.floor(sampleRate / 130), Math.floor(buffer.length / 2));
  const difference = new Float32Array(maxTau + 1);
  for (let tau = minTau; tau <= maxTau; tau += 1) {
    let sum = 0;
    for (let i = 0; i < buffer.length - tau; i += 1) {
      const delta = (buffer[i] ?? 0) - (buffer[i + tau] ?? 0);
      sum += delta * delta;
    }
    difference[tau] = sum;
  }

  const cmnd = new Float32Array(maxTau + 1);
  cmnd[0] = 1;
  let running = 0;
  let tauEstimate = -1;
  for (let tau = 1; tau <= maxTau; tau += 1) {
    running += difference[tau] ?? 0;
    cmnd[tau] = running === 0 ? 1 : ((difference[tau] ?? 0) * tau) / running;
    if (tau >= minTau && (cmnd[tau] ?? 1) < 0.14) {
      while (tau + 1 <= maxTau && (cmnd[tau + 1] ?? 1) < (cmnd[tau] ?? 1)) tau += 1;
      tauEstimate = tau;
      break;
    }
  }
  if (tauEstimate < 0) return null;

  const current = cmnd[tauEstimate] ?? 1;
  const previous = cmnd[tauEstimate - 1] ?? current;
  const next = cmnd[tauEstimate + 1] ?? current;
  const denominator = 2 * (2 * current - next - previous);
  const adjustment = denominator === 0 ? 0 : (next - previous) / denominator;
  const refinedTau = tauEstimate + adjustment;
  const frequency = sampleRate / refinedTau;
  const clarity = 1 - current;
  return frequency >= 130 && frequency <= 1000 && clarity >= 0.82 ? { frequency, clarity, rms } : null;
}
