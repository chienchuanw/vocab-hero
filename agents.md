# AI Agent Operational Guidelines

## Overview

This document provides detailed operational commands and conventions for AI agents working on the Vocab Hero project. It supplements the rules in `.augment/rules/` with specific instructions for code generation and development tasks.

## Project Context

### Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **State Management**: TanStack Query
- **Testing**: Vitest + React Testing Library + Playwright
- **Package Manager**: pnpm

### Development Methodology

- **TDD (Test-Driven Development)**: Always write tests before implementation
- **Red-Green-Refactor**: Follow the TDD cycle strictly

## Code Generation Rules

### File Creation Priority

1. **Always check existing files first** - Use codebase-retrieval before creating new files
2. **Prefer editing over creating** - Modify existing files when possible
3. **Follow naming conventions** - Refer to coding-standards.md
4. **Create tests first** - In TDD, test files come before implementation

### Component Generation

When creating a new React component:

```typescript
// 1. Create test file first (TDD)
// components/features/vocabulary/VocabularyCard.test.tsx

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VocabularyCard } from "./VocabularyCard";

describe("VocabularyCard", () => {
  it("should render vocabulary word", () => {
    // Test implementation
  });
});

// 2. Create types file
// components/features/vocabulary/VocabularyCard.types.ts

export interface VocabularyCardProps {
  vocabulary: VocabularyItem;
  onFlip: () => void;
}

// 3. Create component implementation
// components/features/vocabulary/VocabularyCard.tsx

import type { VocabularyCardProps } from "./VocabularyCard.types";

export function VocabularyCard({ vocabulary, onFlip }: VocabularyCardProps) {
  // Implementation
}
```

### API Route Generation

When creating API routes:

```typescript
// 1. Create test file first
// app/api/vocabulary/route.test.ts

import { describe, it, expect } from "vitest";
import { GET, POST } from "./route";

describe("GET /api/vocabulary", () => {
  it("should return vocabulary list", async () => {
    // Test implementation
  });
});

// 2. Create route implementation
// app/api/vocabulary/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Implementation
}

export async function POST(request: NextRequest) {
  // Implementation
}
```

### Database Schema Generation

When creating Prisma models:

```prisma
// 1. Define model in schema.prisma
model VocabularyItem {
  id        String   @id @default(cuid())
  word      String
  reading   String
  meaning   String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("vocabulary_items")
}

// 2. Generate migration
// Run: pnpm prisma migrate dev --name add_vocabulary_items

// 3. Create seed data (if needed)
// prisma/seed.ts
```

## Common Commands

### Development

```bash
# Start development server
pnpm dev

# Run type checking
pnpm tsc --noEmit

# Run linter
pnpm lint

# Format code
pnpm format
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Run specific test file
pnpm test VocabularyCard.test.tsx
```

### Database

```bash
# Generate Prisma client
pnpm prisma generate

# Create migration
pnpm prisma migrate dev --name migration_name

# Apply migrations
pnpm prisma migrate deploy

# Open Prisma Studio
pnpm prisma studio

# Seed database
pnpm prisma db seed
```

### Build and Deploy

```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Analyze bundle size
pnpm build --analyze
```

## Code Patterns

### Custom Hooks Pattern

```typescript
// hooks/useVocabulary.ts

import { useQuery } from "@tanstack/react-query";

export function useVocabulary() {
  return useQuery({
    queryKey: ["vocabulary"],
    queryFn: async () => {
      const response = await fetch("/api/vocabulary");
      if (!response.ok) throw new Error("Failed to fetch vocabulary");
      return response.json();
    },
  });
}
```

### API Response Pattern

```typescript
// Consistent API response format

// Success
return NextResponse.json({
  success: true,
  data: result,
});

// Error
return NextResponse.json(
  {
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: "Invalid input data",
    },
  },
  { status: 400 }
);
```

### Error Handling Pattern

```typescript
// Client-side error handling

try {
  const data = await fetchVocabulary();
  return data;
} catch (error) {
  console.error("Failed to fetch vocabulary:", error);
  throw new Error("Failed to fetch vocabulary");
}
```

## Prohibited Actions

### Never Do

- Create files without checking existing codebase first
- Use `any` type without explicit justification
- Skip writing tests (TDD is mandatory)
- Add console.log statements in production code
- Use emoji in code or comments
- Hardcode sensitive data (use environment variables)
- Directly manipulate DOM (use React patterns)
- Create inline styles (use Tailwind or CSS modules)

### Always Do

- Write tests before implementation (TDD)
- Use TypeScript strict mode
- Follow naming conventions
- Add Traditional Chinese comments for complex logic
- Use semantic HTML and ARIA labels
- Validate user input on both client and server
- Use Prisma for database queries (prevents SQL injection)
- Implement proper error handling

## Feature Development Workflow

### Step-by-Step Process

1. **Understand Requirements**

   - Read feature description carefully
   - Identify affected components and files
   - Plan database schema changes if needed

2. **Write Tests First (Red)**

   - Create test file
   - Write failing tests for expected behavior
   - Run tests to confirm they fail

3. **Implement Feature (Green)**

   - Write minimal code to pass tests
   - Follow coding standards
   - Add Traditional Chinese comments

4. **Refactor (Refactor)**

   - Improve code quality
   - Extract reusable logic
   - Ensure tests still pass

5. **Documentation**

   - Update README if needed
   - Add JSDoc comments
   - Update API documentation

6. **Code Review**
   - Self-review using review-checklist.md
   - Create pull request
   - Address reviewer feedback

## Debugging Guidelines

### When Tests Fail

1. Read error message carefully
2. Check test expectations vs actual output
3. Use `screen.debug()` for component tests
4. Use `console.log` temporarily (remove before commit)
5. Run single test file for faster iteration

### When Build Fails

1. Check TypeScript errors first
2. Verify all imports are correct
3. Ensure environment variables are set
4. Clear `.next` cache and rebuild

### When Runtime Errors Occur

1. Check browser console for errors
2. Verify API responses in Network tab
3. Check server logs for API errors
4. Use React DevTools for component state

## Best Practices Reminders

### Performance

- Use dynamic imports for code splitting
- Implement proper loading states
- Optimize images with Next.js Image
- Use TanStack Query for caching

### Security

- Validate all user inputs
- Use NextAuth for authentication
- Implement CSRF protection
- Never expose sensitive data

### Accessibility

- Use semantic HTML
- Add ARIA labels where needed
- Ensure keyboard navigation
- Maintain color contrast ratios

### Maintainability

- Keep functions small and focused
- Extract complex logic into utilities
- Use meaningful variable names
- Write self-documenting code
