# Responsive Design Guidelines

## Phase 12.2 Completion - Mobile Responsiveness & Swipe Gestures

**Completion Date**: January 10, 2026  
**Status**: ✅ Complete

---

## Overview

Vocab Hero implements a mobile-first responsive design approach with touch gesture support for enhanced mobile user experience.

---

## Breakpoints

Following Tailwind CSS v4 conventions:

| Breakpoint  | Min Width      | Target Devices          | Modifier             |
| ----------- | -------------- | ----------------------- | -------------------- |
| **Mobile**  | < 768px        | Phones                  | (default, no prefix) |
| **Tablet**  | 768px - 1023px | Tablets, small laptops  | `md:`                |
| **Desktop** | ≥ 1024px       | Desktops, large laptops | `lg:`                |

### Usage Example

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* 1 column on mobile, 2 on tablet, 4 on desktop */}
</div>
```

---

## Custom Hooks

### useMediaQuery

Detects media query matches with reactive updates.

```typescript
import { useMediaQuery } from '@/hooks/useMediaQuery';

function MyComponent() {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return isMobile ? <MobileView /> : <DesktopView />;
}
```

**Features**:

- SSR-safe (returns false initially)
- Cleans up event listeners on unmount
- Re-renders on breakpoint changes

### useSwipeGesture

Enables touch swipe detection for mobile navigation.

```typescript
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { useRef } from 'react';

function Flashcard() {
  const cardRef = useRef<HTMLDivElement>(null);

  useSwipeGesture({
    elementRef: cardRef,
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrevious,
    threshold: 50, // minimum swipe distance in pixels
  });

  return <div ref={cardRef}>...</div>;
}
```

**Parameters**:

- `elementRef`: RefObject to the swipeable element
- `onSwipeLeft`: Callback for left swipe (optional)
- `onSwipeRight`: Callback for right swipe (optional)
- `threshold`: Min distance in pixels (default: 50)

**Features**:

- Touch event based (touchstart, touchend)
- Configurable swipe threshold
- No interference with click/tap events
- Works alongside keyboard navigation

---

## Touch Interactions

### Flashcard Component

The Flashcard component supports multiple interaction methods:

| Interaction | Desktop | Mobile | Result        |
| ----------- | ------- | ------ | ------------- |
| Click/Tap   | ✅      | ✅     | Flip card     |
| Space key   | ✅      | ❌     | Flip card     |
| Swipe Left  | ❌      | ✅     | Next card     |
| Swipe Right | ❌      | ✅     | Previous card |

**Implementation**:

```tsx
<Flashcard
  vocabulary={currentVocab}
  onFlip={handleFlip}
  onNext={handleNext}
  onPrevious={handlePrevious}
/>
```

---

## Layout Components

### Layout Structure

```
┌─────────────────────────────┐
│ Header (fixed top)          │ ← Sticky header
├─────────────────────────────┤
│                             │
│ Main Content                │ ← PageTransition wrapped
│ (max-width: 1280px)         │   with padding-bottom: 64px
│                             │
├─────────────────────────────┤
│ BottomNav (fixed bottom)    │ ← Mobile navigation
└─────────────────────────────┘
```

### Header

**Mobile Behavior**:

- Sticky positioning (`sticky top-0`)
- Backdrop blur for modern aesthetics
- Compact streak badge
- Logo + app name side-by-side

### BottomNav

**Mobile-First Navigation**:

- Fixed bottom positioning
- 5 primary navigation items
- Active state indication
- Touch-optimized tap targets (h-16)

**Desktop Consideration**: Bottom nav remains visible on all screen sizes for consistent UX.

---

## Responsive Patterns

### Grid Layouts

Use responsive grid columns:

```tsx
// Progress page stats
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard />
  <StatCard />
  <StatCard />
  <StatCard />
