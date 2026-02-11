'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import type {
  QualityRatingButtonsProps,
  QualityRatingConfig,
  QualityRating,
} from './QualityRatingButtons.types';

/**
 * Quality rating button configurations
 * Based on SM-2 algorithm quality ratings
 */
const RATING_COLORS: Record<number, string> = {
  0: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
  1: 'bg-orange-500 hover:bg-orange-600 text-white',
  2: 'bg-yellow-500 hover:bg-yellow-600 text-white',
  3: 'bg-blue-500 hover:bg-blue-600 text-white',
  4: 'bg-green-500 hover:bg-green-600 text-white',
  5: 'bg-primary hover:bg-primary/90 text-primary-foreground',
};

/**
 * QualityRatingButtons component
 * Displays rating buttons for SM-2 algorithm quality assessment
 * Supports keyboard shortcuts 0-5
 */
export function QualityRatingButtons({ onRate, disabled = false }: QualityRatingButtonsProps) {
  const t = useTranslations('study');

  // Handle keyboard shortcuts
  useEffect(() => {
    if (disabled) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key;
      const quality = parseInt(key, 10);

      // Check if key is a valid quality rating (0-5)
      if (!isNaN(quality) && quality >= 0 && quality <= 5) {
        e.preventDefault();
        onRate(quality as QualityRating);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onRate, disabled]);

  const ratingConfigs: QualityRatingConfig[] = [0, 1, 2, 3, 4, 5].map((quality) => ({
    quality: quality as QualityRating,
    label: t(`ratings.${quality}.label`),
    description: t(`ratings.${quality}.description`),
    colorClass: RATING_COLORS[quality] || '',
  }));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-center">{t('ratingPrompt')}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {ratingConfigs.map((config) => (
          <Button
            key={config.quality}
            onClick={() => onRate(config.quality)}
            disabled={disabled}
            className={`${config.colorClass} flex flex-col items-center justify-center h-auto py-4 px-3 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
            aria-label={`${config.label} - ${config.description} [${config.quality}]`}
          >
            <span className="text-sm font-bold mb-1">[{config.quality}]</span>
            <span className="text-base font-semibold">{config.label}</span>
            <span className="text-xs opacity-90">{config.description}</span>
          </Button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground text-center">{t('ratingKeyboard')}</p>
    </div>
  );
}
