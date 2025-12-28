import { StudyModeCard } from '@/components/features/study/StudyModeCard';
import { STUDY_MODES } from '@/lib/study/study-modes';

/**
 * Study Page
 * 學習模式選擇頁面
 * 顯示所有可用的學習模式供使用者選擇
 */
export default function StudyPage(): JSX.Element {
  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Study</h1>
        <p className="text-muted-foreground">
          Choose a study mode to practice your vocabulary
        </p>
      </div>

      {/* Study Mode Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {STUDY_MODES.map((mode) => (
          <StudyModeCard key={mode.id} mode={mode} />
        ))}
      </div>
    </div>
  );
}

