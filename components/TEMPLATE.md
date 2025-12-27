# Component Template

This document provides templates for creating new components following the project's coding standards.

## Basic Component Template

```typescript
// ComponentName.tsx
import type { ComponentNameProps } from './ComponentName.types';

/**
 * 元件說明（繁體中文）
 *
 * @param props - 元件屬性
 * @returns React 元件
 */
export function ComponentName({ prop1, prop2 }: ComponentNameProps): JSX.Element {
  return (
    <div>
      {/* 元件內容 */}
    </div>
  );
}
```

## Component Types Template

```typescript
// ComponentName.types.ts
export interface ComponentNameProps {
  prop1: string;
  prop2?: number;
  onAction?: () => void;
}
```

## Component Test Template

```typescript
// ComponentName.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/tests/test-utils';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName prop1="test" />);
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const handleAction = vi.fn();
    const { user } = render(<ComponentName prop1="test" onAction={handleAction} />);
    
    await user.click(screen.getByRole('button'));
    expect(handleAction).toHaveBeenCalled();
  });
});
```

## Folder Structure for Complex Components

```
component-name/
├── ComponentName.tsx          # Main component
├── ComponentName.types.ts     # Type definitions
├── ComponentName.test.tsx     # Tests
├── hooks/                     # Component-specific hooks
│   └── useComponentLogic.ts
└── utils/                     # Component-specific utilities
    └── helper-functions.ts
```

