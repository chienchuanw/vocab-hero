/**
 * Goal Progress Calculation Utilities
 * Functions for calculating daily goal progress and achievement status
 */

/**
 * Goal progress input parameters
 */
export interface GoalProgressInput {
  wordsStudied: number;
  minutesStudied: number;
  wordsGoal: number;
  minutesGoal: number;
}

/**
 * Goal progress calculation result
 */
export interface GoalProgressResult {
  wordsProgress: number;
  wordsPercentage: number;
  minutesProgress: number;
  minutesPercentage: number;
  isWordsGoalAchieved: boolean;
  isMinutesGoalAchieved: boolean;
  isBothGoalsAchieved: boolean;
}

/**
 * Calculate goal progress for both words and minutes
 *
 * @param input - Current progress and goal values
 * @returns Detailed progress information
 */
export function calculateGoalProgress(input: GoalProgressInput): GoalProgressResult {
  const { wordsStudied, minutesStudied, wordsGoal, minutesGoal } = input;

  const wordsPercentage = getGoalProgressPercentage(wordsStudied, wordsGoal);
  const minutesPercentage = getGoalProgressPercentage(minutesStudied, minutesGoal);

  const isWordsGoalAchieved = isGoalAchieved(wordsStudied, wordsGoal);
  const isMinutesGoalAchieved = isGoalAchieved(minutesStudied, minutesGoal);

  return {
    wordsProgress: wordsStudied,
    wordsPercentage,
    minutesProgress: minutesStudied,
    minutesPercentage,
    isWordsGoalAchieved,
    isMinutesGoalAchieved,
    isBothGoalsAchieved: isWordsGoalAchieved && isMinutesGoalAchieved,
  };
}

/**
 * Check if a goal has been achieved
 *
 * @param progress - Current progress value
 * @param goal - Goal target value
 * @returns True if progress meets or exceeds goal
 */
export function isGoalAchieved(progress: number, goal: number): boolean {
  return progress >= goal;
}

/**
 * Calculate progress percentage
 *
 * @param progress - Current progress value
 * @param goal - Goal target value
 * @returns Percentage value (0-100+), rounded to nearest integer
 */
export function getGoalProgressPercentage(progress: number, goal: number): number {
  if (goal === 0) {
    return 0;
  }

  return Math.round((progress / goal) * 100);
}

