import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StudyPage from './page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/study',
}));

/**
 * StudyPage Tests
 * 測試學習模式選擇頁面
 */
describe('StudyPage', () => {
  it('should render page title and description', () => {
    render(<StudyPage />);

    expect(screen.getByRole('heading', { name: /study/i })).toBeInTheDocument();
    expect(screen.getByText(/choose a study mode/i)).toBeInTheDocument();
  });

  it('should render all study mode cards', () => {
    render(<StudyPage />);

    // 檢查所有 6 種學習模式
    expect(screen.getByRole('link', { name: /flashcard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /quiz/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /spelling/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /matching/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /listening/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /random/i })).toBeInTheDocument();
  });

  it('should display descriptions for each study mode', () => {
    render(<StudyPage />);

    expect(screen.getByText(/review vocabulary with spaced repetition/i)).toBeInTheDocument();
    expect(screen.getByText(/test your knowledge with multiple choice/i)).toBeInTheDocument();
    expect(screen.getByText(/practice typing japanese readings/i)).toBeInTheDocument();
    expect(screen.getByText(/match words with their meanings/i)).toBeInTheDocument();
    expect(screen.getByText(/listen and identify vocabulary/i)).toBeInTheDocument();
    expect(screen.getByText(/mixed question types/i)).toBeInTheDocument();
  });

  it('should navigate to flashcard mode when clicked', async () => {
    const user = userEvent.setup();
    render(<StudyPage />);

    const flashcardLink = screen.getByRole('link', { name: /flashcard/i });
    expect(flashcardLink).toHaveAttribute('href', '/study/flashcard');
  });

  it('should navigate to quiz mode when clicked', async () => {
    const user = userEvent.setup();
    render(<StudyPage />);

    const quizLink = screen.getByRole('link', { name: /quiz/i });
    expect(quizLink).toHaveAttribute('href', '/study/quiz');
  });

  it('should navigate to spelling mode when clicked', async () => {
    const user = userEvent.setup();
    render(<StudyPage />);

    const spellingLink = screen.getByRole('link', { name: /spelling/i });
    expect(spellingLink).toHaveAttribute('href', '/study/spelling');
  });

  it('should navigate to matching mode when clicked', async () => {
    const user = userEvent.setup();
    render(<StudyPage />);

    const matchingLink = screen.getByRole('link', { name: /matching/i });
    expect(matchingLink).toHaveAttribute('href', '/study/matching');
  });

  it('should navigate to listening mode when clicked', async () => {
    const user = userEvent.setup();
    render(<StudyPage />);

    const listeningLink = screen.getByRole('link', { name: /listening/i });
    expect(listeningLink).toHaveAttribute('href', '/study/listening');
  });

  it('should navigate to random mode when clicked', async () => {
    const user = userEvent.setup();
    render(<StudyPage />);

    const randomLink = screen.getByRole('link', { name: /random/i });
    expect(randomLink).toHaveAttribute('href', '/study/random');
  });

  it('should have proper accessibility attributes', () => {
    render(<StudyPage />);

    const studyModeCards = screen.getAllByRole('link');

    // 所有卡片都應該可以透過鍵盤存取
    studyModeCards.forEach((card) => {
      expect(card).toHaveAttribute('href');
    });
  });

  it('should display study mode cards in a grid layout', () => {
    const { container } = render(<StudyPage />);

    // 檢查網格容器
    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toBeInTheDocument();
  });
});
