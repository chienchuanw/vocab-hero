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

**Phase 2: Vocabulary Management** 🚀 **IN PROGRESS** (40%)

- ✅ Vocabulary CRUD frontend components completed
- ✅ Groups CRUD frontend components completed
- ✅ UI fully translated to English
- ⏳ Vocabulary Backend API (7 tasks remaining)
- ⏳ Groups Backend API (7 tasks remaining)
- 📋 Example Sentences deferred to Phase 2.5
- 📋 Drag-and-drop deferred to Phase 11
- Last updated: 2025-12-27

**Current Status**: Ready to implement Vocabulary and Groups Backend APIs

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

## Phase 2: Vocabulary Management 🚀 IN PROGRESS (40%)

### 2.1 Vocabulary CRUD - Backend

- [ ] Create Zod validation schemas for vocabulary
- [ ] Create GET /api/vocabulary endpoint (list all with filtering)
- [ ] Create GET /api/vocabulary/:id endpoint (single item)
- [ ] Create POST /api/vocabulary endpoint (create)
- [ ] Create PUT /api/vocabulary/:id endpoint (update)
- [ ] Create DELETE /api/vocabulary/:id endpoint (delete)
- [ ] Write API integration tests for vocabulary endpoints

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

### 2.3 Groups CRUD - Backend

- [ ] Create Zod validation schemas for groups
- [ ] Create GET /api/groups endpoint (list all with vocabulary count)
- [ ] Create GET /api/groups/:id endpoint (single group with vocabularies)
- [ ] Create POST /api/groups endpoint (create)
- [ ] Create PUT /api/groups/:id endpoint (update)
- [ ] Create DELETE /api/groups/:id endpoint (delete)
- [ ] Write API integration tests for groups endpoints

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

- [ ] Add example sentences field to VocabularyItem model
- [ ] Create ExampleSentence component with word highlighting
- [ ] Implement add/edit/delete example sentences
- [ ] Create example sentence display with furigana support (using kuroshiro)
- [ ] Write tests for example sentence functionality

---

## Phase 3: Spaced Repetition System (SM-2)

### 3.1 SM-2 Algorithm Implementation

- [ ] Research and document SM-2 algorithm
- [ ] Create SM-2 calculation utility (lib/srs/sm2.ts)
- [ ] Implement easiness factor calculation
- [ ] Implement interval calculation
- [ ] Implement repetition counter logic
- [ ] Create quality rating system (0-5)
- [ ] Write comprehensive unit tests for SM-2

### 3.2 Review Schedule Management

- [ ] Create ReviewSchedule database operations
- [ ] Implement due vocabulary query
- [ ] Create review priority sorting
- [ ] Implement review scheduling after user response
- [ ] Create API endpoints for review data
- [ ] Write integration tests

### 3.3 Mastery Level Display

- [ ] Define mastery level thresholds
- [ ] Create MasteryIndicator component (color-coded)
- [ ] Display mastery level on vocabulary cards
- [ ] Implement mastery level filtering
- [ ] Write tests for mastery display

---

## Phase 4: Study Modes - Flashcard

### 4.1 Flashcard Mode - Core

- [ ] Create FlashcardStudy page
- [ ] Create Flashcard component with flip animation
- [ ] Implement card front (Japanese word + reading)
- [ ] Implement card back (meaning + example sentences)
- [ ] Create flip interaction (click/keyboard)
- [ ] Implement quality rating buttons (1-5)
- [ ] Write component tests

### 4.2 Flashcard Mode - Session Management

- [ ] Create StudySession model operations
- [ ] Implement session start/end logic
- [ ] Track cards reviewed per session
- [ ] Calculate session statistics (correct rate, time spent)
- [ ] Create session summary screen
- [ ] Implement "continue studying" vs "end session" flow
- [ ] Write E2E tests for complete flashcard flow

---

## Phase 5: Study Modes - Quiz

### 5.1 Multiple Choice Quiz

- [ ] Create QuizStudy page
- [ ] Create MultipleChoiceQuestion component
- [ ] Implement question generation (word -> meaning)
- [ ] Implement reverse question (meaning -> word)
- [ ] Generate distractor options from vocabulary pool
- [ ] Create answer feedback animation (correct/incorrect)
- [ ] Implement score tracking
- [ ] Create quiz summary screen
- [ ] Write component and integration tests

