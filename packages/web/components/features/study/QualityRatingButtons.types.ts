/**
 * Quality rating levels for SM-2 algorithm
 * 0 = Complete blackout
 * 1 = Incorrect response
 * 2 = Correct response with difficulty
 * 3 = Correct response with some hesitation
 * 4 = Correct response with ease
 * 5 = Perfect response
 */
export type QualityRating = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Quality rating button configuration
 */
export interface QualityRatingConfig {
  quality: QualityRating;
  label: string;
  description: string;
  colorClass: string;
}

/**
 * QualityRatingButtons component props
 */
export interface QualityRatingButtonsProps {
  onRate: (quality: QualityRating) => void;
  disabled?: boolean;
}

