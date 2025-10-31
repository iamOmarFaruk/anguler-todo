import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SoundService {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;

  constructor() {
    // Initialize on first user interaction to comply with browser autoplay policies
    this.setupUserInteractionListener();
  }

  private setupUserInteractionListener(): void {
    const initializeOnInteraction = () => {
      if (!this.isInitialized) {
        this.initializeAudioContext();
        this.isInitialized = true;
        // Remove listeners after first interaction
        document.removeEventListener('click', initializeOnInteraction);
        document.removeEventListener('keydown', initializeOnInteraction);
        document.removeEventListener('touchstart', initializeOnInteraction);
      }
    };

    document.addEventListener('click', initializeOnInteraction, { once: true });
    document.addEventListener('keydown', initializeOnInteraction, { once: true });
    document.addEventListener('touchstart', initializeOnInteraction, { once: true });
  }

  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Audio not supported in this browser:', error);
    }
  }

  private async ensureAudioContext(): Promise<AudioContext | null> {
    if (!this.audioContext) {
      this.initializeAudioContext();
    }

    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.warn('Could not resume audio context:', error);
        return null;
      }
    }

    return this.audioContext;
  }

  async playAddItemSound(): Promise<void> {
    const audioContext = await this.ensureAudioContext();
    if (!audioContext) return;

    try {
      // Create a pleasant notification sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Set frequency for a pleasant notification sound (C note)
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      
      // Quick fade in and out for a soft sound
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Could not play sound:', error);
    }
  }

  async playCompleteSound(): Promise<void> {
    const audioContext = await this.ensureAudioContext();
    if (!audioContext) return;

    try {
      // Create a success sound (ascending notes)
      const frequencies = [523.25, 659.25]; // C and E notes
      const startTime = audioContext.currentTime;

      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(freq, startTime + index * 0.1);
        
        gainNode.gain.setValueAtTime(0, startTime + index * 0.1);
        gainNode.gain.linearRampToValueAtTime(0.08, startTime + index * 0.1 + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + index * 0.1 + 0.2);

        oscillator.start(startTime + index * 0.1);
        oscillator.stop(startTime + index * 0.1 + 0.2);
      });
    } catch (error) {
      console.warn('Could not play sound:', error);
    }
  }

  async playDeleteSound(): Promise<void> {
    const audioContext = await this.ensureAudioContext();
    if (!audioContext) return;

    try {
      // Create a very subtle "swoosh" delete sound (descending tone)
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Start higher and go lower for a "disappearing" effect
      oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.04, audioContext.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.warn('Could not play sound:', error);
    }
  }

  async playConfirmationSound(): Promise<void> {
    const audioContext = await this.ensureAudioContext();
    if (!audioContext) return;

    try {
      // Create a questioning/alert sound (higher pitched)
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A note, alerting tone
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.warn('Could not play sound:', error);
    }
  }

  async playWarningSound(): Promise<void> {
    const audioContext = await this.ensureAudioContext();
    if (!audioContext) return;

    try {
      // Create a warning sound (two quick beeps)
      const frequencies = [587.33, 440]; // D and A notes
      const startTime = audioContext.currentTime;

      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(freq, startTime + index * 0.15);
        
        gainNode.gain.setValueAtTime(0, startTime + index * 0.15);
        gainNode.gain.linearRampToValueAtTime(0.1, startTime + index * 0.15 + 0.03);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + index * 0.15 + 0.12);

        oscillator.start(startTime + index * 0.15);
        oscillator.stop(startTime + index * 0.15 + 0.12);
      });
    } catch (error) {
      console.warn('Could not play sound:', error);
    }
  }
}