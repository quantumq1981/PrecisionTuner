import { Gauge } from './Gauge';
import type { DisplayState } from '../utils/types';

export function StatusPanel({ state, ready }: { state: DisplayState; ready: boolean }) {
  return (
    <section>
      <Gauge label="Confidence" value={state.confidence * 100} />
      <Gauge label="RMS dBFS" value={state.rmsDb} min={-90} max={0} />
      <div>System: {ready ? 'Ready' : 'Idle'}</div>
      <div>Stable: {state.stable ? 'Yes' : 'No'}</div>
    </section>
  );
}
