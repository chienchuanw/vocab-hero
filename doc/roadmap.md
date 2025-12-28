# Vocab Hero Development Roadmap

## Progress Summary

**Phase 0: Project Setup** ✅ **COMPLETED** (100%)

- All development environment, testing infrastructure, project structure, and database setup tasks completed
- GitHub Actions CI/CD pipeline configured
- Vercel deployment ready
- Last updated: 2025-12-27

**Phase 1: Foundation** ✅ **COMPLETED** (100%)

- Complete database schema with 8 models implemented
- Core UI components with Duolingo-style design created
- Base API infrastructure and utilities established
- TanStack Query configured for state management
- All 15 tasks completed successfully
- Last updated: 2025-12-27

**Phase 2: Vocabulary Management** ✅ **COMPLETED** (100%)

- ✅ Vocabulary CRUD frontend components completed
- ✅ Groups CRUD frontend components completed
- ✅ UI fully translated to English
- ✅ Vocabulary Backend API - 30 tests, 100% pass rate
- ✅ Groups Backend API - 19 tests, 100% pass rate
- ✅ React hooks connected to real APIs (no mock data)
- 📋 Example Sentences deferred to Phase 2.5
- 📋 Drag-and-drop deferred to Phase 11
- Last updated: 2025-12-27

**Phase 3: Frontend Components and Integration** ✅ **COMPLETED** (100%)

- ✅ Vocabulary Management UI fully integrated with backend
- ✅ Groups Management UI fully integrated with backend
- ✅ E2E tests created for Vocabulary CRUD (8 test scenarios)
- ✅ E2E tests created for Groups CRUD (8 test scenarios)
- ✅ All pages accessible and functional
- ✅ React hooks working correctly with UI components
- 📋 Component unit tests deferred (E2E coverage sufficient)
- Last updated: 2025-12-28

**Phase 4: Spaced Repetition System (SM-2)** ✅ **COMPLETED** (100%)

- ✅ SM-2 algorithm implementation complete with comprehensive tests
- ✅ Mastery level calculation system implemented (5 levels: NEW, LEARNING, FAMILIAR, LEARNED, MASTERED)
- ✅ MasteryIndicator component created with color-coded badges
- ✅ Mastery level filtering in vocabulary list implemented
- ✅ API support for mastery level filtering added
- ✅ Review schedule management API endpoints (POST /api/vocabulary/:id/review)
- ✅ Due vocabulary query functionality (GET /api/vocabulary/due)
- ✅ Review stats API (GET /api/review/stats)
- Last updated: 2025-12-28

**Current Status**: Phase 4 fully complete. Ready for Phase 5 (Flashcard Study Mode).

---

## Overview

This document outlines the complete development roadmap for Vocab Hero, a gamified Japanese vocabulary learning application. The project follows TDD methodology and is designed for single-user usage without authentication requirements.

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL
- **State Management**: TanStack Query
- **Audio**: Web Speech API
- **Algorithm**: SM-2 Spaced Repetition System
- **Testing**: Vitest, React Testing Library, Playwright
- **Deployment**: Vercel

---

## Phase 0: Project Setup ✅ COMPLETED

### 0.1 Development Environment ✅

- [x] Initialize Next.js 16 project with TypeScript
- [x] Configure TypeScript strict mode
- [x] Set up Tailwind CSS 4
- [x] Install and configure shadcn/ui
- [x] Set up ESLint and Prettier
- [x] Configure path aliases (@/)

### 0.2 Database Setup ✅

- [x] Install Prisma ORM
- [x] Configure PostgreSQL connection
- [x] Create initial database schema design document
- [x] Set up Prisma client singleton

### 0.3 Testing Infrastructure ✅

- [x] Install and configure Vitest
- [x] Set up React Testing Library
- [x] Configure Playwright for E2E tests
- [x] Set up MSW for API mocking
- [x] Create test utilities and helpers

### 0.4 CI/CD Pipeline ✅

- [x] Configure GitHub Actions for CI
- [x] Set up automated testing on PR
- [x] Configure Vercel deployment
- [x] Set up environment variables management

### 0.5 Project Structure ✅

- [x] Create folder structure as defined in project-guidelines.md
- [x] Set up component templates
- [x] Create shared UI components from shadcn/ui
- [x] Set up global styles and theme configuration

