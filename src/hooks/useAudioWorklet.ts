import { useCallback, useRef, useState } from 'react';
import { loadYinWorkletModule } from '../worklet/worklet-loader';
import type { PitchResult, WorkletConfig, WorkletUIMessage } from '../utils/types';

export const useAudioWorklet = (onPitchResult: (result: PitchResult) => void) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | OscillatorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const oscGainRef = useRef<GainNode | null>(null);

  const start = useCallback(async () => {
    try {
      const ctx = new AudioContext();
      await ctx.resume();
      await loadYinWorkletModule(ctx);

      const node = new AudioWorkletNode(ctx, 'yin-processor');
      node.port.onmessage = (event: MessageEvent<WorkletUIMessage>) => {
        if (event.data.type === 'ready') setIsReady(true);
        if (event.data.type === 'result') onPitchResult(event.data.payload);
        if (event.data.type === 'error') setError(event.data.payload);
      };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mic = ctx.createMediaStreamSource(stream);
      const sink = ctx.createGain();
      sink.gain.value = 0;

      mic.connect(node).connect(sink).connect(ctx.destination);

      audioContextRef.current = ctx;
      workletNodeRef.current = node;
      sourceRef.current = mic;
      streamRef.current = stream;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to initialize audio.');
    }
  }, [onPitchResult]);

  const stop = useCallback(() => {
    sourceRef.current?.disconnect();
    workletNodeRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    audioContextRef.current?.close();
    setIsReady(false);
  }, []);

  const postConfig = useCallback((config: WorkletConfig) => {
    workletNodeRef.current?.port.postMessage({ type: 'config', payload: config });
  }, []);

  const setTestTone = useCallback(async (frequency?: number) => {
    const ctx = audioContextRef.current;
    const node = workletNodeRef.current;
    if (!ctx || !node) return;

    sourceRef.current?.disconnect();

    if (!frequency) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mic = ctx.createMediaStreamSource(stream);
      mic.connect(node);
      sourceRef.current = mic;
      streamRef.current = stream;
      return;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.value = 0.2;
    osc.frequency.value = frequency;
    osc.type = 'sine';
    osc.connect(gain).connect(node);
    osc.start();

    oscGainRef.current?.disconnect();
    oscGainRef.current = gain;
    sourceRef.current = osc;
  }, []);

  return { isReady, error, start, stop, postConfig, setTestTone };
};
