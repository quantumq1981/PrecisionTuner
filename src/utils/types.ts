export type TuningMode = 'open' | 'chromatic' | 'guitar' | 'bass';

export interface StringTarget {
  name: string;
  midi: number;
}

export interface PitchResult {
  freq: number;
  confidence: number;
  rmsDb: number;
  sampleRate: number;
  timestamp: number;
}

export interface WorkletConfig {
  windowSize: number;
  hopSize: number;
  minFreq: number;
  maxFreq: number;
  threshold: number;
  calibrationFactor: number;
}

export type UIWorkletMessage =
  | { type: 'config'; payload: WorkletConfig }
  | { type: 'test-oscillator'; payload: { frequency: number; enable: boolean } };

export type WorkletUIMessage =
  | { type: 'ready' }
  | { type: 'result'; payload: PitchResult }
  | { type: 'error'; payload: string };

export interface TunerConfig {
  mode: TuningMode;
  selectedString: number;
  a4Hz: number;
  temperament: TemperamentId;
  sweetenerEnabled: boolean;
  calibrationCents: number;
}

export interface DisplayState {
  noteText: string;
  targetText: string;
  cents: number;
  frequency: number;
  confidence: number;
  rmsDb: number;
  stable: boolean;
}

export type TemperamentId = 'equal' | 'just' | 'pythagorean' | 'meantone' | 'werckmeister3';
