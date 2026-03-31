'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import confetti from 'canvas-confetti';
import { Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * GoalCelebration Props
 */
export interface GoalCelebrationProps {
  isWordsGoalAchieved: boolean;
  isMinutesGoalAchieved: boolean;
  show: boolean;
  message?: string | null;
}

/**
 * GoalCelebration Component
 * Displays celebration animation when daily goals are achieved
 *
 * Uses canvas-confetti for visual celebration effect
 */
export function GoalCelebration({
  isWordsGoalAchieved,
  isMinutesGoalAchieved,
  show,
  message,
}: GoalCelebrationProps) {
  const t = useTranslations('goals');
  const prefersReducedMotion = usePrefersReducedMotion();
  const isBothGoalsAchieved = isWordsGoalAchieved && isMinutesGoalAchieved;
  const displayMessage = message || t('goalAchieved');

  useEffect(() => {
    if (!show || !isBothGoalsAchieved || prefersReducedMotion) {
      return;
    }

    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, [show, isBothGoalsAchieved, prefersReducedMotion]);

  if (!show || !isBothGoalsAchieved) {
    return null;
  }

  return (
    <Card
      className={`p-6 bg-success/5 border-success/20 ${prefersReducedMotion ? '' : 'success-animation'}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-success/10 p-3">
          <Trophy className="h-8 w-8 text-success" role="img" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-success">
            {t('congratulations')}
          </h3>
          <p className="text-sm text-success">{displayMessage}</p>
        </div>
      </div>
    </Card>
  );
}
