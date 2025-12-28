import {
  BookOpen,
  CheckCircle,
  Keyboard,
  Grid3x3,
  Headphones,
  Shuffle,
} from 'lucide-react';
import type { StudyMode } from '@/components/features/study/StudyModeCard.types';

/**
 * Study Modes Configuration
 * 定義所有可用的學習模式及其設定
 */
export const STUDY_MODES: StudyMode[] = [
  {
    id: 'flashcard',
    title: 'Flashcard',
    description: 'Review vocabulary with spaced repetition',
    icon: BookOpen,
    route: '/study/flashcard',
  },
  {
    id: 'quiz',
    title: 'Quiz',
    description: 'Test your knowledge with multiple choice',
    icon: CheckCircle,
    route: '/study/quiz',
  },
  {
    id: 'spelling',
    title: 'Spelling',
    description: 'Practice typing Japanese readings',
    icon: Keyboard,
    route: '/study/spelling',
  },
  {
    id: 'matching',
    title: 'Matching',
    description: 'Match words with their meanings',
    icon: Grid3x3,
    route: '/study/matching',
  },
  {
    id: 'listening',
    title: 'Listening',
    description: 'Listen and identify vocabulary',
    icon: Headphones,
    route: '/study/listening',
  },
  {
    id: 'random',
    title: 'Random',
    description: 'Mixed question types',
    icon: Shuffle,
    route: '/study/random',
  },
];

/**
 * Get study mode by ID
 * 根據 ID 取得學習模式
 */
export function getStudyModeById(id: string): StudyMode | undefined {
  return STUDY_MODES.find((mode) => mode.id === id);
}

/**
 * Get all study mode IDs
 * 取得所有學習模式的 ID
 */
export function getAllStudyModeIds(): string[] {
  return STUDY_MODES.map((mode) => mode.id);
}

