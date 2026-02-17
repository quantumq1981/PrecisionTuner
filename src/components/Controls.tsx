import { BASS_STRINGS, GUITAR_STRINGS } from '../utils/constants';
import type { TunerConfig, TuningMode } from '../utils/types';

interface ControlsProps {
  config: TunerConfig;
  onChange: (next: TunerConfig) => void;
  onStart: () => void;
  onStop: () => void;
}

export function Controls({ config, onChange, onStart, onStop }: ControlsProps) {
  const strings = config.mode === 'bass' ? BASS_STRINGS : GUITAR_STRINGS;
  const setMode = (mode: TuningMode) => onChange({ ...config, mode, selectedString: 0 });

  return (
    <section>
      <button id="btnStart" onClick={onStart}>Start</button>
      <button onClick={onStop}>Stop</button>
      <label>
        Mode
        <select value={config.mode} onChange={(e) => setMode(e.target.value as TuningMode)}>
          <option value="open">Open</option>
          <option value="chromatic">Chromatic</option>
          <option value="guitar">Guitar lock</option>
          <option value="bass">Bass lock</option>
        </select>
      </label>
      {(config.mode === 'guitar' || config.mode === 'bass') && (
        <label>
          String
          <select value={config.selectedString} onChange={(e) => onChange({ ...config, selectedString: Number(e.target.value) })}>
            {strings.map((s, idx) => <option key={s.name} value={idx}>{s.name}</option>)}
          </select>
        </label>
      )}
      <label>
        A4
        <input type="number" value={config.a4Hz} min={435} max={445} step={0.1} onChange={(e) => onChange({ ...config, a4Hz: Number(e.target.value) })} />
      </label>
    </section>
  );
}
