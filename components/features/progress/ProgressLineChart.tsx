'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { cn } from '@/lib/utils';

interface ProgressDataPoint {
  date: string;
  wordsStudied: number;
  timeSpent: number;
}

interface ProgressLineChartProps {
  data: ProgressDataPoint[];
  title: string;
  height?: number;
  className?: string;
}

/**
 * ProgressLineChart Component
 * Displays learning progress over time using a line chart
 *
 * @param data - Array of progress data points with date, words studied, and time spent
 * @param title - Chart title
 * @param height - Chart height in pixels (default: 300)
 * @param className - Optional additional CSS classes
 */
export function ProgressLineChart({
  data,
  title,
  height = 300,
  className,
}: ProgressLineChartProps) {
  const hasData = data && data.length > 0;

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
            <LineChart
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
                dataKey="date"
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
              <Legend />
              <Line
                type="monotone"
                dataKey="wordsStudied"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Words Studied"
                dot={{ fill: 'hsl(var(--primary))' }}
              />
              <Line
                type="monotone"
                dataKey="timeSpent"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                name="Time Spent (min)"
                dot={{ fill: 'hsl(var(--chart-2))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

