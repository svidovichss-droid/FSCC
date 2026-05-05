// Audio Alert Utilities for ISO Grades D and F

let audioContext: AudioContext | null = null;

/**
 * Initialize audio context (must be called after user interaction)
 */
export function initAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Generate beep sound with specified parameters
 */
export function playBeep(
  frequency: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'sine'
): void {
  try {
    const ctx = initAudioContext();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Volume envelope
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (error) {
    console.error('Audio playback failed:', error);
  }
}

/**
 * Play warning beep for grade D
 * Moderate pitch, two short beeps
 */
export function playGradeDAlert(volume: number): void {
  const dVolume = Math.max(0.1, Math.min(1, volume));

  // First beep
  playBeep(880, 0.15, dVolume, 'sine');

  // Second beep after short pause
  setTimeout(() => {
    playBeep(1100, 0.15, dVolume, 'sine');
  }, 200);
}

/**
 * Play critical alarm for grade F
 * High-pitched triple beep with escalating frequency
 */
export function playGradeFAlert(volume: number): void {
  const fVolume = Math.max(0.15, Math.min(1, volume));

  // First high beep
  playBeep(1200, 0.12, fVolume, 'square');

  // Second higher beep
  setTimeout(() => {
    playBeep(1500, 0.12, fVolume, 'square');
  }, 150);

  // Third highest beep
  setTimeout(() => {
    playBeep(1800, 0.2, fVolume, 'square');
  }, 300);
}

/**
 * Play grade-specific alert
 */
export function playGradeAlert(
  grade: 'A' | 'B' | 'C' | 'D' | 'F',
  volume: number
): void {
  if (grade === 'D') {
    playGradeDAlert(volume);
  } else if (grade === 'F') {
    playGradeFAlert(volume);
  }
}

/**
 * Resume audio context (needed after user interaction)
 */
export function resumeAudio(): void {
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

/**
 * Get current audio context state
 */
export function isAudioReady(): boolean {
  return audioContext !== null && audioContext.state === 'running';
}
