'use client';

import { useState } from 'react';
import { Layout } from '@/components/shared';
import { StatCard } from '@/components/features/progress/StatCard';
import { ContributionWall } from '@/components/features/progress/ContributionWall';
import { ProgressLineChart } from '@/components/features/progress/ProgressLineChart';
import { GroupDistributionPieChart } from '@/components/features/progress/GroupDistributionPieChart';
import { MasteryLevelBarChart } from '@/components/features/progress/MasteryLevelBarChart';
import { GoalProgressBar } from '@/components/features/goals/GoalProgressBar';
import { useDailyGoal } from '@/hooks/useDailyGoal';
import { BookOpen, Clock, TrendingUp, Award } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

/**
 * Progress Dashboard Page
 * Displays comprehensive learning statistics and progress visualization
 */
export default function ProgressPage() {
  const DEFAULT_USER_ID = 'cmjod038p00008o9qathx7chz';
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const { data: goal } = useDailyGoal(DEFAULT_USER_ID);

  // TODO: 從 API 取得今日實際進度
  const todayProgress = {
    wordsStudied: 0,
    minutesStudied: 0,
  };

  // Mock data - will be replaced with real API calls
  const mockProgressData = [
    { date: new Date('2024-12-20'), wordsStudied: 10, timeSpentMinutes: 30 },
    { date: new Date('2024-12-21'), wordsStudied: 15, timeSpentMinutes: 45 },
    { date: new Date('2024-12-22'), wordsStudied: 8, timeSpentMinutes: 25 },
    { date: new Date('2024-12-23'), wordsStudied: 20, timeSpentMinutes: 60 },
    { date: new Date('2024-12-24'), wordsStudied: 12, timeSpentMinutes: 35 },
  ];

  const mockLineChartData = [
    { date: '12/20', wordsStudied: 10, timeSpent: 30 },
    { date: '12/21', wordsStudied: 15, timeSpent: 45 },
    { date: '12/22', wordsStudied: 8, timeSpent: 25 },
    { date: '12/23', wordsStudied: 20, timeSpent: 60 },
    { date: '12/24', wordsStudied: 12, timeSpent: 35 },
  ];

  const mockGroupData = [
    { name: 'JLPT N5', value: 150, color: '#3b82f6' },
    { name: 'JLPT N4', value: 100, color: '#10b981' },
    { name: 'JLPT N3', value: 75, color: '#f59e0b' },
    { name: 'Daily Conversation', value: 50, color: '#ef4444' },
  ];

  const mockMasteryData = [
    { level: 'NEW', count: 50 },
    { level: 'LEARNING', count: 30 },
    { level: 'FAMILIAR', count: 20 },
    { level: 'LEARNED', count: 15 },
    { level: 'MASTERED', count: 10 },
  ];

  return (
    <Layout streak={0}>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold">Progress</h1>
          <p className="text-muted-foreground mt-1">Track your learning journey and achievements</p>
        </div>

        {/* Daily Goal Progress - Compact */}
        {goal && (
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-3">Today&apos;s Goal</h2>
            <GoalProgressBar
              wordsProgress={todayProgress.wordsStudied}
              wordsGoal={goal.wordsPerDay}
              minutesProgress={todayProgress.minutesStudied}
              minutesGoal={goal.minutesPerDay}
              variant="compact"
            />
          </Card>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Words"
            value={375}
            icon={<BookOpen className="h-4 w-4" />}
            trend={25}
            description="Words in your collection"
          />
          <StatCard
            title="Study Time"
            value={195}
            unit="min"
            icon={<Clock className="h-4 w-4" />}
            trend={15}
            description="This month"
          />
          <StatCard
            title="Mastery Rate"
            value={68.5}
            unit="%"
            icon={<TrendingUp className="h-4 w-4" />}
            trend={5.2}
            description="Words learned or mastered"
          />
          <StatCard
            title="Current Streak"
            value={7}
            icon={<Award className="h-4 w-4" />}
            description="Days in a row"
          />
        </div>

        {/* Contribution Wall */}
        <ContributionWall
          progressData={mockProgressData}
          year={selectedYear}
          onYearChange={setSelectedYear}
        />

        {/* Charts Section with Tabs */}
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>

          <TabsContent value={timeRange} className="space-y-6 mt-6">
            {/* Line Chart */}
            <ProgressLineChart data={mockLineChartData} title="Learning Progress" />

            {/* Pie and Bar Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GroupDistributionPieChart data={mockGroupData} title="Vocabulary Groups" />
              <MasteryLevelBarChart data={mockMasteryData} title="Mastery Levels" />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