### 5.2 Spelling Quiz

- [ ] Create SpellingQuiz component
- [ ] Display meaning/reading, user types Japanese word
- [ ] Implement hiragana/katakana input support
- [ ] Create character-by-character validation
- [ ] Implement hint system (show first character)
- [ ] Create visual feedback for correct/incorrect characters
- [ ] Write tests for spelling validation

### 5.3 Matching Game

- [ ] Create MatchingGame page
- [ ] Create MatchingCard component
- [ ] Implement card pair generation (word <-> meaning)
- [ ] Create card flip and match animation
- [ ] Implement match detection logic
- [ ] Add timer for gamification
- [ ] Track moves and time for scoring
- [ ] Create game completion screen
- [ ] Write E2E tests for matching game

### 5.4 Random Quiz Mode

- [ ] Create RandomQuiz page
- [ ] Implement vocabulary selection across all groups
- [ ] Create quiz configuration (number of questions, difficulty)
- [ ] Mix different question types in single quiz
- [ ] Implement adaptive difficulty based on performance
- [ ] Create comprehensive quiz results
- [ ] Write tests for random selection logic

---

## Phase 6: Audio and Pronunciation

### 6.1 Text-to-Speech (TTS)

- [ ] Create TTS utility using Web Speech API (lib/tts/)
- [ ] Implement Japanese voice selection
- [ ] Create SpeakerButton component
- [ ] Add TTS to vocabulary cards
- [ ] Add TTS to flashcard mode
- [ ] Add TTS to example sentences
- [ ] Implement TTS playback controls (speed, repeat)
- [ ] Handle TTS unavailability gracefully
- [ ] Write tests with TTS mocking

### 6.2 Listening Quiz

- [ ] Create ListeningQuiz page
- [ ] Play audio, user selects correct meaning
- [ ] Play audio, user types the word
- [ ] Implement audio replay functionality
- [ ] Create listening-specific scoring
- [ ] Write tests for listening mode

### 6.3 Audio Recording and Comparison

- [ ] Implement microphone access with MediaRecorder API
- [ ] Create RecordButton component
- [ ] Create audio playback for user recording
- [ ] Implement side-by-side comparison (TTS vs user)
- [ ] Create basic pronunciation feedback (waveform display)
- [ ] Handle microphone permission errors
- [ ] Write tests with media mocking

---

## Phase 7: Progress Tracking

### 7.1 Daily Progress Log

- [ ] Create ProgressLog database operations
- [ ] Track daily: words studied, new words, review words
- [ ] Track daily: time spent, sessions completed
- [ ] Create progress logging middleware
- [ ] Write tests for progress logging

### 7.2 GitHub-style Contribution Wall

- [ ] Create ContributionWall component
- [ ] Implement 365-day grid display
- [ ] Calculate intensity levels (0-4) based on activity
- [ ] Create color scale for activity levels
- [ ] Add hover tooltip with date and statistics
- [ ] Implement year navigation
- [ ] Write component tests

### 7.3 Statistics Dashboard

- [ ] Create ProgressDashboard page
- [ ] Create StatCard component (total words, mastery rate, etc.)
- [ ] Implement line chart for progress over time
- [ ] Implement pie chart for vocabulary by group
- [ ] Implement bar chart for vocabulary by mastery level
- [ ] Create weekly/monthly/yearly view toggle
- [ ] Write tests for statistics calculations

### 7.4 Streak Tracking

- [ ] Implement streak calculation logic
- [ ] Create StreakDisplay component
- [ ] Track current streak and longest streak
- [ ] Create streak milestone celebrations
- [ ] Implement streak freeze feature (optional)
- [ ] Write tests for streak logic

---

## Phase 8: Daily Goals and Reminders

### 8.1 Goal Setting

- [ ] Create DailyGoal model and API endpoints
- [ ] Create GoalSettings page
- [ ] Implement goal types (words per day, time per day)
- [ ] Create goal input components
- [ ] Store and retrieve user goals
- [ ] Write tests for goal management

### 8.2 Goal Progress Display

- [ ] Create GoalProgressBar component
- [ ] Display progress on dashboard and home page
- [ ] Create goal completion celebration animation
- [ ] Implement goal reset at midnight
- [ ] Write component tests

### 8.3 In-App Notifications

