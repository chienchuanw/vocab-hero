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
              <span>Words</span>
            </div>
            <span className={cn('font-medium', isWordsComplete && 'text-green-600')}>
              {wordsProgress} / {wordsGoal}
              {isWordsComplete && <CheckCircle2 className="inline ml-1 h-4 w-4" />}
            </span>
          </div>
          <Progress value={wordsPercentage} className="h-2" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Minutes</span>
            </div>
            <span className={cn('font-medium', isMinutesComplete && 'text-green-600')}>
              {minutesProgress} / {minutesGoal}
              {isMinutesComplete && <CheckCircle2 className="inline ml-1 h-4 w-4" />}
            </span>
          </div>
          <Progress value={minutesPercentage} className="h-2" />
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
                <span className="font-medium">Words Goal</span>
              </div>
              <span className={cn('text-lg font-bold', isWordsComplete && 'text-green-600')}>
                {wordsProgress} / {wordsGoal}
              </span>
            </div>
            <Progress value={wordsPercentage} className="h-3" />
            <p className="text-sm text-muted-foreground mt-1">{wordsPercentage}% complete</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="font-medium">Time Goal</span>
              </div>
              <span className={cn('text-lg font-bold', isMinutesComplete && 'text-green-600')}>
                {minutesProgress} / {minutesGoal} min
              </span>
            </div>
            <Progress value={minutesPercentage} className="h-3" />
            <p className="text-sm text-muted-foreground mt-1">{minutesPercentage}% complete</p>
          </div>

          {isWordsComplete && isMinutesComplete && (
            <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
              <CheckCircle2 className="h-5 w-5" />
              <span>Daily goals achieved!</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

