'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Pause, Play } from 'lucide-react';
import { AudioRecorder } from '@/lib/audio';
import { cn } from '@/lib/utils';

/**
 * RecordButton component props
 */
export interface RecordButtonProps {
  /**
   * Callback when recording is complete
   */
  onRecordingComplete?: (audioBlob: Blob) => void;

  /**
   * Callback when recording starts
   */
  onRecordingStart?: () => void;

  /**
   * Callback when recording error occurs
   */
  onError?: (error: Error) => void;

  /**
   * Maximum recording duration in seconds (0 for unlimited)
   */
  maxDuration?: number;

  /**
   * Custom className
   */
  className?: string;
}

/**
 * RecordButton Component
 * 
 * Button for recording audio with visual feedback and duration display.
 * Handles microphone permissions and recording state.
 */
export function RecordButton({
  onRecordingComplete,
  onRecordingStart,
  onError,
  maxDuration = 0,
  className,
}: RecordButtonProps) {
  const [recorder] = useState(() => new AudioRecorder());
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isSupported] = useState(() => AudioRecorder.isSupported());

  // Update duration while recording
  useEffect(() => {
    if (!isRecording || isPaused) return;

    const interval = setInterval(() => {
      const currentDuration = recorder.getRecordingDuration();
      setDuration(currentDuration);

      // Auto-stop if max duration reached
      if (maxDuration > 0 && currentDuration >= maxDuration) {
        handleStop();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isRecording, isPaused, maxDuration]);

  const handleStart = async () => {
    try {
      await recorder.startRecording();
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      onRecordingStart?.();
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const handleStop = async () => {
    try {
      const audioBlob = await recorder.stopRecording();
      setIsRecording(false);
      setIsPaused(false);
      setDuration(0);
      onRecordingComplete?.(audioBlob);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const handlePause = () => {
    try {
      recorder.pauseRecording();
      setIsPaused(true);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const handleResume = () => {
    try {
      recorder.resumeRecording();
      setIsPaused(false);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recorder.cleanup();
    };
  }, []);

  if (!isSupported) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-4', className)}>
      {!isRecording ? (
        <Button
          onClick={handleStart}
          variant="default"
          size="lg"
          className="bg-red-500 hover:bg-red-600"
          aria-label="Start recording"
        >
          <Mic className="h-5 w-5 mr-2" />
          Record
        </Button>
      ) : (
        <>
          <Button
            onClick={handleStop}
            variant="destructive"
            size="lg"
            aria-label="Stop recording"
          >
            <Square className="h-5 w-5 mr-2" />
            Stop
          </Button>

          {isPaused ? (
            <Button
              onClick={handleResume}
              variant="outline"
              size="lg"
              aria-label="Resume recording"
            >
              <Play className="h-5 w-5 mr-2" />
              Resume
            </Button>
          ) : (
            <Button
              onClick={handlePause}
              variant="outline"
              size="lg"
              aria-label="Pause recording"
            >
              <Pause className="h-5 w-5 mr-2" />
              Pause
            </Button>
          )}

          <div className="text-lg font-mono">
            {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
          </div>
        </>
      )}
    </div>
  );
}

