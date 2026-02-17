import { GUITAR_STRINGS, NOTE_NAMES, SWEETENER_MAP, TEMPERAMENTS } from './constants';
import type { TemperamentId, TuningMode } from './types';

export function freqToMidi(freq: number, a4Hz: number): number {
  return 69 + 12 * Math.log2(freq / a4Hz);
}

export function midiToFreq(midi: number, a4Hz: number): number {
  return a4Hz * Math.pow(2, (midi - 69) / 12);
}

export function midiToName(midi: number): string {
  const rounded = Math.round(midi);
  const name = NOTE_NAMES[((rounded % 12) + 12) % 12];
  const octave = Math.floor(rounded / 12) - 1;
  return `${name}${octave}`;
}

export function centsOff(freq: number, targetHz: number): number {
  return 1200 * Math.log2(freq / targetHz);
}

export function temperamentOffsetCents(noteName: string, temperament: TemperamentId): number {
  const map = TEMPERAMENTS[temperament];
  return map[noteName] ?? 0;
}

export function applySweetener(targetHz: number, midiRounded: number, mode: TuningMode, sweetenerEnabled: boolean): number {
  if (!sweetenerEnabled) return targetHz;
  if (mode !== 'open' && mode !== 'guitar' && mode !== 'bass') return targetHz;
  const cents = SWEETENER_MAP.get(midiRounded) ?? 0;
  return targetHz * Math.pow(2, cents / 1200);
}

export function targetForOpenMode(freq: number, a4Hz: number): number {
  const nearest = GUITAR_STRINGS.reduce((best, current) => {
    const currentHz = midiToFreq(current.midi, a4Hz);
    const bestHz = midiToFreq(best.midi, a4Hz);
    return Math.abs(currentHz - freq) < Math.abs(bestHz - freq) ? current : best;
  }, GUITAR_STRINGS[0]);
  return midiToFreq(nearest.midi, a4Hz);
}