- [ ] Create NotificationCenter component
- [ ] Implement reminder notifications for study time
- [ ] Create goal achievement notifications
- [ ] Create streak warning notifications
- [ ] Implement notification preferences
- [ ] Write tests for notification logic

### 8.4 Browser Push Notifications

- [ ] Implement Service Worker for push notifications
- [ ] Create notification permission request flow
- [ ] Schedule daily reminder notifications
- [ ] Implement notification click handling
- [ ] Create notification settings UI
- [ ] Write E2E tests for notifications

---

## Phase 9: Data Import/Export

### 9.1 Export Functionality

- [ ] Create export API endpoint
- [ ] Implement JSON export format
- [ ] Implement CSV export format
- [ ] Create ExportDialog component
- [ ] Allow selective export (by group, by date range)
- [ ] Include study progress in export
- [ ] Write tests for export functionality

### 9.2 Import Functionality

- [ ] Create import API endpoint
- [ ] Implement JSON import parser
- [ ] Implement CSV import parser
- [ ] Create ImportDialog component with file upload
- [ ] Implement import preview before confirmation
- [ ] Handle duplicate vocabulary detection
- [ ] Create import progress indicator
- [ ] Handle import errors gracefully
- [ ] Write tests for import functionality

### 9.3 Anki Deck Import (Optional)

- [ ] Research Anki deck format (.apkg)
- [ ] Implement Anki deck parser
- [ ] Map Anki fields to Vocab Hero fields
- [ ] Create field mapping UI
- [ ] Write tests for Anki import

---

## Phase 10: Settings and Preferences

### 10.1 User Preferences

- [ ] Create Settings page
- [ ] Implement theme settings (light/dark mode)
- [ ] Implement language preferences
- [ ] Create study preferences (cards per session, etc.)
- [ ] Implement TTS voice preferences
- [ ] Store preferences in database
- [ ] Write tests for settings

### 10.2 Data Management

- [ ] Create data management section in settings
- [ ] Implement "Reset Progress" functionality
- [ ] Implement "Delete All Data" functionality
- [ ] Create backup/restore functionality
- [ ] Add confirmation dialogs for destructive actions
- [ ] Write tests for data management

---

## Phase 11: UI/UX Polish

### 11.1 Animations and Transitions

- [ ] Add page transition animations
- [ ] Implement card flip animations
- [ ] Create success/failure feedback animations
- [ ] Add loading state animations
- [ ] Implement micro-interactions for buttons
- [ ] Optimize animation performance

### 11.2 Responsive Design

- [ ] Audit all pages for mobile responsiveness
- [ ] Optimize touch interactions
- [ ] Implement swipe gestures for flashcards
- [ ] Create mobile-optimized navigation
- [ ] Test on various screen sizes
- [ ] Write visual regression tests

### 11.3 Drag-and-Drop Functionality

> **Note**: Deferred from Phase 2 for better UX polish

- [ ] Research drag-and-drop libraries (dnd-kit, react-beautiful-dnd)
- [ ] Implement drag-and-drop vocabulary to groups
- [ ] Create visual feedback during drag operations
- [ ] Implement reordering vocabulary within groups
- [ ] Add touch support for mobile drag-and-drop
- [ ] Write tests for drag-and-drop functionality

### 11.4 Accessibility

- [ ] Audit with accessibility tools (axe, Lighthouse)
- [ ] Ensure keyboard navigation works everywhere
- [ ] Add proper ARIA labels
- [ ] Test with screen readers
- [ ] Ensure sufficient color contrast
- [ ] Add skip links and focus management

### 11.5 Error Handling and Edge Cases

- [ ] Implement global error boundary
- [ ] Create user-friendly error pages (404, 500)
- [ ] Add offline detection and handling
- [ ] Implement retry logic for failed requests
- [ ] Create empty state components
- [ ] Write tests for error scenarios

---

## Phase 12: Performance Optimization

### 12.1 Frontend Performance

- [ ] Implement code splitting for study modes
- [ ] Optimize bundle size (analyze with webpack-bundle-analyzer)
- [ ] Implement lazy loading for images
- [ ] Add service worker for caching
- [ ] Optimize React re-renders
- [ ] Implement virtualized lists for large datasets

### 12.2 Backend Performance

- [ ] Add database indexes for common queries
- [ ] Implement query optimization
- [ ] Add response caching where appropriate
- [ ] Optimize API response payload sizes
- [ ] Implement pagination for list endpoints