---

## Phase 1: Foundation ✅ COMPLETED

### 1.1 Database Schema ✅

- [x] Design and implement User model (single user, local storage fallback)
- [x] Design and implement VocabularyItem model
- [x] Design and implement VocabularyGroup model
- [x] Design and implement StudySession model
- [x] Design and implement ReviewSchedule model (SM-2 data)
- [x] Design and implement ProgressLog model
- [x] Design and implement DailyGoal model
- [x] Create database migrations
- [x] Create seed data for development

### 1.2 Core UI Components ✅

- [x] Create Layout component with navigation
- [x] Create Header component
- [x] Create Sidebar/Navigation component (BottomNav)
- [x] Create Card component for vocabulary display
- [x] Create Button variants (primary, secondary, outline)
- [x] Create Input and Form components
- [x] Create Modal/Dialog component
- [x] Create Toast/Notification component
- [x] Create Loading spinner and skeleton components

### 1.3 Base API Structure ✅

- [x] Set up API route structure
- [x] Create API response utilities (success/error format)
- [x] Create error handling middleware
- [x] Set up TanStack Query provider
- [x] Create base fetch utilities

---

## Phase 2: Vocabulary Management ✅ COMPLETED (100%)

### 2.1 Vocabulary CRUD - Backend ✅ COMPLETED

- [x] Create Zod validation schemas for vocabulary
- [x] Create GET /api/vocabulary endpoint (list all with filtering)
- [x] Create GET /api/vocabulary/:id endpoint (single item)
- [x] Create POST /api/vocabulary endpoint (create)
- [x] Create PUT /api/vocabulary/:id endpoint (update)
- [x] Create DELETE /api/vocabulary/:id endpoint (delete)
- [x] Write API integration tests for vocabulary endpoints (30 tests, 100% pass rate)

### 2.2 Vocabulary CRUD - Frontend ✅ COMPLETED

- [x] Create VocabularyList page
- [x] Create VocabularyCard component
- [x] Create AddVocabularyForm component
- [x] Create EditVocabularyModal component
- [x] Create DeleteConfirmationDialog component
- [x] Implement vocabulary search functionality
- [x] Implement vocabulary filtering (by group, mastery level)
- [x] Write component unit tests
- [x] Translate all UI text to English

### 2.3 Groups CRUD - Backend ✅ COMPLETED

- [x] Create Zod validation schemas for groups
- [x] Create GET /api/groups endpoint (list all with vocabulary count)
- [x] Create GET /api/groups/:id endpoint (single group with vocabularies)
- [x] Create POST /api/groups endpoint (create)
- [x] Create PUT /api/groups/:id endpoint (update)
- [x] Create DELETE /api/groups/:id endpoint (delete)
- [x] Write API integration tests for groups endpoints (19 tests, 100% pass rate)

### 2.4 Groups CRUD - Frontend ✅ COMPLETED

- [x] Create GroupList page
- [x] Create GroupCard component
- [x] Create AddGroupDialog component
- [x] Create EditGroupDialog component
- [x] Display vocabulary count per group
- [x] Translate all UI text to English

### 2.5 Example Sentences (Deferred to Phase 2.5)

> **Note**: This feature is deferred until core CRUD functionality is complete.
> Will use kuroshiro or similar library for furigana support.
> Backend support for example sentences is already implemented in Phase 2.

- [ ] Create ExampleSentence component with word highlighting
- [ ] Implement add/edit/delete example sentences UI
- [ ] Create example sentence display with furigana support (using kuroshiro)
- [ ] Write tests for example sentence functionality
- [ ] Integrate example sentences into vocabulary management UI

---

## Phase 3: Frontend Components and Integration ✅ COMPLETED (100%)

> **Note**: Backend APIs complete with 49 passing tests. React hooks implemented and connected to real APIs.

### 3.1 Vocabulary Management UI ✅ COMPLETED

- [x] Create vocabulary list page with backend integration
- [x] Create vocabulary card component with real data display
- [x] Create add vocabulary form connected to POST API
- [x] Create edit vocabulary modal connected to PUT API
- [x] Create delete confirmation dialog connected to DELETE API
- [x] Implement search functionality using backend filtering
- [x] Implement sorting and pagination using backend features
- [x] Component integration verified through E2E tests

