'use client';

import { Layout } from '@/components/shared';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GoalProgressBar } from '@/components/features/goals/GoalProgressBar';
import { useDailyGoal } from '@/hooks/useDailyGoal';
import { BookOpen, GraduationCap, TrendingUp, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const DEFAULT_USER_ID = 'cmjod038p00008o9qathx7chz';
  const { data: goal, isLoading: isLoadingGoal } = useDailyGoal(DEFAULT_USER_ID);

  // TODO: 從 API 取得今日實際進度
  const todayProgress = {
    wordsStudied: 0,
    minutesStudied: 0,
  };

  return (
    <Layout streak={0}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Welcome to Vocab Hero</h1>
          <p className="text-muted-foreground">
            Start your Japanese vocabulary learning journey today
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Total Words</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Words Mastered</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Study Sessions</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Daily Goal Progress */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Daily Goal</h2>
            <Link href="/settings/goals">
              <Button variant="outline" size="sm">
                Settings
              </Button>
            </Link>
          </div>

          {isLoadingGoal ? (
            <Card className="p-6">
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            </Card>
          ) : goal ? (
            <GoalProgressBar
              wordsProgress={todayProgress.wordsStudied}
              wordsGoal={goal.wordsPerDay}
              minutesProgress={todayProgress.minutesStudied}
              minutesGoal={goal.minutesPerDay}
              variant="default"
            />
          ) : (
            <Card className="p-6">
              <p className="text-center text-muted-foreground">
                No daily goal set. Go to settings to create one.
              </p>
            </Card>
          )}

          <Link href="/study">
            <Button className="w-full" size="lg">
              Start Studying
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
