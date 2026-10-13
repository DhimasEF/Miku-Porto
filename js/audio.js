/**
 * HATSUNE MIKU AUDIO & SYNTHESIS ENGINE
 * High-precision Web Audio API sound generator with support for background music & gentle UI feedback.
 */

class CyberAudioManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.isMuted = localStorage.getItem('miku_audio_muted') === 'true';
        this.bgmPlaying = false;
        this.bgmTimer = null;
        this.volume = parseFloat(localStorage.getItem('miku_audio_volume') || '0.28');
        this.isInitialized = false;

        // Custom audio element check (e.g. assets/bgm.mp3)
        this.audioElement = null;
    }

    init() {
        if (this.isInitialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);
            this.isInitialized = true;

            // Check if HTML has <audio id="bgm-audio">
            this.audioElement = document.getElementById('bgm-audio');
            if (this.audioElement) {
                this.audioElement.volume = this.volume;
            }
        } catch (e) {
            console.warn("Web Audio API not supported", e);
        }
    }

    ensureContext() {
        if (!this.isInitialized) {
            this.init();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setVolume(val) {
        this.volume = Math.max(0, Math.min(1, val));
        localStorage.setItem('miku_audio_volume', this.volume.toString());
        if (this.masterGain && this.ctx && !this.isMuted) {
            this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
        }
        if (this.audioElement) {
            this.audioElement.volume = this.isMuted ? 0 : this.volume;
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('miku_audio_muted', String(this.isMuted));

        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.05);
        }
        if (this.audioElement) {
            this.audioElement.volume = this.isMuted ? 0 : this.volume;
        }

        if (this.isMuted && this.bgmPlaying) {
            this.stopBGM();
        }
        return this.isMuted;
    }

    // UI Hover Sound: subtle cyber chirp
    playHover() {
        if (this.isMuted) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1760, now);
        osc.frequency.exponentialRampToValueAtTime(2640, now + 0.035);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.04);
    }

    // UI Click Sound: crisp two-tone hologram confirm
    playClick() {
        if (this.isMuted) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'triangle';
        osc2.type = 'sine';

        osc1.frequency.setValueAtTime(880, now);
        osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.07);

        osc2.frequency.setValueAtTime(1320, now);
        osc2.frequency.exponentialRampToValueAtTime(2200, now + 0.07);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.masterGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.08);
        osc2.stop(now + 0.08);
    }

    // UI Modal / Checkpoint Panel Open: gentle airy sweep
    playOpen() {
        if (this.isMuted) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.16);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(2800, now + 0.14);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.18);
    }

    // Hit / Notification chime
    playHit(grade = 'PERFECT') {
        if (this.isMuted) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1174.66, now); // D6 bell
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.23);
    }

    // Level Up / Celebration Fanfare
    playLevelUp() {
        if (this.isMuted) return;
        this.ensureContext();
        if (!this.ctx) return;

        const notes = [587.33, 739.99, 880.00, 1174.66]; // D5, F#5, A5, D6
        const now = this.ctx.currentTime;

        notes.forEach((freq, idx) => {
            const start = now + idx * 0.08;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(0.14, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + (idx === notes.length - 1 ? 0.45 : 0.2));

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(start);
            osc.stop(start + 0.5);
        });
    }

    // Background Music (Greenlight Serenade / Vocaloid Motif Ambient)
    toggleBGM() {
        if (this.bgmPlaying) {
            this.stopBGM();
            return false;
        } else {
            this.startBGM();
            return true;
        }
    }

    startBGM() {
        this.ensureContext();
        if (this.isMuted || !this.ctx) return;

        // If audio element is provided and has src, play it
        if (this.audioElement && this.audioElement.src && !this.audioElement.src.endsWith('#')) {
            this.audioElement.play().then(() => {
                this.bgmPlaying = true;
                localStorage.setItem('miku_bgm_enabled', 'true');
            }).catch(e => {
                console.warn("Audio element play error, falling back to Web Audio Synth:", e);
                this.startSynthBGM();
            });
            return;
        }

        // Procedural Vocaloid Ambient Synth Arpeggio
        this.startSynthBGM();
    }

    startSynthBGM() {
        this.bgmPlaying = true;
        localStorage.setItem('miku_bgm_enabled', 'true');

        // Pentatonic melody motif inspired by Greenlight Serenade & Magical Mirai cyber arpeggios
        // In D Major (D, E, F#, A, B, D5)
        const melody = [
            587.33, 739.99, 880.00, 1174.66, 987.77, 880.00, 739.99, 587.33,
            880.00, 1174.66, 1318.51, 1479.98, 1318.51, 1174.66, 987.77, 880.00,
            659.25, 783.99, 987.77, 1174.66, 987.77, 783.99, 659.25, 739.99,
            880.00, 1174.66, 1479.98, 1760.00, 1479.98, 1174.66, 880.00, 739.99
        ];

        let step = 0;
        const tempo = 128; // bpm
        const interval = (60 / tempo) * 250; // sixteenth notes

        const playStep = () => {
            if (!this.bgmPlaying || this.isMuted || !this.ctx) return;

            const now = this.ctx.currentTime;
            const freq = melody[step % melody.length];

            // Ambient Lead
            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const noteGain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1200, now);
            filter.frequency.exponentialRampToValueAtTime(350, now + 0.16);

            noteGain.gain.setValueAtTime(0.025, now);
            noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

            osc.connect(filter);
            filter.connect(noteGain);
            noteGain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + 0.19);

            // Gentle Bass Foundation
            if (step % 8 === 0) {
                const bassOsc = this.ctx.createOscillator();
                const bassGain = this.ctx.createGain();
                bassOsc.type = 'sine';
                const bassFreq = (step % 16 === 0) ? 146.83 : 110.00; // D3 / A2
                bassOsc.frequency.setValueAtTime(bassFreq, now);

                bassGain.gain.setValueAtTime(0.045, now);
                bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

                bassOsc.connect(bassGain);
                bassGain.connect(this.masterGain);

                bassOsc.start(now);
                bassOsc.stop(now + 0.38);
            }

            step++;
            this.bgmTimer = setTimeout(playStep, interval);
        };

        playStep();
    }

    stopBGM() {
        this.bgmPlaying = false;
        localStorage.setItem('miku_bgm_enabled', 'false');
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
        if (this.audioElement) {
            this.audioElement.pause();
        }
    }
}

// Global instance
window.cyberAudio = new CyberAudioManager();
