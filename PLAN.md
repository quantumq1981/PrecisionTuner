# Integration Charter: Precision Tuner v24.0 → Production-Ready Architecture

## Purpose
Refactor the tuner from monolithic HTML/JS into a modular React + TypeScript + AudioWorklet architecture with deterministic testing and stable mode semantics.

## Implemented Architecture

```
src/
├── components/
├── hooks/
├── worklet/
├── utils/
├── App.tsx
├── index.tsx
└── styles/global.css
```

### Key Guarantees
- Open mode now targets nearest open guitar string target (E2, A2, D3, G3, B3, E4).
- Mode bounds updated:
  - Chromatic: 50–2000 Hz
  - Guitar lock: 60–1200 Hz
  - Bass lock: 25–700 Hz
- Harmonic guard replaced by multi-candidate scorer in YIN processor.
- Attack suppression (90ms onset-ignore window).
- Outlier rejection with rolling median + jump persistence (>80¢ requires 3 frames).
- Test oscillator harness added (toggle + frequency selector).
- Calibration persistence retained through localStorage.

## Validation
- Selenium test script in `tests/test_pitch_validation.py` asserts note and cents for required oscillator frequencies.
- Script is designed for CI headless Chrome usage.
