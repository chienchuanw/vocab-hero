import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { StudyModeCardProps } from './StudyModeCard.types';

/**
 * StudyModeCard Component
 * 顯示單一學習模式的卡片，包含圖示、標題、描述和導航連結
 */
export function StudyModeCard({ mode }: StudyModeCardProps) {
  const Icon = mode.icon;

  return (
    <Link href={mode.route} className="block">
      <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">{mode.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-base">{mode.description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