### 12.3 Performance Testing

- [ ] Set up Lighthouse CI
- [ ] Create performance benchmarks
- [ ] Test with large datasets (1000+ vocabulary items)
- [ ] Monitor Core Web Vitals
- [ ] Write performance regression tests

---

## Phase 13: Testing and Quality Assurance

### 13.1 Test Coverage

- [ ] Achieve 80% overall code coverage
- [ ] 100% coverage for SM-2 algorithm
- [ ] 100% coverage for data import/export
- [ ] Full E2E coverage for critical paths
- [ ] Write integration tests for all API routes

### 13.2 Cross-Browser Testing

- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on Edge
- [ ] Document browser-specific issues

### 13.3 Manual QA

- [ ] Create QA test cases document
- [ ] Perform full application walkthrough
- [ ] Test all study modes thoroughly
- [ ] Verify data persistence
- [ ] Test import/export with various file formats

---

## Phase 14: Documentation

### 14.1 User Documentation

- [ ] Create user guide
- [ ] Document all study modes
- [ ] Create FAQ section
- [ ] Add tooltips and onboarding hints in-app

### 14.2 Technical Documentation

- [ ] Document API endpoints
- [ ] Document database schema
- [ ] Create architecture diagram
- [ ] Document deployment process
- [ ] Update README with setup instructions

---

## Phase 15: Deployment and Launch

### 15.1 Production Setup

- [ ] Configure production database (Neon/Supabase)
- [ ] Set up production environment variables
- [ ] Configure Vercel production deployment
- [ ] Set up error monitoring (Sentry or similar)
- [ ] Configure analytics (optional)

### 15.2 Pre-Launch Checklist

- [ ] Final security audit
- [ ] Performance audit (Lighthouse score > 90)
- [ ] Accessibility audit (WCAG AA compliance)
- [ ] Cross-browser testing complete
- [ ] All tests passing
- [ ] Documentation complete

### 15.3 Launch

- [ ] Deploy to production
- [ ] Verify production deployment
- [ ] Monitor for errors
- [ ] Create initial backup

---

## Phase 16: Mobile Application (PWA)

### 16.1 PWA Setup

- [ ] Create web app manifest
- [ ] Configure service worker for offline support
- [ ] Implement app installation prompt
- [ ] Add splash screen and app icons
- [ ] Test PWA installation on mobile devices

### 16.2 Offline Functionality

- [ ] Implement offline data storage (IndexedDB)
- [ ] Create offline-first study mode
- [ ] Implement data sync when online
- [ ] Handle sync conflicts
- [ ] Write tests for offline functionality

### 16.3 Mobile-Specific Features

- [ ] Optimize touch interactions
- [ ] Implement haptic feedback
- [ ] Add share functionality
- [ ] Optimize for mobile performance
- [ ] Test on iOS and Android devices

---

## Phase 17: Native Mobile App (Future)

### 17.1 Technology Selection

- [ ] Evaluate React Native vs Expo vs Capacitor
- [ ] Set up mobile development environment
- [ ] Create project structure

### 17.2 Core App Development

- [ ] Port core components to mobile
- [ ] Implement native navigation
- [ ] Set up local database (SQLite)
- [ ] Implement native TTS
- [ ] Create native notifications

### 17.3 App Store Deployment

- [ ] Prepare app store assets (icons, screenshots)
- [ ] Create app store descriptions
- [ ] Submit to Google Play Store
- [ ] Submit to Apple App Store
- [ ] Handle app review feedback

---

## Summary

### Total Phases: 17

### Estimated Tasks: 250+

### Priority Order

1. Phases 0-4: Core functionality (must have)
2. Phases 5-8: Enhanced learning features (must have)
3. Phases 9-10: Data management (must have)
4. Phases 11-14: Polish and quality (should have)
5. Phases 15-16: Deployment and PWA (must have)
6. Phase 17: Native app (future enhancement)

### Key Milestones

- **Milestone 1**: Basic vocabulary management working (Phase 2 complete)
- **Milestone 2**: Flashcard study mode working (Phase 4 complete)
- **Milestone 3**: All study modes working (Phase 6 complete)
- **Milestone 4**: Full progress tracking (Phase 8 complete)
- **Milestone 5**: Production-ready web app (Phase 15 complete)
- **Milestone 6**: Mobile app available (Phase 16/17 complete)
