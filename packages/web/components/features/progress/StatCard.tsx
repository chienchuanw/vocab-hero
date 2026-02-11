import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  unit?: string;
  icon?: ReactNode;
  description?: string;
  trend?: number;
  className?: string;
}

/**
 * StatCard Component
 * Displays a single statistic with optional icon, description, and trend indicator
 *
 * @param title - The title of the statistic
 * @param value - The numeric value to display
 * @param unit - Optional unit to display after the value (e.g., '%', 'min')
 * @param icon - Optional icon to display
 * @param description - Optional description text
 * @param trend - Optional trend value (positive or negative)
 * @param className - Optional additional CSS classes
 */
export function StatCard({
  title,
  value,
  unit,
  icon,
  description,
  trend,
  className,
}: StatCardProps) {
  const formatValue = (val: number): string => {
    if (Number.isInteger(val)) {
      return val.toLocaleString();
    }
    return val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  const displayValue = unit === '%' ? `${formatValue(value)}%` : formatValue(value);
  const displayUnit = unit && unit !== '%' ? ` ${unit}` : '';

  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {displayValue}
          {displayUnit}
        </div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend !== undefined && trend !== 0 && (
          <div
            className={cn(
              'flex items-center text-xs mt-2',
              trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            )}
          >
            {trend > 0 ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            <span>
              {trend > 0 ? '+' : ''}
              {trend}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