### 3.2 Groups Management UI ✅ COMPLETED

- [x] Create groups list page with backend integration
- [x] Create group card component with vocabulary count display
- [x] Create add group dialog connected to POST API
- [x] Create edit group dialog connected to PUT API
- [x] Create delete group dialog connected to DELETE API
- [x] Display vocabulary items within each group
- [x] Component integration verified through E2E tests

### 3.3 E2E Testing and Validation ✅ COMPLETED

- [x] Write E2E tests for complete vocabulary CRUD workflow (8 scenarios)
- [x] Write E2E tests for complete groups CRUD workflow (8 scenarios)
- [x] Test error handling (network errors, validation errors)
- [x] Test loading states and empty states
- [x] Test data persistence and refresh behavior
- [x] Verify all React hooks work correctly with UI components

---

## Phase 4: Spaced Repetition System (SM-2) ✅ COMPLETED

### 4.1 SM-2 Algorithm Implementation ✅ COMPLETED

- [x] Research and document SM-2 algorithm
- [x] Create SM-2 calculation utility (lib/srs/sm2.ts)
- [x] Implement easiness factor calculation
- [x] Implement interval calculation
- [x] Implement repetition counter logic
- [x] Create quality rating system (0-5)
- [x] Write comprehensive unit tests for SM-2 (100% pass rate)

### 4.2 Mastery Level Display ✅ COMPLETED

- [x] Define mastery level thresholds (5 levels: NEW, LEARNING, FAMILIAR, LEARNED, MASTERED)
- [x] Create MasteryIndicator component (color-coded badges)
- [x] Display mastery level on vocabulary cards
- [x] Implement mastery level filtering in vocabulary list
- [x] Write tests for mastery display (100% pass rate)
- [x] Add mastery level filter to VocabularyFilterBar
- [x] Implement API support for masteryLevel query parameter
- [x] Add mastery level filtering tests to API route tests

### 4.3 Review Schedule Management ✅ COMPLETED

- [x] Create ReviewSchedule database operations (CRUD)
- [x] Implement due vocabulary query (find items due for review)
- [x] Create review priority sorting (by next review date)
- [x] Implement review scheduling after user response
- [x] Create API endpoints for review data
- [x] Write integration tests for review schedule endpoints

---

## Phase 5: Study Modes - Flashcard 🔄 IN PROGRESS

### 5.1 Flashcard Mode - Core

- [ ] Create FlashcardStudy page
- [ ] Create Flashcard component with flip animation
- [ ] Implement card front (Japanese word + reading)
- [ ] Implement card back (meaning + example sentences)
- [ ] Create flip interaction (click/keyboard)
- [ ] Implement quality rating buttons (1-5)
- [ ] Write component tests

### 5.2 Flashcard Mode - Session Management

- [ ] Create StudySession model operations
- [ ] Implement session start/end logic
- [ ] Track cards reviewed per session
- [ ] Calculate session statistics (correct rate, time spent)
- [ ] Create session summary screen
- [ ] Implement "continue studying" vs "end session" flow
- [ ] Write E2E tests for complete flashcard flow

---

## Phase 6: Study Modes - Quiz

### 6.1 Multiple Choice Quiz

- [ ] Create QuizStudy page
- [ ] Create MultipleChoiceQuestion component
- [ ] Implement question generation (word -> meaning)
- [ ] Implement reverse question (meaning -> word)
- [ ] Generate distractor options from vocabulary pool
- [ ] Create answer feedback animation (correct/incorrect)
- [ ] Implement score tracking
- [ ] Create quiz summary screen
- [ ] Write component and integration tests

### 6.2 Spelling Quiz

- [ ] Create SpellingQuiz component
- [ ] Display meaning/reading, user types Japanese word
- [ ] Implement hiragana/katakana input support
- [ ] Create character-by-character validation
- [ ] Implement hint system (show first character)
- [ ] Create visual feedback for correct/incorrect characters
- [ ] Write tests for spelling validation

### 6.3 Matching Game

