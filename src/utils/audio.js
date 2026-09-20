// Advanced Web Audio API Generator for FocusPulse Ultra v2.0

let audioCtx = null;
let ambientNodes = [];
let isAmbientPlaying = false;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Play session completion chime presets
export function playChimeSound(preset = 'bell', volume = 0.7) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    if (preset === 'zen') {
      // Tibetan Singing Bowl sound synthesis
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(216, now); // 216 Hz warm frequency
      
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(volume * 0.5, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 3.6);
      return;
    }

    if (preset === 'digital') {
      // Modern digital synth notification
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.01, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(volume * 0.3, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.6);
      });
      return;
    }

    // Default Bell Harmony
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now);
    osc1.frequency.exponentialRampToValueAtTime(1046.50, now + 0.15);

    gain1.gain.setValueAtTime(0.01, now);
    gain1.gain.linearRampToValueAtTime(volume * 0.4, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, now + 0.1);
    osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.25);

    gain2.gain.setValueAtTime(0.01, now + 0.1);
    gain2.gain.linearRampToValueAtTime(volume * 0.3, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 1.3);

    osc2.start(now + 0.1);
    osc2.stop(now + 1.6);
  } catch (err) {
    console.error('Audio play error:', err);
  }
}

// Stop ambient generator
export function stopAmbientSound() {
  try {
    ambientNodes.forEach((node) => {
      if (node.stop) node.stop();
      if (node.disconnect) node.disconnect();
    });
    ambientNodes = [];
    isAmbientPlaying = false;
  } catch (err) {
    console.error('Error stopping ambient audio:', err);
  }
}

// Start Ambient Sounds (Rain, Binaural 432Hz, Fire, Waves, White Noise, Pink Noise)
export function startAmbientSound(type, volume = 0.5) {
  stopAmbientSound();
  if (!type || type === 'none') return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (type === 'binaural') {
      // 432 Hz + 442 Hz Binaural Beat (10 Hz Alpha wave focus state)
      const oscLeft = ctx.createOscillator();
      const oscRight = ctx.createOscillator();
      const merger = ctx.createChannelMerger(2);
      const gain = ctx.createGain();

      oscLeft.type = 'sine';
      oscLeft.frequency.setValueAtTime(432, ctx.currentTime);

      oscRight.type = 'sine';
      oscRight.frequency.setValueAtTime(442, ctx.currentTime);

      gain.gain.setValueAtTime(volume * 0.25, ctx.currentTime);

      oscLeft.connect(merger, 0, 0); // Left channel
      oscRight.connect(merger, 0, 1); // Right channel
      merger.connect(gain);
      gain.connect(ctx.destination);

      oscLeft.start();
      oscRight.start();
      ambientNodes.push(oscLeft, oscRight, merger, gain);
      isAmbientPlaying = true;
      return;
    }

    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    if (type === 'rain') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11;
        b6 = white * 0.115926;
      }
    } else if (type === 'fire') {
      // Crackling Fire Simulation
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = Math.pow(white, 9) * 0.6 + (Math.random() < 0.002 ? (Math.random() * 0.5 - 0.25) : 0);
      }
    } else if (type === 'pinknoise') {
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.05;
      }
    } else {
      // Default White Noise / Waves
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.08;
      }
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = type === 'rain' ? 'lowpass' : (type === 'fire' ? 'bandpass' : 'lowpass');
    filter.frequency.setValueAtTime(type === 'rain' ? 900 : (type === 'fire' ? 1400 : 800), ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume * 0.35, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseSource.start();
    ambientNodes.push(noiseSource, filter, gainNode);
    isAmbientPlaying = true;
  } catch (err) {
    console.error('Error starting ambient sound:', err);
  }
}
