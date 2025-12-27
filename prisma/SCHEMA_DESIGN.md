# Database Schema Design

This document outlines the database schema design for Vocab Hero application.

## Core Models

### User
Single user application, but keeping user model for future multi-user support.

```prisma
model User {
  id        String   @id @default(cuid())
  email     String?  @unique
  name      String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  vocabularyGroups VocabularyGroup[]
  studySessions    StudySession[]
  progressLogs     ProgressLog[]
  dailyGoals       DailyGoal[]

  @@map("users")
}
```

### VocabularyItem
Individual vocabulary entries.

```prisma
model VocabularyItem {
  id              String   @id @default(cuid())
  word            String
  reading         String
  meaning         String
  exampleSentence String?  @map("example_sentence")
  notes           String?
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  groups          VocabularyGroup[]
  reviewSchedule  ReviewSchedule?

  @@map("vocabulary_items")
}
```

### VocabularyGroup
Collections/decks of vocabulary items.

```prisma
model VocabularyGroup {
  id          String   @id @default(cuid())
  name        String
  description String?
  userId      String   @map("user_id")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  user            User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  vocabularyItems VocabularyItem[]

  @@map("vocabulary_groups")
}
```

### ReviewSchedule
SM-2 algorithm data for spaced repetition.

```prisma
model ReviewSchedule {
  id                String   @id @default(cuid())
  vocabularyItemId  String   @unique @map("vocabulary_item_id")
  easinessFactor    Float    @default(2.5) @map("easiness_factor")
  interval          Int      @default(0)
  repetitions       Int      @default(0)
  nextReviewDate    DateTime @map("next_review_date")
  lastReviewDate    DateTime? @map("last_review_date")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  vocabularyItem VocabularyItem @relation(fields: [vocabularyItemId], references: [id], onDelete: Cascade)

  @@map("review_schedules")
}
```

### StudySession
Study session records.

```prisma
model StudySession {
  id              String   @id @default(cuid())
  userId          String   @map("user_id")
  mode            String   // flashcard, quiz, listening, etc.
  cardsReviewed   Int      @default(0) @map("cards_reviewed")
  correctAnswers  Int      @default(0) @map("correct_answers")
  timeSpentMinutes Int     @default(0) @map("time_spent_minutes")
  startedAt       DateTime @default(now()) @map("started_at")
  completedAt     DateTime? @map("completed_at")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("study_sessions")
}
```

### ProgressLog
Daily progress tracking.

```prisma
model ProgressLog {
  id              String   @id @default(cuid())
  userId          String   @map("user_id")
  date            DateTime @unique
  wordsStudied    Int      @default(0) @map("words_studied")
  newWords        Int      @default(0) @map("new_words")
  reviewWords     Int      @default(0) @map("review_words")
  timeSpentMinutes Int     @default(0) @map("time_spent_minutes")
  sessionsCompleted Int    @default(0) @map("sessions_completed")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("progress_logs")
}
```

### DailyGoal
User's daily study goals.

```prisma
model DailyGoal {
  id              String   @id @default(cuid())
  userId          String   @unique @map("user_id")
  wordsPerDay     Int      @default(10) @map("words_per_day")
  minutesPerDay   Int      @default(15) @map("minutes_per_day")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("daily_goals")
}
```

## Relationships

- User has many VocabularyGroups
- User has many StudySessions
- User has many ProgressLogs
- User has one DailyGoal
- VocabularyGroup belongs to User
- VocabularyGroup has many VocabularyItems (many-to-many)
- VocabularyItem has one ReviewSchedule
- StudySession belongs to User
- ProgressLog belongs to User
- DailyGoal belongs to User

## Indexes

- User: email (unique)
- VocabularyItem: word, reading
- ReviewSchedule: nextReviewDate, vocabularyItemId (unique)
- ProgressLog: date (unique), userId
- DailyGoal: userId (unique)

