import type { LucideIcon } from 'lucide-react';

/**
 * Study Mode 介面
 * 定義學習模式的基本資訊
 */
export interface StudyMode {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  route: string;
}

/**
 * StudyModeCard Props
 * 學習模式卡片元件的屬性
 */
export interface StudyModeCardProps {
  mode: StudyMode;
}

