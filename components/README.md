# Components

This directory contains all React components for the Vocab Hero application.

## Structure

- `ui/` - shadcn/ui components (Button, Card, Input, etc.)
- `features/` - Feature-specific components organized by domain
  - `vocabulary/` - Vocabulary management components
  - `study/` - Study mode components
  - `progress/` - Progress tracking and visualization components
- `shared/` - Shared components used across multiple features

## Naming Conventions

- Component files: PascalCase (e.g., `VocabularyCard.tsx`)
- Component folders: kebab-case (e.g., `vocabulary-card/`)
- Test files: Same as component with `.test.tsx` suffix

