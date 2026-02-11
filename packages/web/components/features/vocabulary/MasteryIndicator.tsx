import { MasteryLevel, getMasteryLevelConfig } from '@/lib/srs/mastery';
import { cn } from '@/lib/utils';

/**
 * MasteryIndicator component props
 */
export interface MasteryIndicatorProps {
  level: MasteryLevel;
  showDescription?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * MasteryIndicator component
 * 
 * Displays a color-coded badge indicating the mastery level of a vocabulary item.
 * 
 * @param level - The mastery level to display
 * @param showDescription - Whether to show description as tooltip (default: false)
 * @param size - Size of the badge (default: 'md')
 * @param className - Additional CSS classes
 */
export function MasteryIndicator({
  level,
  showDescription = false,
  size = 'md',
  className,
}: MasteryIndicatorProps) {
  const config = getMasteryLevelConfig(level);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        config.color,
        config.bgColor,
        sizeClasses[size],
        className
      )}
      title={showDescription ? config.description : undefined}
    >
      {config.label}
    </span>
  );
}