- [ ] Create MatchingGame page
- [ ] Create MatchingCard component
- [ ] Implement card pair generation (word <-> meaning)
- [ ] Create card flip and match animation
- [ ] Implement match detection logic
- [ ] Add timer for gamification
- [ ] Track moves and time for scoring
- [ ] Create game completion screen
- [ ] Write E2E tests for matching game

### 6.4 Random Quiz Mode

- [ ] Create RandomQuiz page
- [ ] Implement vocabulary selection across all groups
- [ ] Create quiz configuration (number of questions, difficulty)
- [ ] Mix different question types in single quiz
- [ ] Implement adaptive difficulty based on performance
- [ ] Create comprehensive quiz results
- [ ] Write tests for random selection logic

---

## Phase 7: Audio and Pronunciation

### 7.1 Text-to-Speech (TTS)

- [ ] Create TTS utility using Web Speech API (lib/tts/)
- [ ] Implement Japanese voice selection
- [ ] Create SpeakerButton component
- [ ] Add TTS to vocabulary cards
- [ ] Add TTS to flashcard mode
- [ ] Add TTS to example sentences
- [ ] Implement TTS playback controls (speed, repeat)
- [ ] Handle TTS unavailability gracefully
- [ ] Write tests with TTS mocking

### 7.2 Listening Quiz

- [ ] Create ListeningQuiz page
- [ ] Play audio, user selects correct meaning
- [ ] Play audio, user types the word
- [ ] Implement audio replay functionality
- [ ] Create listening-specific scoring
- [ ] Write tests for listening mode

### 7.3 Audio Recording and Comparison

- [ ] Implement microphone access with MediaRecorder API
- [ ] Create RecordButton component
- [ ] Create audio playback for user recording
- [ ] Implement side-by-side comparison (TTS vs user)
- [ ] Create basic pronunciation feedback (waveform display)
- [ ] Handle microphone permission errors
- [ ] Write tests with media mocking

---

## Phase 8: Progress Tracking

### 8.1 Daily Progress Log

- [ ] Create ProgressLog database operations
- [ ] Track daily: words studied, new words, review words
- [ ] Track daily: time spent, sessions completed
- [ ] Create progress logging middleware
- [ ] Write tests for progress logging

### 9.2 GitHub-style Contribution Wall

- [ ] Create ContributionWall component
- [ ] Implement 365-day grid display
- [ ] Calculate intensity levels (0-4) based on activity
- [ ] Create color scale for activity levels
- [ ] Add hover tooltip with date and statistics
- [ ] Implement year navigation
- [ ] Write component tests

### 9.3 Statistics Dashboard

- [ ] Create ProgressDashboard page
- [ ] Create StatCard component (total words, mastery rate, etc.)
- [ ] Implement line chart for progress over time
- [ ] Implement pie chart for vocabulary by group
- [ ] Implement bar chart for vocabulary by mastery level
- [ ] Create weekly/monthly/yearly view toggle
- [ ] Write tests for statistics calculations

### 9.4 Streak Tracking

- [ ] Implement streak calculation logic
- [ ] Create StreakDisplay component
- [ ] Track current streak and longest streak
- [ ] Create streak milestone celebrations
- [ ] Implement streak freeze feature (optional)
- [ ] Write tests for streak logic

---

## Phase 9: Daily Goals and Reminders

### 9.1 Goal Setting

- [ ] Create DailyGoal model and API endpoints
- [ ] Create GoalSettings page
- [ ] Implement goal types (words per day, time per day)
- [ ] Create goal input components
- [ ] Store and retrieve user goals
- [ ] Write tests for goal management

### 9.2 Goal Progress Display

- [ ] Create GoalProgressBar component
- [ ] Display progress on dashboard and home page
- [ ] Create goal completion celebration animation
- [ ] Implement goal reset at midnight
- [ ] Write component tests

### 9.3 In-App Notifications

- [ ] Create NotificationCenter component
- [ ] Implement reminder notifications for study time
- [ ] Create goal achievement notifications
- [ ] Create streak warning notifications
- [ ] Implement notification preferences
- [ ] Write tests for notification logic

### 9.4 Browser Push Notifications

- [ ] Implement Service Worker for push notifications
- [ ] Create notification permission request flow
- [ ] Schedule daily reminder notifications
- [ ] Implement notification click handling
- [ ] Create notification settings UI
- [ ] Write E2E tests for notifications

