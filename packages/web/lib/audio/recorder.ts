/**
 * AudioRecorder Class
 * Wrapper for MediaRecorder API to record audio from microphone
 */

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private mediaStream: MediaStream | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;

  /**
   * Check if MediaRecorder API is supported
   */
  static isSupported(): boolean {
    return typeof MediaRecorder !== 'undefined' && 
           typeof navigator.mediaDevices !== 'undefined' &&
           typeof navigator.mediaDevices.getUserMedia !== 'undefined';
  }

  /**
   * Start recording audio from microphone
   * 
   * @throws Error if already recording or microphone access denied
   */
  async startRecording(): Promise<void> {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      throw new Error('Already recording');
    }

    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      // Create MediaRecorder instance
      this.mediaRecorder = new MediaRecorder(this.mediaStream);
      this.audioChunks = [];
      this.startTime = Date.now();

      // Handle data available event
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // Start recording
      this.mediaRecorder.start();
    } catch (error) {
      this.cleanup();
      throw new Error(`Failed to start recording: ${error}`);
    }
  }

  /**
   * Stop recording and return audio blob
   * 
   * @returns Promise that resolves to audio blob
   * @throws Error if not currently recording
   */
  async stopRecording(): Promise<Blob> {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
      throw new Error('Not currently recording');
    }

    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('MediaRecorder not initialized'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.cleanup();
        resolve(audioBlob);
      };

      this.mediaRecorder.onerror = (error) => {
        this.cleanup();
        reject(error);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Pause recording
   * 
   * @throws Error if not currently recording
   */
  pauseRecording(): void {
    if (!this.mediaRecorder || this.mediaRecorder.state !== 'recording') {
      throw new Error('Not currently recording');
    }

    this.mediaRecorder.pause();
  }

  /**
   * Resume recording
   * 
   * @throws Error if not paused
   */
  resumeRecording(): void {
    if (!this.mediaRecorder || this.mediaRecorder.state !== 'paused') {
      throw new Error('Recording is not paused');
    }

    this.mediaRecorder.resume();
  }

  /**
   * Check if currently recording
   */
  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  /**
   * Check if recording is paused
   */
  isPaused(): boolean {
    return this.mediaRecorder?.state === 'paused';
  }

  /**
   * Get recording duration in seconds
   */
  getRecordingDuration(): number {
    if (!this.startTime || this.mediaRecorder?.state === 'inactive') {
      return 0;
    }

    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    this.mediaRecorder = null;
    this.audioChunks = [];
    this.startTime = 0;
  }
}

/**
 * Create audio URL from blob for playback
 * 
 * @param blob - Audio blob
 * @returns URL for audio playback
 */
export function createAudioURL(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Revoke audio URL to free memory
 * 
 * @param url - Audio URL to revoke
 */
export function revokeAudioURL(url: string): void {
  URL.revokeObjectURL(url);
}

