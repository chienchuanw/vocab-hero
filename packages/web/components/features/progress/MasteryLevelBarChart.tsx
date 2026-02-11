'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { cn } from '@/lib/utils';

interface MasteryLevelData {
  level: string;
  count: number;
}

interface MasteryLevelBarChartProps {
  data: MasteryLevelData[];
  title: string;
  height?: number;
  className?: string;
}

/**
 * MasteryLevelBarChart Component
 * Displays vocabulary mastery level distribution using a bar chart
 *
 * @param data - Array of mastery level data with level name and count
 * @param title - Chart title
 * @param height - Chart height in pixels (default: 300)
 * @param className - Optional additional CSS classes
 */
export function MasteryLevelBarChart({
  data,
  title,
  height = 300,
  className,
}: MasteryLevelBarChartProps) {
  const hasData = data && data.length > 0;

  const LEVEL_COLORS: Record<string, string> = {
    NEW: '#94a3b8',
    LEARNING: '#60a5fa',
    FAMILIAR: '#34d399',
    LEARNED: '#fbbf24',
    MASTERED: '#f87171',
  };

  const getBarColor = (level: string): string => {
    return LEVEL_COLORS[level] || '#94a3b8';
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="level"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.level)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

