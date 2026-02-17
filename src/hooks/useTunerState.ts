import { useMemo, useRef, useState } from 'react';
import { BASS_STRINGS, GUITAR_STRINGS } from '../utils/constants';
import { centsOff, freqToMidi, midiToFreq, midiToName, targetForOpenMode, applySweetener } from '../utils/pitchMath';
import { median } from '../utils/median';
import type { DisplayState, PitchResult, TunerConfig } from '../utils/types';

const ATTACK_IGNORE_MS = 90;
const JUMP_REJECT_CENTS = 80;

export function useTunerState(config: TunerConfig) {
  const [state, setState] = useState<DisplayState>({
    noteText: '--',
    targetText: '--',
    cents: 0,
    frequency: 0,
    confidence: 0,
    rmsDb: -120,
    stable: false,
  });

  const onsetTs = useRef<number>(0);
  const centsHistory = useRef<number[]>([]);
  const pendingJumpFrames = useRef(0);

  const stringPool = useMemo(() => (config.mode === 'bass' ? BASS_STRINGS : GUITAR_STRINGS), [config.mode]);

  const onPitch = (pitch: PitchResult) => {
    if (pitch.confidence < 0.6) {
      setState((s) => ({ ...s, stable: false, confidence: pitch.confidence, rmsDb: pitch.rmsDb }));
      return;
    }

    if (pitch.rmsDb > -35 && onsetTs.current === 0) onsetTs.current = pitch.timestamp;
    if (onsetTs.current > 0 && pitch.timestamp - onsetTs.current < ATTACK_IGNORE_MS) return;

    const midi = Math.round(freqToMidi(pitch.freq, config.a4Hz));
    const note = midiToName(midi);

    let targetHz = midiToFreq(midi, config.a4Hz);
    if (config.mode === 'open') {
      targetHz = targetForOpenMode(pitch.freq, config.a4Hz);
    } else if (config.mode === 'guitar' || config.mode === 'bass') {
      targetHz = midiToFreq(stringPool[config.selectedString].midi, config.a4Hz);
    }

    targetHz = applySweetener(targetHz, Math.round(freqToMidi(targetHz, config.a4Hz)), config.mode, config.sweetenerEnabled);

    const cents = centsOff(pitch.freq, targetHz);
    centsHistory.current.push(cents);
    if (centsHistory.current.length > 15) centsHistory.current.shift();

    const smoothed = median(centsHistory.current);
    const jump = Math.abs(smoothed - state.cents);

    if (jump > JUMP_REJECT_CENTS) {
      pendingJumpFrames.current += 1;
      if (pendingJumpFrames.current < 3) return;
    }
    pendingJumpFrames.current = 0;

    setState({
      noteText: note,
      targetText: `${(config.mode === 'guitar' || config.mode === 'bass') ? stringPool[config.selectedString].name : midiToName(Math.round(freqToMidi(targetHz, config.a4Hz)))}`,
      cents: smoothed,
      frequency: pitch.freq,
      confidence: pitch.confidence,
      rmsDb: pitch.rmsDb,
      stable: true,
    });
  };

  return { state, onPitch };
}
