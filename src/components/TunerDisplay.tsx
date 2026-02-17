import type { DisplayState } from '../utils/types';

export function TunerDisplay({ state }: { state: DisplayState }) {
  return (
    <section>
      <h2 id="noteText">{state.noteText}</h2>
      <div>{state.frequency.toFixed(2)} Hz</div>
      <div id="centsText">{state.cents.toFixed(1)}¢</div>
      <div>Target: {state.targetText}</div>
    </section>
  );
}
