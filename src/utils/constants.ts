import type { StringTarget, TemperamentId } from './types';

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const GUITAR_STRINGS: StringTarget[] = [
  { name: 'E2', midi: 40 },
  { name: 'A2', midi: 45 },
  { name: 'D3', midi: 50 },
  { name: 'G3', midi: 55 },
  { name: 'B3', midi: 59 },
  { name: 'E4', midi: 64 },
];

export const BASS_STRINGS: StringTarget[] = [
  { name: 'E1', midi: 28 },
  { name: 'A1', midi: 33 },
  { name: 'D2', midi: 38 },
  { name: 'G2', midi: 43 },
  { name: 'B0', midi: 23 },
];

export const MODE_BOUNDS = {
  open: { minFreq: 60, maxFreq: 1200 },
  chromatic: { minFreq: 50, maxFreq: 2000 },
  guitar: { minFreq: 60, maxFreq: 1200 },
  bass: { minFreq: 25, maxFreq: 700 },
};

export const TEMPERAMENTS: Record<TemperamentId, Record<string, number>> = {
  equal: {},
  just: { C: 0, D: 4, E: -14, F: -2, G: 2, A: -16, B: -12 },
  pythagorean: { C: 0, D: 4, E: 8, F: -2, G: 2, A: 6, B: 10 },
  meantone: { C: 0, D: -7, E: -14, F: 7, G: 0, A: -7, B: -14 },
  werckmeister3: { C: 0, 'C#': -8, D: -4, E: -8, F: 2, G: -2, A: -6, B: -4 },
};

export const SWEETENER_MAP = new Map<number, number>([
  [40, -2], [45, -1], [50, 0], [55, 1], [59, 1], [64, 2],
  [28, -2], [33, -1], [38, 0], [43, 1], [23, -3],
]);

export const OSC_TEST_FREQUENCIES = [82.4069, 110.0, 146.832, 196.0, 246.942, 329.628, 440.0, 659.255];
