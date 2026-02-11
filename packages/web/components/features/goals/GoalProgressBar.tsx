import { useTranslations } from 'next-intl';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * GoalProgressBar component props
 */
export interface GoalProgressBarProps {
  wordsProgress: number;
  wordsGoal: number;
  minutesProgress: number;
  minutesGoal: number;
  variant?: 'default' | 'compact';
}

/**
 * GoalProgressBar Component
 * Displays progress towards daily word and time goals
 */
export function GoalProgressBar({
  wordsProgress,
  wordsGoal,
  minutesProgress,
  minutesGoal,
  variant = 'default',
}: GoalProgressBarProps) {
  const t = useTranslations('goals');
  const wordsPercentage = Math.min(Math.round((wordsProgress / wordsGoal) * 100), 100);
  const minutesPercentage = Math.min(Math.round((minutesProgress / minutesGoal) * 100), 100);

  const isWordsComplete = wordsProgress >= wordsGoal;
  const isMinutesComplete = minutesProgress >= minutesGoal;

  if (variant === 'compact') {
    return (
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span>{t('words')}</span>
            </div>
            <span className={cn('font-medium', isWordsComplete && 'text-green-600')}>
              {wordsProgress} / {wordsGoal}
              {isWordsComplete && <CheckCircle2 className="inline ml-1 h-4 w-4" />}
            </span>
          </div>
          <Progress
            value={wordsPercentage}
            className="h-2"
            aria-label={`Words progress: ${wordsProgress} of ${wordsGoal} (${wordsPercentage}%)`}
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{t('minutes')}</span>
            </div>
            <span className={cn('font-medium', isMinutesComplete && 'text-green-600')}>
              {minutesProgress} / {minutesGoal}
              {isMinutesComplete && <CheckCircle2 className="inline ml-1 h-4 w-4" />}
            </span>
          </div>
          <Progress
            value={minutesPercentage}
            className="h-2"
            aria-label={`Minutes progress: ${minutesProgress} of ${minutesGoal} (${minutesPercentage}%)`}
          />
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <span className="font-medium">{t('wordsGoal')}</span>
              </div>
              <span className={cn('text-lg font-bold', isWordsComplete && 'text-green-600')}>
                {wordsProgress} / {wordsGoal}
              </span>
            </div>
            <Progress
              value={wordsPercentage}
              className="h-3"
              aria-label={`Words progress: ${wordsProgress} of ${wordsGoal} (${wordsPercentage}%)`}
            />
            <p className="text-sm text-muted-foreground mt-1">
              {wordsPercentage}% {t('complete')}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="font-medium">{t('timeGoal')}</span>
              </div>
              <span className={cn('text-lg font-bold', isMinutesComplete && 'text-green-600')}>
                {minutesProgress} / {minutesGoal} min
              </span>
            </div>
            <Progress
              value={minutesPercentage}
              className="h-3"
              aria-label={`Minutes progress: ${minutesProgress} of ${minutesGoal} minutes (${minutesPercentage}%)`}
            />
            <p className="text-sm text-muted-foreground mt-1">
              {minutesPercentage}% {t('complete')}
            </p>
          </div>

          {isWordsComplete && isMinutesComplete && (
            <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
              <CheckCircle2 className="h-5 w-5" />
              <span>{t('goalsAchieved')}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
