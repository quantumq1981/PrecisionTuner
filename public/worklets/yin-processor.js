class YinProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.windowSize = 2048;
    this.hopSize = 256;
    this.threshold = 0.12;
    this.minFreq = 60;
    this.maxFreq = 1200;
    this.calibrationFactor = 1;
    this.ring = new Float32Array(this.windowSize * 2);
    this.writeIndex = 0;
    this.sinceLast = 0;
    this.port.onmessage = (ev) => {
      const { type, payload } = ev.data;
      if (type === 'config') {
        this.windowSize = payload.windowSize;
        this.hopSize = payload.hopSize;
        this.threshold = payload.threshold;
        this.minFreq = payload.minFreq;
        this.maxFreq = payload.maxFreq;
        this.calibrationFactor = payload.calibrationFactor;
        this.ring = new Float32Array(this.windowSize * 2);
        this.writeIndex = 0;
        this.sinceLast = 0;
      }
    };
    this.port.postMessage({ type: 'ready' });
  }

  process(inputs) {
    const input = inputs[0] && inputs[0][0];
    if (!input) return true;

    for (let i = 0; i < input.length; i += 1) {
      this.ring[this.writeIndex] = input[i];
      this.writeIndex = (this.writeIndex + 1) % this.ring.length;
      this.sinceLast += 1;
      if (this.sinceLast >= this.hopSize) {
        this.sinceLast = 0;
        const frame = this.readFrame();
        const result = this.detectPitch(frame, sampleRate);
        if (result) {
          this.port.postMessage({
            type: 'result',
            payload: {
              freq: result.freq * this.calibrationFactor,
              confidence: result.confidence,
              rmsDb: this.rmsDb(frame),
              sampleRate,
              timestamp: currentTime * 1000
            }
          });
        }
      }
    }
    return true;
  }

  readFrame() {
    const frame = new Float32Array(this.windowSize);
    const start = (this.writeIndex - this.windowSize + this.ring.length) % this.ring.length;
    for (let i = 0; i < this.windowSize; i += 1) frame[i] = this.ring[(start + i) % this.ring.length];
    return frame;
  }

  detectPitch(frame, sr) {
    const tauMin = Math.max(2, Math.floor(sr / this.maxFreq));
    const tauMax = Math.min(Math.floor(sr / this.minFreq), Math.floor(frame.length / 2));
    const diff = new Float32Array(tauMax + 1);
    const cmnd = new Float32Array(tauMax + 1);

    for (let tau = tauMin; tau <= tauMax; tau += 1) {
      let sum = 0;
      for (let i = 0; i < frame.length - tau; i += 1) {
        const d = frame[i] - frame[i + tau];
        sum += d * d;
      }
      diff[tau] = sum;
    }

    let running = 0;
    for (let tau = tauMin; tau <= tauMax; tau += 1) {
      running += diff[tau];
      cmnd[tau] = running === 0 ? 1 : (diff[tau] * tau) / running;
    }

    let baseTau = -1;
    for (let tau = tauMin; tau <= tauMax; tau += 1) {
      if (cmnd[tau] < this.threshold) { baseTau = tau; break; }
    }
    if (baseTau === -1) return null;

    const candidates = [1, 2, 3, 4, 0.5, 1 / 3, 0.25].map((m) => Math.round(baseTau * m)).filter((t) => t >= tauMin && t <= tauMax);
    let winner = baseTau;
    let best = Number.POSITIVE_INFINITY;
    for (const tau of candidates) {
      const deviation = Math.abs(tau - baseTau) / baseTau;
      const score = cmnd[tau] + deviation * 0.08;
      if (score < best) { best = score; winner = tau; }
    }

    return { freq: sr / winner, confidence: Math.max(0, 1 - cmnd[winner]) };
  }

  rmsDb(frame) {
    let sum = 0;
    for (let i = 0; i < frame.length; i += 1) sum += frame[i] * frame[i];
    const rms = Math.sqrt(sum / frame.length);
    return 20 * Math.log10(Math.max(rms, 1e-8));
  }
}

registerProcessor('yin-processor', YinProcessor);