</div>
```

### Spacing

Use consistent spacing scale:

- `px-4`: Horizontal padding for pages
- `py-6`: Vertical padding for main content
- `space-y-6`: Vertical spacing between sections
- `gap-4`: Grid/flex gaps

### Typography

Responsive text sizing:

- Headers: `text-3xl` (mobile), `text-4xl` (desktop optional)
- Body: `text-base` (default)
- Captions: `text-sm`, `text-xs`

---

## Testing

### Unit Tests (Vitest)

**useMediaQuery tests**:

```bash
pnpm test useMediaQuery.test.ts --run
```

**useSwipeGesture tests**:

```bash
pnpm test useSwipeGesture.test.ts --run
```

**Flashcard integration tests**:

```bash
pnpm test Flashcard.test.tsx --run
```

### E2E Tests (Playwright)

**Mobile responsiveness tests**:

```bash
pnpm exec playwright test mobile-responsive.spec.ts
```

**Devices tested**:

- iPhone 12 (390x844)
- Pixel 5 (393x851)
- iPad (gen 7) (810x1080)

**Test coverage**:

- Mobile layout rendering
- Bottom navigation accessibility
- Touch interactions
- Swipe gestures
- Responsive grids

---

## Best Practices

### Mobile-First Approach

1. **Start with mobile styles** (no prefix)
2. **Add tablet overrides** (`md:`)
3. **Add desktop overrides** (`lg:`)

```tsx
<div className="p-4 md:p-6 lg:p-8">{/* Padding increases with screen size */}</div>
```

### Touch Targets

Ensure minimum 44x44px touch targets on mobile:

```tsx
<button className="h-16 px-4">
  {' '}
  {/* 64px height */}
  Tap me
</button>
```

### Swipe Gestures

**Do**:

- Provide visual feedback during swipe
- Set reasonable thresholds (50px minimum)
- Support both left and right swipes
- Keep existing click/tap functionality

**Don't**:

- Interfere with native scroll gestures
- Require complex multi-finger gestures
- Remove keyboard navigation

### Performance

- Use CSS transforms for animations (GPU accelerated)
- Lazy load images on mobile
- Minimize JavaScript on initial load
- Test on actual devices when possible

---

## Implementation Checklist

When adding responsive features:

- [ ] Mobile layout works < 768px
- [ ] Tablet layout works 768px - 1023px
- [ ] Desktop layout works ≥ 1024px
- [ ] Touch targets ≥ 44px on mobile
- [ ] Swipe gestures don't interfere with scroll
- [ ] Keyboard navigation still works
- [ ] Unit tests cover new hooks
- [ ] E2E tests cover mobile viewports
- [ ] Page transition animations respect `prefers-reduced-motion`

---

## Related Documentation

- [Animation Guidelines](./ANIMATION_GUIDELINES.md) - Animation patterns and accessibility
- [Design System](./DESIGN_SYSTEM.md) - Component design principles
- [Testing Standards](./TEST_FIXES_SUMMARY.md) - Testing conventions

---

## Phase 12.2 Deliverables

### ✅ Completed Features

1. **useMediaQuery Hook**
   - Detects breakpoint changes reactively
   - 7 unit tests passing
   - Commit: `a78fb88`

2. **useSwipeGesture Hook**
   - Left/right swipe detection
   - Configurable threshold (default: 50px)
   - 9 unit tests passing
   - Commit: `4fc912a`

3. **Flashcard Swipe Integration**
   - Touch navigation for mobile users
   - Preserves keyboard navigation
   - 16 unit tests passing (including 4 new swipe tests)
   - Commit: `4f3553b`, `6b74426`

4. **Mobile E2E Tests**
   - 11 Playwright tests across 3 devices
   - Tests responsive layouts, touch interactions, swipe gestures
   - Commit: `2fe6959`

5. **QueryClient Test Fix**
   - Added QueryClientProvider to test-utils
   - Fixes React Query hook usage in tests
   - Commit: `4f3553b`

### 📊 Test Coverage

- **Unit Tests**: 32 new tests (useMediaQuery: 7, useSwipeGesture: 9, Flashcard: 16)
- **E2E Tests**: 11 new mobile viewport tests
- **Total New Tests**: 43 tests

### 🔧 Files Changed

```
hooks/useMediaQuery.{ts,test.ts}          +113 lines
hooks/useSwipeGesture.{ts,test.ts}        +257 lines
components/features/study/Flashcard.*     +121 lines
app/(dashboard)/study/flashcard/page.tsx  +21 lines
tests/test-utils.tsx                      (QueryClient)
e2e/mobile-responsive.spec.ts             +170 lines (NEW)
doc/RESPONSIVE_DESIGN.md                  (THIS FILE)
```

---

## Future Enhancements

### Deferred to Later Phases

**Minor Layout Tweaks** (Phase 12.2-2 - Optional):

- Header text overflow on very small screens (<375px)
- Page header flex layout optimization for long titles

These issues are cosmetic and affect edge cases. Deferred in favor of completing higher-priority Phase 12.2 core deliverables.

### Potential Improvements

- [ ] Add swipe indicators/animations
- [ ] Support more complex gesture patterns (pinch, zoom)
- [ ] Progressive Web App (PWA) features
- [ ] Offline support for study modes
- [ ] Native mobile app conversion
- [ ] Haptic feedback for touch interactions

---

**Last Updated**: January 10, 2026  
**Phase**: 12.2 - Responsive Design