---

## Phase 10: Data Import/Export

### 10.1 Export Functionality

- [ ] Create export API endpoint
- [ ] Implement JSON export format
- [ ] Implement CSV export format
- [ ] Create ExportDialog component
- [ ] Allow selective export (by group, by date range)
- [ ] Include study progress in export
- [ ] Write tests for export functionality

### 10.2 Import Functionality

- [ ] Create import API endpoint
- [ ] Implement JSON import parser
- [ ] Implement CSV import parser
- [ ] Create ImportDialog component with file upload
- [ ] Implement import preview before confirmation
- [ ] Handle duplicate vocabulary detection
- [ ] Create import progress indicator
- [ ] Handle import errors gracefully
- [ ] Write tests for import functionality

### 10.3 Anki Deck Import (Optional)

- [ ] Research Anki deck format (.apkg)
- [ ] Implement Anki deck parser
- [ ] Map Anki fields to Vocab Hero fields
- [ ] Create field mapping UI
- [ ] Write tests for Anki import

---

## Phase 11: Settings and Preferences

### 11.1 User Preferences

- [ ] Create Settings page
- [ ] Implement theme settings (light/dark mode)
- [ ] Implement language preferences
- [ ] Create study preferences (cards per session, etc.)
- [ ] Implement TTS voice preferences
- [ ] Store preferences in database
- [ ] Write tests for settings

### 11.2 Data Management

- [ ] Create data management section in settings
- [ ] Implement "Reset Progress" functionality
- [ ] Implement "Delete All Data" functionality
- [ ] Create backup/restore functionality
- [ ] Add confirmation dialogs for destructive actions
- [ ] Write tests for data management

---

## Phase 12: UI/UX Polish

### 12.1 Animations and Transitions

- [ ] Add page transition animations
- [ ] Implement card flip animations
- [ ] Create success/failure feedback animations
- [ ] Add loading state animations
- [ ] Implement micro-interactions for buttons
- [ ] Optimize animation performance

### 12.2 Responsive Design

- [ ] Audit all pages for mobile responsiveness
- [ ] Optimize touch interactions
- [ ] Implement swipe gestures for flashcards
- [ ] Create mobile-optimized navigation
- [ ] Test on various screen sizes
- [ ] Write visual regression tests

### 12.3 Drag-and-Drop Functionality

> **Note**: Deferred from Phase 2 for better UX polish

- [ ] Research drag-and-drop libraries (dnd-kit, react-beautiful-dnd)
- [ ] Implement drag-and-drop vocabulary to groups
- [ ] Create visual feedback during drag operations
- [ ] Implement reordering vocabulary within groups
- [ ] Add touch support for mobile drag-and-drop
- [ ] Write tests for drag-and-drop functionality

### 12.4 Accessibility

- [ ] Audit with accessibility tools (axe, Lighthouse)
- [ ] Ensure keyboard navigation works everywhere
- [ ] Add proper ARIA labels
- [ ] Test with screen readers
- [ ] Ensure sufficient color contrast
- [ ] Add skip links and focus management

### 12.5 Error Handling and Edge Cases

- [ ] Implement global error boundary
- [ ] Create user-friendly error pages (404, 500)
- [ ] Add offline detection and handling
- [ ] Implement retry logic for failed requests
- [ ] Create empty state components
- [ ] Write tests for error scenarios

---

## Phase 13: Performance Optimization

### 13.1 Frontend Performance

- [ ] Implement code splitting for study modes
- [ ] Optimize bundle size (analyze with webpack-bundle-analyzer)
- [ ] Implement lazy loading for images
- [ ] Add service worker for caching
- [ ] Optimize React re-renders
- [ ] Implement virtualized lists for large datasets

### 13.2 Backend Performance

- [ ] Add database indexes for common queries
- [ ] Implement query optimization
- [ ] Add response caching where appropriate
- [ ] Optimize API response payload sizes
- [ ] Implement pagination for list endpoints

### 13.3 Performance Testing

- [ ] Set up Lighthouse CI
- [ ] Create performance benchmarks
- [ ] Test with large datasets (1000+ vocabulary items)
- [ ] Monitor Core Web Vitals
- [ ] Write performance regression tests

