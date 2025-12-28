'use client';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Repeat } from 'lucide-react';
import { TTS_SPEED_PRESETS } from '@/lib/tts';
import { cn } from '@/lib/utils';

/**
 * TTSControls component props
 */
export interface TTSControlsProps {
  /**
   * Current playback speed (0.1 to 10, default: 1.0)
   */
  speed?: number;

  /**
   * Whether repeat mode is active
   */
  isRepeating?: boolean;

  /**
   * Whether controls are disabled
   */
  disabled?: boolean;

  /**
   * Compact mode (shows minimal controls)
   */
  compact?: boolean;

  /**
   * Callback when speed changes
   */
  onSpeedChange?: (speed: number) => void;

  /**
   * Callback when repeat button is clicked
   */
  onRepeat?: () => void;
}

/**
 * TTSControls Component
 * 
 * Provides playback controls for TTS including speed adjustment and repeat functionality.
 * Can be displayed in compact or full mode.
 */
export function TTSControls({
  speed = 1.0,
  isRepeating = false,
  disabled = false,
  compact = false,
  onSpeedChange,
  onRepeat,
}: TTSControlsProps) {
  const handleSpeedChange = (value: number[]) => {
    if (value[0] !== undefined) {
      onSpeedChange?.(value[0]);
    }
  };

  const handlePresetClick = (presetSpeed: number) => {
    onSpeedChange?.(presetSpeed);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant={isRepeating ? 'default' : 'outline'}
          size="sm"
          onClick={onRepeat}
          disabled={disabled}
          aria-label="Repeat"
          className={cn(isRepeating && 'bg-primary')}
        >
          <Repeat className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      {/* Speed Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Speed</label>
          <span className="text-sm text-muted-foreground">{speed.toFixed(1)}x</span>
        </div>
        
        <Slider
          value={[speed]}
          onValueChange={handleSpeedChange}
          min={0.5}
          max={2.0}
          step={0.25}
          disabled={disabled}
          aria-label="Speed"
          className="w-full"
        />

        {/* Speed Presets */}
        <div className="flex gap-2 flex-wrap">
          {Object.entries(TTS_SPEED_PRESETS).map(([key, value]) => (
            <Button
              key={key}
              variant={speed === value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePresetClick(value)}
              disabled={disabled}
              aria-label={`${value}x`}
            >
              {value}x
            </Button>
          ))}
        </div>
      </div>

      {/* Repeat Control */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Repeat</label>
        <Button
          variant={isRepeating ? 'default' : 'outline'}
          size="sm"
          onClick={onRepeat}
          disabled={disabled}
          aria-label="Repeat"
          className={cn(isRepeating && 'bg-primary')}
        >
          <Repeat className="h-4 w-4 mr-2" />
          {isRepeating ? 'On' : 'Off'}
        </Button>
      </div>
    </div>
  );
}

