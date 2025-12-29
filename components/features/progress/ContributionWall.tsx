import { useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProgressData {
  date: Date;
  wordsStudied: number;
  timeSpentMinutes: number;
}

interface ContributionWallProps {
  progressData: ProgressData[];
  year: number;
}

const WEEKDAYS = ['Mon', 'Wed', 'Fri'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getIntensityLevel(wordsStudied: number): number {
  if (wordsStudied === 0) return 0;
  if (wordsStudied <= 5) return 1;
  if (wordsStudied <= 15) return 2;
  if (wordsStudied <= 30) return 3;
  return 4;
}

function getIntensityColor(level: number): string {
  const colors = [
    'bg-muted',
    'bg-green-200 dark:bg-green-900',
    'bg-green-400 dark:bg-green-700',
    'bg-green-600 dark:bg-green-500',
    'bg-green-800 dark:bg-green-300',
  ];
  return colors[level] ?? colors[0] ?? 'bg-muted';
}

export function ContributionWall({ progressData, year }: ContributionWallProps) {
  const { cells, monthPositions } = useMemo(() => {
    const dataMap = new Map<string, ProgressData>();
    progressData.forEach((data) => {
      const dateKey = data.date.toISOString().split('T')[0];
      if (dateKey) {
        dataMap.set(dateKey, data);
      }
    });

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const firstDayOfWeek = startDate.getDay();
    const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const cellsArray: Array<{
      date: Date;
      intensity: number;
      wordsStudied: number;
      timeSpentMinutes: number;
    }> = [];

    const monthPositionsArray: Array<{ month: string; column: number }> = [];
    let lastMonth = -1;

    for (let i = 0; i < offset; i++) {
      cellsArray.push({
        date: new Date(0),
        intensity: 0,
        wordsStudied: 0,
        timeSpentMinutes: 0,
      });
    }

    const currentDate = new Date(startDate);
    let weekIndex = 0;

    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const data = dateKey ? dataMap.get(dateKey) : undefined;
      const wordsStudied = data?.wordsStudied || 0;

      cellsArray.push({
        date: new Date(currentDate),
        intensity: getIntensityLevel(wordsStudied),
        wordsStudied,
        timeSpentMinutes: data?.timeSpentMinutes || 0,
      });

      const currentMonth = currentDate.getMonth();
      if (currentMonth !== lastMonth && currentDate.getDate() <= 7) {
        monthPositionsArray.push({
          month: MONTHS[currentMonth] || '',
          column: weekIndex,
        });
        lastMonth = currentMonth;
      }

      if (currentDate.getDay() === 0) {
        weekIndex++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return { cells: cellsArray, monthPositions: monthPositionsArray };
  }, [progressData, year]);

  const weeks = Math.ceil(cells.length / 7);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <TooltipProvider>
      <div className="space-y-2">
        <div className="relative">
          <div className="flex gap-1">
            <div className="flex flex-col justify-around text-xs text-muted-foreground w-8">
              {WEEKDAYS.map((day) => (
                <div key={day} className="h-3">
                  {day}
                </div>
              ))}
            </div>

            <div className="flex-1">
              <div className="flex gap-1 mb-2 text-xs text-muted-foreground">
                {monthPositions.map((pos, idx) => (
                  <div
                    key={idx}
                    style={{
                      marginLeft:
                        idx === 0
                          ? 0
                          : `${(pos.column - (monthPositions[idx - 1]?.column || 0)) * 12}px`,
                    }}
                  >
                    {pos.month}
                  </div>
                ))}
              </div>

              <div
                className="grid gap-1"
                style={{
                  gridTemplateColumns: `repeat(${weeks}, 10px)`,
                  gridTemplateRows: 'repeat(7, 10px)',
                  gridAutoFlow: 'column',
                }}
              >
                {cells.map((cell, idx) => {
                  const dateKey = cell.date.toISOString().split('T')[0];
                  const hasData = cell.date.getTime() > 0;

                  return (
                    <Tooltip key={idx} delayDuration={200}>
                      <TooltipTrigger asChild>
                        <div
                          data-testid={`contribution-cell-${idx}`}
                          data-date={hasData ? dateKey : undefined}
                          className={`w-2.5 h-2.5 rounded-sm cursor-pointer ${getIntensityColor(cell.intensity)}`}
                        />
                      </TooltipTrigger>
                      {hasData && (
                        <TooltipContent>
                          <div className="text-xs">
                            <div className="font-semibold">{formatDate(cell.date)}</div>
                            <div className="text-muted-foreground">
                              {cell.wordsStudied} words, {cell.timeSpentMinutes} min
                            </div>
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
