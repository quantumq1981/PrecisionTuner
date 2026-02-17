import { OSC_TEST_FREQUENCIES } from '../utils/constants';

interface OscillatorTestProps {
  enabled: boolean;
  frequency: number;
  onToggle: (enabled: boolean) => void;
  onFrequency: (frequency: number) => void;
}

export function OscillatorTest({ enabled, frequency, onToggle, onFrequency }: OscillatorTestProps) {
  return (
    <section>
      <label>
        <input id="oscTestToggle" type="checkbox" checked={enabled} onChange={(e) => onToggle(e.target.checked)} />
        Test oscillator
      </label>
      <select id="oscFreqSelect" value={frequency} onChange={(e) => onFrequency(Number(e.target.value))} disabled={!enabled}>
        {OSC_TEST_FREQUENCIES.map((freq) => <option key={freq} value={freq}>{freq}</option>)}
      </select>
    </section>
  );
}
