/**
 * Audio Engine: Procedural Web Audio Synth & Voice Clips Engine
 * Mimics sample voice saying "RITHIK" after passing each barrier,
 * and "Vittu pogatha RITHIK" on game over.
 */

export const BARRIER_VOICE_FILES = [
  '/assets/audio/dekisugi_rithik.wav',
  '/assets/audio/test_tamil_rithik.wav',
  '/assets/audio/rithik_1.wav',
  '/assets/audio/rithik_4.wav',
];

export const GAME_OVER_VOICE_FILE = '/assets/audio/dekisugi_vittu_pogatha.wav';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private voiceMuted: boolean = false;
  private speechSynth: SpeechSynthesis | null = null;
  private chosenVoice: SpeechSynthesisVoice | null = null;
  private lastBarrierQuipTime: number = 0;
  private barrierBuffers: AudioBuffer[] = [];
  private gameOverBuffer: AudioBuffer | null = null;
  private barrierAudios: HTMLAudioElement[] = [];
  private gameOverAudio: HTMLAudioElement | null = null;
  private isPreloadingVoices: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('flappy_rithik_sfx_muted');
      const savedVoiceMute = localStorage.getItem('flappy_rithik_voice_muted');
      this.isMuted = savedMute === 'true';
      this.voiceMuted = savedVoiceMute === 'true';

      try {
        this.barrierAudios = BARRIER_VOICE_FILES.map(url => {
          const a = new Audio(url);
          a.preload = 'auto';
          return a;
        });
        this.gameOverAudio = new Audio(GAME_OVER_VOICE_FILE);
        this.gameOverAudio.preload = 'auto';
      } catch {
        // Fallback
      }

      if ('speechSynthesis' in window) {
        this.speechSynth = window.speechSynthesis;
        this.initVoices();
        if (this.speechSynth.onvoiceschanged !== undefined) {
          this.speechSynth.onvoiceschanged = () => this.initVoices();
        }
      }
    }
  }

  public async preloadUserVoice() {
    if (this.barrierBuffers.length > 0 || this.isPreloadingVoices || typeof window === 'undefined') return;
    this.isPreloadingVoices = true;
    try {
      this.initContext();
      if (!this.ctx) return;

      // Pre-decode all barrier clips
      const loadedBarrierBuffers = await Promise.all(
        BARRIER_VOICE_FILES.map(async url => {
          try {
            const res = await fetch(url);
            const arrayBuffer = await res.arrayBuffer();
            return await this.ctx!.decodeAudioData(arrayBuffer);
          } catch {
            return null;
          }
        })
      );
      this.barrierBuffers = loadedBarrierBuffers.filter((b): b is AudioBuffer => b !== null);

      // Pre-decode game over clip
      try {
        const goRes = await fetch(GAME_OVER_VOICE_FILE);
        const goArrayBuf = await goRes.arrayBuffer();
        this.gameOverBuffer = await this.ctx.decodeAudioData(goArrayBuf);
      } catch {
        // Handled by HTMLAudioElement fallback
      }
    } catch {
      // Audio decoding fallback
    } finally {
      this.isPreloadingVoices = false;
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private initVoices() {
    if (!this.speechSynth) return;
    const voices = this.speechSynth.getVoices();
    // Prefer Indian English or Tamil or enthusiastic female/high-pitch voice for comic persona
    const pref = voices.find(v => v.lang.includes('ta') || v.lang.includes('en-IN') || v.name.includes('India'));
    const fallback = voices.find(v => v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Google UK English Female'));
    this.chosenVoice = pref || fallback || voices[0] || null;
  }

  public unlockAudio() {
    this.initContext();
    this.preloadUserVoice();
    this.barrierAudios.forEach(a => {
      try {
        a.load();
      } catch {}
    });
    if (this.gameOverAudio) {
      try {
        this.gameOverAudio.load();
      } catch {}
    }
    // Dummy speech to prime speech engine
    if (this.speechSynth && !this.chosenVoice) {
      this.initVoices();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    localStorage.setItem('flappy_rithik_sfx_muted', String(muted));
  }

  public setVoiceMuted(muted: boolean) {
    this.voiceMuted = muted;
    localStorage.setItem('flappy_rithik_voice_muted', String(muted));
  }

  public getIsMuted() {
    return this.isMuted;
  }

  public getIsVoiceMuted() {
    return this.voiceMuted;
  }

  // --- Procedural Sound FX ---

  public playFlap() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Ignore audio failure
    }
  }

  public playScore() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.08); // A5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.24);
    } catch {
      // Ignore audio failure
    }
  }

  public playCoin() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.09); // E6

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {}
  }

  public playHit() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // White noise buffer for punch impact
      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(60, now + 0.14);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.15);

      // Comical cartoon slide down tone
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(65, now + 0.35);

      oscGain.gain.setValueAtTime(0.2, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.37);
    } catch {}
  }

  public playPowerUp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const startTime = now + idx * 0.05;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.15);
      });
    } catch {}
  }

  public playShieldBreak() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.2);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.23);
    } catch {}
  }

  public playBonusStart() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      const now = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const st = now + idx * 0.06;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, st);
        gain.gain.setValueAtTime(0.2, st);
        gain.gain.exponentialRampToValueAtTime(0.001, st + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(st);
        osc.stop(st + 0.22);
      });
    } catch {}
  }

  public playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  // --- Voice Engine ---

  private speak(text: string, pitch = 1.35, rate = 1.1) {
    if (this.voiceMuted || !this.speechSynth) return;

    try {
      // Cancel pending utterance to stay snappy
      this.speechSynth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      if (this.chosenVoice) {
        utterance.voice = this.chosenVoice;
      }
      utterance.pitch = pitch; // Funny animated pitch
      utterance.rate = rate; // Snappy speed
      utterance.volume = 1.0;

      this.speechSynth.speak(utterance);
    } catch {
      // Speech failed or blocked
    }
  }

  /**
   * Called when passing each barrier:
   * Plays the voice clip mimicking the sample voice saying "RITHIK"
   */
  public triggerBarrierQuip() {
    if (this.voiceMuted) return;
    const now = Date.now();
    // Debounce slightly to prevent overlap on rapid barrier clearing
    if (now - this.lastBarrierQuipTime < 400) return;
    this.lastBarrierQuipTime = now;

    this.initContext();

    // 1. First priority: Play decoded Web Audio Buffer of the voice clips
    if (this.ctx && this.barrierBuffers.length > 0) {
      try {
        const randomIndex = Math.floor(Math.random() * this.barrierBuffers.length);
        const buffer = this.barrierBuffers[randomIndex];
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(1.0, this.ctx.currentTime);
        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        source.start(0);
        return;
      } catch {
        // Fallback to audio element
      }
    }

    // 2. Second priority: Play HTML5 Audio element
    if (this.barrierAudios.length > 0) {
      try {
        const randomIndex = Math.floor(Math.random() * this.barrierAudios.length);
        const audio = this.barrierAudios[randomIndex];
        audio.currentTime = 0;
        audio.volume = 1.0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            this.speak('Rithik!', 1.35, 1.15);
          });
        }
        return;
      } catch {
        // Fallback to speech
      }
    }

    // 3. Fallback: Speech synthesis
    this.speak('Rithik!', 1.35, 1.15);
  }

  /**
   * Called on Game Over:
   * Plays the custom voice clip saying "Vittu pogatha RITHIK" in the sample voice!
   */
  public triggerGameOverQuip() {
    if (this.voiceMuted) return;
    this.initContext();

    // 1. Play decoded Web Audio buffer of vittu_pogatha.wav
    if (this.ctx && this.gameOverBuffer) {
      try {
        const source = this.ctx.createBufferSource();
        source.buffer = this.gameOverBuffer;
        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(1.0, this.ctx.currentTime);
        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        source.start(0);
        return;
      } catch {
        // Fallback
      }
    }

    // 2. Play HTML5 Audio element fallback
    if (this.gameOverAudio) {
      try {
        this.gameOverAudio.currentTime = 0;
        this.gameOverAudio.volume = 1.0;
        const playPromise = this.gameOverAudio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            this.speak('Vittu pogatha Rithik!', 1.25, 0.95);
          });
        }
        return;
      } catch {
        // Fallback
      }
    }

    // 3. Fallback: Speech synthesis
    this.speak('Vittu pogatha Rithik!', 1.25, 0.95);
  }

  /**
   * Power-up pickup voice quips
   */
  public triggerPowerUpQuip(type: string) {
    const powerQuips: Record<string, string[]> = {
      SHIELD: [
        'Shield on! Tension illa Rithik!',
        'Shield potachu Rithik!',
        'Safe mode Rithik!',
      ],
      MAGNET: [
        'Magnet power! Ella kaasu enaku!',
        'Kaasu mela kaasu Rithik!',
        'Money magnet Rithik!',
      ],
      SLOW_MO: [
        'Slow motion da Rithik!',
        'Matrix Rithik!',
        'Easy-ah thaandiru Rithik!',
      ],
      TURBO: [
        'Thalaivaaa rocket speed Rithik!',
        'Rocket Rithik mass-u!',
        'Aiyoo semma speed!',
      ],
      BONUS_PORTAL: [
        'Bonus round vandhachu! Kalakkura Rithik!',
        'Jackpot round! Kalakku Rithik!',
      ],
    };

    const list = powerQuips[type] || ['Super power-up Rithik!'];
    const chosen = list[Math.floor(Math.random() * list.length)];
    this.speak(chosen, 1.3, 1.1);
  }

  /**
   * Bonus round quips
   */
  public triggerBonusRoundQuip() {
    this.speak('Bonus round! Don\'t miss it Rithik! Kalakkura!', 1.4, 1.15);
  }

  /**
   * Level up quip
   */
  public triggerLevelUpQuip(level: number, levelName: string) {
    this.speak(`Level ${level}! ${levelName}! Speed-u yerudhu Rithik!`, 1.3, 1.1);
  }
}

export const soundEngine = new SoundEngine();
