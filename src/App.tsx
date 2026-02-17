import { useEffect, useMemo, useState } from 'react';
import { Controls } from './components/Controls';
import { OscillatorTest } from './components/OscillatorTest';
import { StatusPanel } from './components/StatusPanel';
import { TunerDisplay } from './components/TunerDisplay';
import { useAudioWorklet } from './hooks/useAudioWorklet';
import { useTunerState } from './hooks/useTunerState';
import { MODE_BOUNDS } from './utils/constants';
import type { TunerConfig } from './utils/types';

const initialConfig: TunerConfig = {
  mode: 'open',
  selectedString: 0,
  a4Hz: Number(localStorage.getItem('a4Hz') ?? 440),
  temperament: 'equal',
  sweetenerEnabled: true,
  calibrationCents: Number(localStorage.getItem('calibrationCents') ?? 0),
};

export default function App() {
  const [config, setConfig] = useState<TunerConfig>(initialConfig);
  const [oscEnabled, setOscEnabled] = useState(false);
  const [oscFreq, setOscFreq] = useState(440);

  const { state, onPitch } = useTunerState(config);
  const { isReady, error, start, stop, postConfig, setTestTone } = useAudioWorklet(onPitch);

  const workletConfig = useMemo(() => {
    const bounds = MODE_BOUNDS[config.mode];
    return {
      windowSize: 2048,
      hopSize: 256,
      threshold: 0.12,
      minFreq: bounds.minFreq,
      maxFreq: bounds.maxFreq,
      calibrationFactor: Math.pow(2, config.calibrationCents / 1200),
    };
  }, [config]);

  useEffect(() => {
    localStorage.setItem('a4Hz', String(config.a4Hz));
    localStorage.setItem('calibrationCents', String(config.calibrationCents));
    postConfig(workletConfig);
  }, [config, postConfig, workletConfig]);

  useEffect(() => {
    setTestTone(oscEnabled ? oscFreq : undefined);
  }, [oscEnabled, oscFreq, setTestTone]);

  return (
    <main>
      <h1>Precision Tuner v24.0</h1>
      {error && <p>{error}</p>}
      <TunerDisplay state={state} />
      <Controls config={config} onChange={setConfig} onStart={start} onStop={stop} />
      <OscillatorTest enabled={oscEnabled} frequency={oscFreq} onToggle={setOscEnabled} onFrequency={setOscFreq} />
      <StatusPanel state={state} ready={isReady} />
    </main>
  );
}
