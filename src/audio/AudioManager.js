export class AudioManager {
  constructor() { this.context = null; this.source = null; this.analyser = null; this.gain = null; this.audio = new Audio(); this.audio.loop = true; this.audio.crossOrigin = 'anonymous'; this.hasAudio = false; this.data = new Uint8Array(128); }
  async load(file) {
    this.audio.pause(); if (this.audio.src.startsWith('blob:')) URL.revokeObjectURL(this.audio.src);
    this.audio.src = URL.createObjectURL(file); this.hasAudio = true;
    this.context ||= new AudioContext(); await this.context.resume();
    if (!this.source) { this.source = this.context.createMediaElementSource(this.audio); this.analyser = this.context.createAnalyser(); this.analyser.fftSize = 256; this.gain = this.context.createGain(); this.source.connect(this.analyser); this.analyser.connect(this.gain); this.gain.connect(this.context.destination); }
    this.audio.volume = 1; this.gain.gain.value = this.volume ?? .35; await this.audio.play();
  }
  async toggle(force) { if (!this.hasAudio) return false; if (this.context?.state === 'suspended') await this.context.resume(); const shouldPlay = force ?? this.audio.paused; if (shouldPlay) await this.audio.play(); else this.audio.pause(); return shouldPlay; }
  setVolume(value) { this.volume = value; if (this.gain) this.gain.gain.setTargetAtTime(value, this.context.currentTime, .08); else this.audio.volume = value; }
  getLevel() { if (!this.analyser) return 0; this.analyser.getByteFrequencyData(this.data); return this.data.reduce((sum, value) => sum + value, 0) / (this.data.length * 255); }
  dispose() { this.audio.pause(); if (this.audio.src.startsWith('blob:')) URL.revokeObjectURL(this.audio.src); this.context?.close(); }
}
