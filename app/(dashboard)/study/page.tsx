'use client';

import { useTranslations } from 'next-intl';
import { Layout } from '@/components/shared';
import { StudyModeCard } from '@/components/features/study/StudyModeCard';
import { STUDY_MODES } from '@/lib/study/study-modes';

/**
 * Study Page
 * 學習模式選擇頁面
 * 顯示所有可用的學習模式供使用者選擇
 */
export default function StudyPage() {
  const t = useTranslations('study');

  // 翻譯學習模式資料
  const translatedModes = STUDY_MODES.map((mode) => ({
    ...mode,
    title: t(mode.id),
    description: t(`${mode.id}Desc`),
  }));

  return (
    <Layout streak={0}>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('description')}</p>
        </div>

        {/* Study Mode Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {translatedModes.map((mode) => (
            <StudyModeCard key={mode.id} mode={mode} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
