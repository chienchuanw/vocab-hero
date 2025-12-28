import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StudyModeCard } from './StudyModeCard';
import { BookOpen } from 'lucide-react';

/**
 * StudyModeCard Tests
 * 測試學習模式卡片元件
 */
describe('StudyModeCard', () => {
  const mockMode = {
    id: 'flashcard',
    title: 'Flashcard',
    description: 'Review vocabulary with spaced repetition',
    icon: BookOpen,
    route: '/study/flashcard',
  };

  it('should render mode title', () => {
    render(<StudyModeCard mode={mockMode} />);
    
    expect(screen.getByText('Flashcard')).toBeInTheDocument();
  });

  it('should render mode description', () => {
    render(<StudyModeCard mode={mockMode} />);
    
    expect(screen.getByText('Review vocabulary with spaced repetition')).toBeInTheDocument();
  });

  it('should render as a link with correct href', () => {
    render(<StudyModeCard mode={mockMode} />);
    
    const link = screen.getByRole('link', { name: /flashcard/i });
    expect(link).toHaveAttribute('href', '/study/flashcard');
  });

  it('should render icon component', () => {
    const { container } = render(<StudyModeCard mode={mockMode} />);
    
    // 檢查 SVG 圖示是否存在
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should have hover effect classes', () => {
    const { container } = render(<StudyModeCard mode={mockMode} />);
    
    const card = container.querySelector('.hover\\:shadow-lg');
    expect(card).toBeInTheDocument();
  });

  it('should be keyboard accessible', () => {
    render(<StudyModeCard mode={mockMode} />);
    
    const link = screen.getByRole('link', { name: /flashcard/i });
    expect(link).toBeInTheDocument();
  });

  it('should render with different mode data', () => {
    const quizMode = {
      id: 'quiz',
      title: 'Quiz',
      description: 'Test your knowledge with multiple choice',
      icon: BookOpen,
      route: '/study/quiz',
    };

    render(<StudyModeCard mode={quizMode} />);
    
    expect(screen.getByText('Quiz')).toBeInTheDocument();
    expect(screen.getByText('Test your knowledge with multiple choice')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/study/quiz');
  });

  it('should have proper card styling', () => {
    const { container } = render(<StudyModeCard mode={mockMode} />);
    
    // 檢查卡片容器
    const card = container.querySelector('.rounded-lg');
    expect(card).toBeInTheDocument();
  });

  it('should display icon with proper size', () => {
    const { container } = render(<StudyModeCard mode={mockMode} />);
    
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-8', 'w-8');
  });
});

