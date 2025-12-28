'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Volume2 } from 'lucide-react';
import { TTSEngine } from '@/lib/tts';
import { canReplayAudio } from '@/lib/listening';
import type { ListeningQuestion as ListeningQuestionType } from '@/lib/listening';

/**
 * ListeningQuestion component props
 */
export interface ListeningQuestionProps {
  /**
   * The listening question to display
   */
  question: ListeningQuestionType;

  /**
   * Callback when user submits an answer
   */
  onAnswer: (answer: string) => void;

  /**
   * Maximum number of replays allowed
   */
  maxReplays: number;

  /**
   * Callback when audio is replayed
   */
  onReplay?: () => void;
}

/**
 * ListeningQuestion Component
 * 
 * Displays a listening question with audio playback and answer input.
 * Supports both multiple choice and typing modes.
 */
export function ListeningQuestion({
  question,
  onAnswer,
  maxReplays,
  onReplay,
}: ListeningQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [typedAnswer, setTypedAnswer] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [ttsEngine] = useState(() => new TTSEngine());

  // Auto-play audio when question changes
  useEffect(() => {
    playAudio();
  }, [question.id]);

  const playAudio = async () => {
    setIsPlaying(true);
    try {
      await ttsEngine.speak(question.word);
    } catch (error) {
      console.error('Failed to play audio:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleReplay = () => {
    if (canReplayAudio(question, maxReplays)) {
      playAudio();
      onReplay?.();
    }
  };

  const handleMultipleChoiceSelect = (answer: string) => {
    setSelectedAnswer(answer);
    onAnswer(answer);
  };

  const handleTypingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typedAnswer.trim()) {
      onAnswer(typedAnswer.trim());
    }
  };

  const canReplay = canReplayAudio(question, maxReplays);

  return (
    <div className="space-y-6">
      {/* Audio playback section */}
      <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <Volume2 className="h-16 w-16 text-primary" />
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Listen and select the correct meaning
        </p>
        
        <Button
          onClick={handleReplay}
          disabled={!canReplay || isPlaying}
          variant="outline"
          aria-label="Replay audio"
        >
          <Volume2 className="h-4 w-4 mr-2" />
          Replay {question.replaysUsed > 0 && `(${question.replaysUsed}/${maxReplays})`}
        </Button>
      </div>

      {/* Answer section */}
      {question.type === 'multiple-choice' && question.options && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {question.options.map((option) => (
            <Button
              key={option}
              onClick={() => handleMultipleChoiceSelect(option)}
              variant={selectedAnswer === option ? 'default' : 'outline'}
              className={`h-auto py-4 text-lg ${
                selectedAnswer === option ? 'bg-primary' : ''
              }`}
              aria-label={option}
            >
              {option}
            </Button>
          ))}
        </div>
      )}

      {question.type === 'typing' && (
        <form onSubmit={handleTypingSubmit} className="space-y-4">
          <Input
            type="text"
            value={typedAnswer}
            onChange={(e) => setTypedAnswer(e.target.value)}
            placeholder="Type the meaning..."
            className="text-lg"
            autoFocus
          />
          <Button
            type="submit"
            disabled={!typedAnswer.trim()}
            className="w-full"
            aria-label="Submit answer"
          >
            Submit
          </Button>
        </form>
      )}
    </div>
  );
}

