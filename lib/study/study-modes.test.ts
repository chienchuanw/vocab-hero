import { describe, it, expect } from 'vitest';
import { STUDY_MODES, getStudyModeById, getAllStudyModeIds } from './study-modes';
import { BookOpen, CheckCircle, Keyboard, Grid3x3, Headphones, Shuffle } from 'lucide-react';

describe('STUDY_MODES', () => {
  it('should contain all study modes', () => {
    expect(STUDY_MODES).toHaveLength(6);
  });

  it('should have flashcard mode', () => {
    const flashcard = STUDY_MODES.find((mode) => mode.id === 'flashcard');

    expect(flashcard).toBeDefined();
    expect(flashcard?.title).toBe('Flashcard');
    expect(flashcard?.description).toBe('Review vocabulary with spaced repetition');
    expect(flashcard?.icon).toBe(BookOpen);
    expect(flashcard?.route).toBe('/study/flashcard');
  });

  it('should have quiz mode', () => {
    const quiz = STUDY_MODES.find((mode) => mode.id === 'quiz');

    expect(quiz).toBeDefined();
    expect(quiz?.title).toBe('Quiz');
    expect(quiz?.description).toBe('Test your knowledge with multiple choice');
    expect(quiz?.icon).toBe(CheckCircle);
    expect(quiz?.route).toBe('/study/quiz');
  });

  it('should have spelling mode', () => {
    const spelling = STUDY_MODES.find((mode) => mode.id === 'spelling');

    expect(spelling).toBeDefined();
    expect(spelling?.title).toBe('Spelling');
    expect(spelling?.description).toBe('Practice typing Japanese readings');
    expect(spelling?.icon).toBe(Keyboard);
    expect(spelling?.route).toBe('/study/spelling');
  });

  it('should have matching mode', () => {
    const matching = STUDY_MODES.find((mode) => mode.id === 'matching');

    expect(matching).toBeDefined();
    expect(matching?.title).toBe('Matching');
    expect(matching?.description).toBe('Match words with their meanings');
    expect(matching?.icon).toBe(Grid3x3);
    expect(matching?.route).toBe('/study/matching');
  });

  it('should have listening mode', () => {
    const listening = STUDY_MODES.find((mode) => mode.id === 'listening');

    expect(listening).toBeDefined();
    expect(listening?.title).toBe('Listening');
    expect(listening?.description).toBe('Listen and identify vocabulary');
    expect(listening?.icon).toBe(Headphones);
    expect(listening?.route).toBe('/study/listening');
  });

  it('should have random mode', () => {
    const random = STUDY_MODES.find((mode) => mode.id === 'random');

    expect(random).toBeDefined();
    expect(random?.title).toBe('Random');
    expect(random?.description).toBe('Mixed question types');
    expect(random?.icon).toBe(Shuffle);
    expect(random?.route).toBe('/study/random');
  });

  it('should have unique IDs for all modes', () => {
    const ids = STUDY_MODES.map((mode) => mode.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(STUDY_MODES.length);
  });

  it('should have valid routes for all modes', () => {
    STUDY_MODES.forEach((mode) => {
      expect(mode.route).toMatch(/^\/study\//);
      expect(mode.route).toBe(`/study/${mode.id}`);
    });
  });

  it('should have icon components for all modes', () => {
    STUDY_MODES.forEach((mode) => {
      expect(mode.icon).toBeDefined();
      expect(mode.icon).toBeTypeOf('object');
    });
  });

  it('should have titles for all modes', () => {
    STUDY_MODES.forEach((mode) => {
      expect(mode.title).toBeDefined();
      expect(mode.title.length).toBeGreaterThan(0);
    });
  });

  it('should have descriptions for all modes', () => {
    STUDY_MODES.forEach((mode) => {
      expect(mode.description).toBeDefined();
      expect(mode.description.length).toBeGreaterThan(0);
    });
  });
});

describe('getStudyModeById', () => {
  it('should return flashcard mode by ID', () => {
    const mode = getStudyModeById('flashcard');

    expect(mode).toBeDefined();
    expect(mode?.id).toBe('flashcard');
    expect(mode?.title).toBe('Flashcard');
  });

  it('should return quiz mode by ID', () => {
    const mode = getStudyModeById('quiz');

    expect(mode).toBeDefined();
    expect(mode?.id).toBe('quiz');
    expect(mode?.title).toBe('Quiz');
  });

  it('should return spelling mode by ID', () => {
    const mode = getStudyModeById('spelling');

    expect(mode).toBeDefined();
    expect(mode?.id).toBe('spelling');
    expect(mode?.title).toBe('Spelling');
  });

  it('should return matching mode by ID', () => {
    const mode = getStudyModeById('matching');

    expect(mode).toBeDefined();
    expect(mode?.id).toBe('matching');
    expect(mode?.title).toBe('Matching');
  });

  it('should return listening mode by ID', () => {
    const mode = getStudyModeById('listening');

    expect(mode).toBeDefined();
    expect(mode?.id).toBe('listening');
    expect(mode?.title).toBe('Listening');
  });

  it('should return random mode by ID', () => {
    const mode = getStudyModeById('random');

    expect(mode).toBeDefined();
    expect(mode?.id).toBe('random');
    expect(mode?.title).toBe('Random');
  });

  it('should return undefined for non-existent ID', () => {
    const mode = getStudyModeById('non-existent');

    expect(mode).toBeUndefined();
  });

  it('should return undefined for empty string', () => {
    const mode = getStudyModeById('');

    expect(mode).toBeUndefined();
  });

  it('should be case-sensitive', () => {
    const mode = getStudyModeById('FLASHCARD');

    expect(mode).toBeUndefined();
  });
});

describe('getAllStudyModeIds', () => {
  it('should return all study mode IDs', () => {
    const ids = getAllStudyModeIds();

    expect(ids).toEqual(['flashcard', 'quiz', 'spelling', 'matching', 'listening', 'random']);
  });

  it('should return array with 6 IDs', () => {
    const ids = getAllStudyModeIds();

    expect(ids).toHaveLength(6);
  });

  it('should return unique IDs', () => {
    const ids = getAllStudyModeIds();
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should return array of strings', () => {
    const ids = getAllStudyModeIds();

    ids.forEach((id) => {
      expect(typeof id).toBe('string');
    });
  });

  it('should match STUDY_MODES order', () => {
    const ids = getAllStudyModeIds();
    const expectedIds = STUDY_MODES.map((mode) => mode.id);

    expect(ids).toEqual(expectedIds);
  });
});
