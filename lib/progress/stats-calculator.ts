/**
 * Statistics Calculator
 * Utility functions for calculating progress statistics
 */

export interface VocabularyWithMastery {
  id: string;
  masteryLevel: 'NEW' | 'LEARNING' | 'FAMILIAR' | 'LEARNED' | 'MASTERED';
  groups?: Array<{ id: string; name: string }>;
}

export interface ProgressLog {
  wordsStudied: number;
  timeSpentMinutes: number;
  date?: Date;
}

export interface MasteryDistribution {
  level: string;
  count: number;
}

export interface GroupDistribution {
  name: string;
  value: number;
  color: string;
}

const GROUP_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
];

/**
 * Calculate total number of vocabulary items
 */
export function calculateTotalWords(vocabulary: VocabularyWithMastery[]): number {
  return vocabulary.length;
}

/**
 * Calculate mastery rate (percentage of LEARNED and MASTERED words)
 */
export function calculateMasteryRate(vocabulary: VocabularyWithMastery[]): number {
  if (vocabulary.length === 0) return 0;

  const masteredCount = vocabulary.filter(
    (v) => v.masteryLevel === 'LEARNED' || v.masteryLevel === 'MASTERED'
  ).length;

  return Math.round((masteredCount / vocabulary.length) * 100);
}

/**
 * Calculate total study time from progress logs
 */
export function calculateTotalStudyTime(logs: ProgressLog[]): number {
  return logs.reduce((total, log) => total + log.timeSpentMinutes, 0);
}

/**
 * Calculate mastery level distribution
 */
export function calculateMasteryDistribution(
  vocabulary: VocabularyWithMastery[]
): MasteryDistribution[] {
  const levels: Array<'NEW' | 'LEARNING' | 'FAMILIAR' | 'LEARNED' | 'MASTERED'> = [
    'NEW',
    'LEARNING',
    'FAMILIAR',
    'LEARNED',
    'MASTERED',
  ];

  const counts = levels.map((level) => ({
    level,
    count: vocabulary.filter((v) => v.masteryLevel === level).length,
  }));

  return counts;
}

/**
 * Calculate group distribution
 */
export function calculateGroupDistribution(
  vocabulary: Array<{ id: string; groups?: Array<{ id: string; name: string }> }>
): GroupDistribution[] {
  const groupCounts = new Map<string, number>();

  vocabulary.forEach((item) => {
    if (!item.groups || item.groups.length === 0) {
      groupCounts.set('Ungrouped', (groupCounts.get('Ungrouped') || 0) + 1);
    } else {
      item.groups.forEach((group) => {
        groupCounts.set(group.name, (groupCounts.get(group.name) || 0) + 1);
      });
    }
  });

  const distribution: GroupDistribution[] = [];
  let colorIndex = 0;

  groupCounts.forEach((count, name) => {
    distribution.push({
      name,
      value: count,
      color: GROUP_COLORS[colorIndex % GROUP_COLORS.length] || '#94a3b8',
    });
    colorIndex++;
  });

  return distribution;
}

/**
 * Calculate progress trend (difference between current and previous period)
 */
export function calculateProgressTrend(
  currentLogs: ProgressLog[],
  previousLogs: ProgressLog[]
): number {
  const currentTotal = currentLogs.reduce((sum, log) => sum + log.wordsStudied, 0);
  const previousTotal = previousLogs.reduce((sum, log) => sum + log.wordsStudied, 0);

  if (previousTotal === 0) return 0;

  return currentTotal - previousTotal;
}

/**
 * Format progress data for line chart
 */
export function formatProgressForLineChart(
  logs: ProgressLog[]
): Array<{ date: string; wordsStudied: number; timeSpent: number }> {
  return logs.map((log) => ({
    date: log.date ? new Date(log.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }) : '',
    wordsStudied: log.wordsStudied,
    timeSpent: log.timeSpentMinutes,
  }));
}

