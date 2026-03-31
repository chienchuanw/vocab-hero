import { Flame, Trophy, Snowflake } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { STREAK_MILESTONES } from '@/lib/progress/streak.types';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  freezesRemaining: number;
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
  freezesRemaining,
}: StreakDisplayProps) {
  const isMilestone = (STREAK_MILESTONES as readonly number[]).includes(currentStreak);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          <Flame
            className={`h-4 w-4 ${currentStreak > 0 ? 'text-warning' : 'text-muted-foreground'}`}
          />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold">{currentStreak}</div>
            <span className="text-sm text-muted-foreground">days</span>
          </div>
          {isMilestone && (
            <Badge variant="secondary" className="mt-2">
              Milestone
            </Badge>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
          <Trophy className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold">{longestStreak}</div>
            <span className="text-sm text-muted-foreground">days</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Freezes Remaining</CardTitle>
          <Snowflake
            className={`h-4 w-4 ${freezesRemaining > 0 ? 'text-info' : 'text-muted-foreground'}`}
          />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold">{freezesRemaining}</div>
            <span className="text-sm text-muted-foreground">/ 5</span>
          </div>
          {freezesRemaining === 0 && (
            <p className="mt-2 text-xs text-muted-foreground">Resets monthly</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
