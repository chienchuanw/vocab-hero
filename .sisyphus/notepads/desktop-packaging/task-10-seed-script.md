# Task 10: Desktop Seed Script

## Completed Actions

### 1. Created tsconfig.json
- Path: `packages/desktop/tsconfig.json`
- Target: ES2022
- Module: ESNext with bundler resolution
- Added Node.js types for console/process support
- Strict mode enabled

### 2. Created seed.ts
- Path: `packages/desktop/prisma/seed.ts`
- Creates default user: `default@vocab-hero.local`
- Initializes all user-related settings:
  - UserSettings (theme, TTS, study preferences)
  - DailyGoal (10 words/day, 30 min/day)
  - NotificationPreference (all enabled, push disabled)
  - UserStreak (initialized to 0)
- Creates sample vocabulary group: "Sample Vocabulary"
- Seeds 3 sample vocabulary items:
  - こんにちは (hello)
  - ありがとう (thank you)
  - 勉強 (study)
- Each item includes example sentences
- Creates review schedules for all items
- Uses upsert for idempotency

### 3. Updated package.json
- Added `prisma.seed` configuration
- Points to `tsx prisma/seed.ts`

### 4. Verification
- Successfully ran `prisma db push --force-reset`
- Successfully ran `prisma db seed`
- All entities created without errors
- Test database cleaned up
- Web Prisma client regenerated

## Key Patterns Used

1. **String Enum Values**: Used `'FLASHCARD'`, `'SYSTEM'` instead of Prisma enum objects (SQLite compatibility)
2. **Upsert Pattern**: User creation uses upsert by email for idempotency
3. **Nested Creates**: Example sentences created inline with vocabulary items
4. **Relation Connects**: Vocabulary items connected to groups using `connect`

## Files Created/Modified

- ✅ `packages/desktop/tsconfig.json` (created)
- ✅ `packages/desktop/prisma/seed.ts` (created)
- ✅ `packages/desktop/package.json` (modified - added prisma.seed)

## Verification Commands

```bash
cd packages/desktop
DATABASE_URL="file:./test.db" npx prisma db push --force-reset
DATABASE_URL="file:./test.db" npx prisma db seed
```

Both commands exited successfully (exit code 0).

## Notes

- Comments in seed.ts are necessary for clarity in database seeding scripts
- Seed creates minimal sample data (3 vocabulary items) as requested
- All default values match web's default-user.ts pattern
- Seed is idempotent - can be run multiple times safely
