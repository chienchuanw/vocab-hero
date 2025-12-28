'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MatchingCard } from '@/components/features/matching/MatchingCard';
import { MatchAnimation } from '@/components/features/matching/MatchAnimation';
import { GameComplete } from '@/components/features/matching/GameComplete';
import { useMatchingGame } from '@/hooks/useMatchingGame';
import { generateShuffledPairs, type VocabularyItem } from '@/lib/matching/matching-generator';

/**
 * Matching Game Page
 * 配對遊戲頁面 - 5 組配對、不限時但記錄完成時間
 */
export default function MatchingGamePage() {
  const router = useRouter();

  // TODO: 從 API 獲取單字資料
  // 暫時使用模擬資料
  const [vocabulary] = useState<VocabularyItem[]>([
    { id: '1', word: '勉強', meaning: 'study', reading: 'べんきょう' },
    { id: '2', word: '学校', meaning: 'school', reading: 'がっこう' },
    { id: '3', word: '先生', meaning: 'teacher', reading: 'せんせい' },
    { id: '4', word: '学生', meaning: 'student', reading: 'がくせい' },
    { id: '5', word: '本', meaning: 'book', reading: 'ほん' },
  ]);

  // 生成並洗牌配對卡片
  const initialCards = useMemo(() => generateShuffledPairs(vocabulary, 5), [vocabulary]);

  const game = useMatchingGame(initialCards);

  /**
   * 檢查卡片是否被選中
   */
  const isCardSelected = (cardId: string) => game.selectedCards.includes(cardId);

  /**
   * 檢查卡片是否已配對
   */
  const isCardMatched = (pairId: string) => game.matchedPairs.includes(pairId);

  /**
   * 檢查卡片是否顯示錯誤狀態
   */
  const isCardError = (cardId: string) => {
    // 如果選擇了兩張卡片且當前卡片是其中之一
    if (game.selectedCards.length === 2 && game.selectedCards.includes(cardId)) {
      const [card1Id, card2Id] = game.selectedCards;
      const card1 = game.cards.find((c) => c.id === card1Id);
      const card2 = game.cards.find((c) => c.id === card2Id);

      // 如果兩張卡片的 pairId 不同，顯示錯誤
      if (card1 && card2 && card1.pairId !== card2.pairId) {
        return true;
      }
    }
    return false;
  };

  // 顯示完成畫面
  if (game.isComplete) {
    return (
      <div className="container mx-auto max-w-2xl py-8">
        <GameComplete
          elapsedTime={game.elapsedTime}
          attempts={game.attempts}
          onRestart={game.restart}
          onBackToStudy={() => router.push('/study')}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Matching Game</h1>
          <Button variant="ghost" onClick={() => router.push('/study')}>
            ← Back to Study
          </Button>
        </div>
        <p className="text-muted-foreground">
          Match Japanese words with their meanings. Find all 5 pairs as quickly as you can!
        </p>
      </div>

      {/* 遊戲統計 */}
      <div className="mb-6 flex gap-4 justify-center text-sm text-muted-foreground">
        <div>Matched: {game.matchedPairs.length} / 5</div>
        <div>•</div>
        <div>Attempts: {game.attempts}</div>
        {game.elapsedTime > 0 && (
          <>
            <div>•</div>
            <div>
              Time: {Math.floor(game.elapsedTime / 60)}:
              {(game.elapsedTime % 60).toString().padStart(2, '0')}
            </div>
          </>
        )}
      </div>

      {/* 配對卡片網格 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {game.cards.map((card) => (
          <MatchingCard
            key={card.id}
            content={card.content}
            type={card.type}
            onClick={() => game.selectCard(card.id)}
            isSelected={isCardSelected(card.id)}
            isMatched={isCardMatched(card.pairId)}
            isError={isCardError(card.id)}
            disabled={game.selectedCards.length >= 2 && !isCardSelected(card.id)}
          />
        ))}
      </div>

      {/* 配對成功動畫 */}
      <MatchAnimation show={game.showMatchAnimation} />
    </div>
  );
}
