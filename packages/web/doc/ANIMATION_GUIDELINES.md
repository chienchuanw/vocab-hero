# Animation Guidelines

## Overview

Phase 12.1 introduces consistent page transitions and animation patterns across Vocab Hero. This document outlines the animation specifications and conventions.

## Page Transitions

### Implementation

- **Component**: `PageTransition` (components/shared/PageTransition.tsx)
- **Integration**: Wraps main content in `Layout` component
- **Library**: framer-motion 12.25.0

### Timing

- **Normal motion**: 250ms with easeOut
- **Reduced motion**: 200ms fade-only

### Animation Variants

**Full Motion** (default):

- Fade: opacity 0 → 1
- Movement: y +10px → 0 (enter), 0 → -10px (exit)
- Scale: 0.98 → 1 (subtle zoom)

**Reduced Motion** (prefers-reduced-motion: reduce):

- Fade only: opacity 0 → 1
- No position or scale changes
- Duration: 200ms

## Accessibility

### Reduced Motion Hook

Use `usePrefersReducedMotion()` hook to detect user preferences:

```tsx
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

function MyComponent() {
  const prefersReducedMotion = usePrefersReducedMotion();

  const animation = prefersReducedMotion
    ? {
        /* simple fade */
      }
    : {
        /* full animation */
      };
}
```

### Guidelines

- Always provide reduced motion alternative
- Respect user system preferences automatically
- Use fade-only for reduced motion (no position/scale/rotate)
- Keep animations under 300ms

## Existing Animations

### Success/Failure Feedback

- **success-bounce**: Scale bounce animation (globals.css)
- **error-shake**: Horizontal shake animation (globals.css)
- **MatchAnimation**: Full-screen success overlay with confetti
- **AnswerFeedback**: Slide-in feedback for quiz answers

### Loading States

- **Spinner**: `animate-spin` on Loader2 icons
- **Skeleton**: `animate-pulse` for content placeholders

### Flashcard 3D Flip

- Custom 3D transform with backface-hidden
- 500ms duration
- Uses `perspective-1000` and `transform-style-3d`

## Testing Conventions

### Unit Tests

- Test animation variants (full motion vs reduced motion)
- Verify correct timing values
- Check pathname-based keying for transitions
- Mock framer-motion for component tests

### Example

```tsx
it('should disable animations when prefers-reduced-motion is enabled', () => {
  vi.spyOn(useReducedMotionHook, 'usePrefersReducedMotion').mockReturnValue(true);

  const { container } = render(<PageTransition>...</PageTransition>);

  expect(container.querySelector('[data-reduced-motion="true"]')).toBeInTheDocument();
});
```

## Future Enhancements

- Stagger animations for list items
- Shared element transitions between routes
- Progress-based animations for study sessions
- More granular motion preferences

---

## Related Documentation

- **[Responsive Design](./RESPONSIVE_DESIGN.md)** - Mobile responsiveness, swipe gestures, and touch interactions (Phase 12.2)
- **[Design System](./DESIGN_SYSTEM.md)** - Component design principles

---

**Last Updated**: January 10, 2026  
**Phase**: 12.1 - Page Transitions  
**Next Phase**: 12.2 - Responsive Design ✅ Complete