---

## Phase 14: Testing and Quality Assurance

### 14.1 Test Coverage

- [ ] Achieve 80% overall code coverage
- [ ] 100% coverage for SM-2 algorithm
- [ ] 100% coverage for data import/export
- [ ] Full E2E coverage for critical paths
- [ ] Write integration tests for all API routes

### 14.2 Cross-Browser Testing

- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on Edge
- [ ] Document browser-specific issues

### 14.3 Manual QA

- [ ] Create QA test cases document
- [ ] Perform full application walkthrough
- [ ] Test all study modes thoroughly
- [ ] Verify data persistence
- [ ] Test import/export with various file formats

---

## Phase 15: Documentation

### 15.1 User Documentation

- [ ] Create user guide
- [ ] Document all study modes
- [ ] Create FAQ section
- [ ] Add tooltips and onboarding hints in-app

### 15.2 Technical Documentation

- [ ] Document API endpoints
- [ ] Document database schema
- [ ] Create architecture diagram
- [ ] Document deployment process
- [ ] Update README with setup instructions

---

## Phase 16: Deployment and Launch

### 16.1 Production Setup

- [ ] Configure production database (Neon/Supabase)
- [ ] Set up production environment variables
- [ ] Configure Vercel production deployment
- [ ] Set up error monitoring (Sentry or similar)
- [ ] Configure analytics (optional)

### 16.2 Pre-Launch Checklist

- [ ] Final security audit
- [ ] Performance audit (Lighthouse score > 90)
- [ ] Accessibility audit (WCAG AA compliance)
- [ ] Cross-browser testing complete
- [ ] All tests passing
- [ ] Documentation complete

### 16.3 Launch

- [ ] Deploy to production
- [ ] Verify production deployment
- [ ] Monitor for errors
- [ ] Create initial backup

---

## Phase 17: Mobile Application (PWA)

### 17.1 PWA Setup

- [ ] Create web app manifest
- [ ] Configure service worker for offline support
- [ ] Implement app installation prompt
- [ ] Add splash screen and app icons
- [ ] Test PWA installation on mobile devices

### 17.2 Offline Functionality

- [ ] Implement offline data storage (IndexedDB)
- [ ] Create offline-first study mode
- [ ] Implement data sync when online
- [ ] Handle sync conflicts
- [ ] Write tests for offline functionality

### 17.3 Mobile-Specific Features

- [ ] Optimize touch interactions
- [ ] Implement haptic feedback
- [ ] Add share functionality
- [ ] Optimize for mobile performance
- [ ] Test on iOS and Android devices

---

## Phase 18: Native Mobile App (Future)

### 18.1 Technology Selection

- [ ] Evaluate React Native vs Expo vs Capacitor
- [ ] Set up mobile development environment
- [ ] Create project structure

### 18.2 Core App Development

- [ ] Port core components to mobile
- [ ] Implement native navigation
- [ ] Set up local database (SQLite)
- [ ] Implement native TTS
- [ ] Create native notifications

### 18.3 App Store Deployment

- [ ] Prepare app store assets (icons, screenshots)
- [ ] Create app store descriptions
- [ ] Submit to Google Play Store
- [ ] Submit to Apple App Store
- [ ] Handle app review feedback

---

## Summary

### Total Phases: 18

### Estimated Tasks: 250+

### Priority Order

1. Phases 0-4: Core functionality (must have)
2. Phases 5-8: Enhanced learning features (must have)
3. Phases 9-11: Data management and settings (must have)
4. Phases 12-15: Polish and quality (should have)
5. Phases 16-17: Deployment and PWA (must have)
6. Phase 18: Native app (future enhancement)

### Key Milestones

- **Milestone 1**: Basic vocabulary management working (Phase 2 complete ✅)
- **Milestone 2**: Frontend components integrated (Phase 3 complete)
- **Milestone 3**: Flashcard study mode working (Phase 5 complete)
- **Milestone 4**: All study modes working (Phase 7 complete)
- **Milestone 5**: Full progress tracking (Phase 8 complete)
- **Milestone 6**: Production-ready web app (Phase 16 complete)
- **Milestone 7**: Mobile app available (Phase 17/18 complete)
