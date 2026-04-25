// ==================================================
// SYNTHETIC AUDIO SYSTEM
// ==================================================

export class SoundManager {
  constructor() {
    this.context = null;
    this.master = null;
    this.enabled = false;
  }

  unlock() {
    if (!window.AudioContext && !window.webkitAudioContext) return;
    if (!this.context) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.context = new AudioCtx();
      this.master = this.context.createGain();
      this.master.gain.value = 0.16;
      this.master.connect(this.context.destination);
    }

    if (this.context.state === 'suspended') this.context.resume();
    this.enabled = true;
  }

  beep({
    type = 'sine',
    frequency = 440,
    endFrequency = frequency,
    duration = 0.12,
    volume = 0.4,
    attack = 0.005,
    release = 0.08,
    detune = 0,
    noise = false,
  }) {
    if (!this.enabled || !this.context || !this.master) return;

    const now = this.context.currentTime;
    const gain = this.context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + release);
    gain.connect(this.master);

    if (noise) {
      const buffer = this.context.createBuffer(
        1,
        this.context.sampleRate * (duration + release),
        this.context.sampleRate
      );
      const channel = buffer.getChannelData(0);
      for (let index = 0; index < channel.length; index += 1) {
        channel[index] = (Math.random() * 2 - 1) * 0.7;
      }
      const source = this.context.createBufferSource();
      const filter = this.context.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(frequency, now);
      filter.Q.value = 0.6;
      source.buffer = buffer;
      source.connect(filter);
      filter.connect(gain);
      source.start(now);
      source.stop(now + duration + release);
      return;
    }

    const oscillator = this.context.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, endFrequency), now + duration);
    oscillator.detune.value = detune;
    oscillator.connect(gain);
    oscillator.start(now);
    oscillator.stop(now + duration + release);
  }

  shoot() {
    this.beep({
      type: 'square',
      frequency: 720,
      endFrequency: 420,
      duration: 0.06,
      volume: 0.16,
      release: 0.04,
    });
  }

  rocket() {
    this.beep({
      type: 'sawtooth',
      frequency: 240,
      endFrequency: 110,
      duration: 0.18,
      volume: 0.22,
      release: 0.08,
    });
  }

  dash() {
    this.beep({
      type: 'triangle',
      frequency: 360,
      endFrequency: 720,
      duration: 0.08,
      volume: 0.14,
      release: 0.05,
    });
  }

  hit() {
    this.beep({ frequency: 1600, duration: 0.045, volume: 0.12, release: 0.03, noise: true });
  }

  explosion() {
    this.beep({ frequency: 180, duration: 0.14, volume: 0.26, release: 0.14, noise: true });
    this.beep({
      type: 'triangle',
      frequency: 120,
      endFrequency: 55,
      duration: 0.22,
      volume: 0.18,
      release: 0.16,
    });
  }
}
