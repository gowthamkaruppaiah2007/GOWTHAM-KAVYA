import { supabase } from './supabase';

export const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

// Web Audio API Ringtone generator (no external audio files needed!)
class RingtoneService {
  private audioCtx: AudioContext | null = null;
  private intervalId: any = null;

  startRingtone() {
    this.stopRingtone();
    try {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = () => {
        if (!this.audioCtx) return;
        const osc1 = this.audioCtx.createOscillator();
        const osc2 = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(440, this.audioCtx.currentTime); // A4
        osc2.frequency.setValueAtTime(480, this.audioCtx.currentTime);

        gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 1.2);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(this.audioCtx.currentTime + 1.2);
        osc2.stop(this.audioCtx.currentTime + 1.2);
      };

      playTone();
      this.intervalId = setInterval(playTone, 2500);
    } catch (e) {
      console.error('Audio ringtone error:', e);
    }
  }

  stopRingtone() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch (e) {}
      this.audioCtx = null;
    }
  }
}

export const ringtoneService = new RingtoneService();
