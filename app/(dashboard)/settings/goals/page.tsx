'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDailyGoal, useUpdateDailyGoal } from '@/hooks/useDailyGoal';
import { toast } from 'sonner';
import { Loader2, Target, Clock, Bell } from 'lucide-react';

/**
 * GoalSettings Page
 * Page for configuring daily study goals
 */
export default function GoalSettingsPage() {
  const DEFAULT_USER_ID = 'cmjod038p00008o9qathx7chz';
  
  const { data: goal, isLoading } = useDailyGoal(DEFAULT_USER_ID);
  const updateMutation = useUpdateDailyGoal();

  const [formData, setFormData] = useState({
    wordsPerDay: 10,
    minutesPerDay: 30,
    reminderTime: '10:00',
  });

  useEffect(() => {
    if (goal) {
      setFormData({
        wordsPerDay: goal.wordsPerDay,
        minutesPerDay: goal.minutesPerDay,
        reminderTime: goal.reminderTime,
      });
    }
  }, [goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateMutation.mutateAsync({
        userId: DEFAULT_USER_ID,
        ...formData,
      });
      toast.success('Goals updated successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update goals');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-2xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Daily Goals</h1>
          <p className="text-muted-foreground mt-2">
            Set your daily study targets to stay motivated and track progress
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Goal Settings</CardTitle>
            <CardDescription>
              Configure your daily learning objectives
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="wordsPerDay" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Words Per Day
                </Label>
                <Input
                  id="wordsPerDay"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.wordsPerDay}
                  onChange={(e) =>
                    setFormData({ ...formData, wordsPerDay: parseInt(e.target.value) || 1 })
                  }
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Number of new words to study each day (1-100)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minutesPerDay" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Minutes Per Day
                </Label>
                <Input
                  id="minutesPerDay"
                  type="number"
                  min="5"
                  max="120"
                  value={formData.minutesPerDay}
                  onChange={(e) =>
                    setFormData({ ...formData, minutesPerDay: parseInt(e.target.value) || 5 })
                  }
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Daily study time goal in minutes (5-120)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminderTime" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Daily Reminder Time
                </Label>
                <Input
                  id="reminderTime"
                  type="time"
                  value={formData.reminderTime}
                  onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Time to receive daily study reminders
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Goals'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

