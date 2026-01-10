# Accessibility Guidelines

## Overview

Vocab Hero follows WCAG 2.1 Level AA standards to ensure the application is accessible to all users, including those using assistive technologies.

## Testing Infrastructure

### Automated Testing

We use **axe-core** and **@axe-core/playwright** for automated accessibility testing:

```bash
# Run accessibility tests
pnpm exec playwright test accessibility.spec.ts
```

### Test Coverage

Our accessibility test suite (`e2e/accessibility.spec.ts`) covers:

1. **Automated Violation Detection** - Scans all major pages (home, vocabulary, groups, study, progress, settings)
2. **Keyboard Navigation** - Verifies Tab navigation works correctly
3. **Heading Hierarchy** - Ensures proper H1-H6 structure
4. **Color Contrast** - Validates WCAG AA contrast ratios (3:1 for large text, 4.5:1 for normal text)
5. **Image Alt Text** - Verifies all images have appropriate alt text

## Implemented Accessibility Features

### ARIA Labels

All interactive elements and progress indicators have descriptive ARIA labels:

**Progress Bars**:

```tsx
<Progress
  value={percentage}
  aria-label={`Words progress: ${current} of ${goal} (${percentage}%)`}
/>
```

### Color Contrast

**Primary Color**: `oklch(0.64 0.19 142)`

- Meets WCAG AA standards for color contrast
- Contrast ratio: >3:1 for large text, >4.5:1 for normal text

**Previous Issues Fixed**:

- Old primary color `oklch(0.72 0.19 142)` had 2.31:1 ratio (insufficient)
- Darkened to `oklch(0.64 0.19 142)` to meet WCAG AA requirements

### Keyboard Navigation

All interactive elements are keyboard accessible:

- **Tab**: Navigate between focusable elements
- **Enter/Space**: Activate buttons and links
- **Escape**: Close modals and dialogs
- **Arrow Keys**: Navigate within components (e.g., flashcards, quizzes)

**Keyboard Shortcuts**:

- Flashcards: Space to flip, 0-5 to rate
- Quiz: Enter to submit answer
- Global: Tab for navigation

### Semantic HTML

We use semantic HTML5 elements:

```tsx
<header> - Page header with navigation
<main> - Main content area
<nav> - Navigation menus
<article> - Self-contained content
<section> - Thematic grouping
<button> - Interactive actions
```

### Heading Hierarchy

Each page follows proper heading structure:

- One `<h1>` per page (page title)
- `<h2>` for major sections
- `<h3>` for subsections
- No skipped heading levels

## Best Practices

### When Adding New Components

1. **Use Semantic HTML**

   ```tsx
   // Good
   <button onClick={handleClick}>Submit</button>

   // Avoid
   <div onClick={handleClick}>Submit</div>
   ```

2. **Add ARIA Labels**

   ```tsx
   // For non-text elements
   <button aria-label="Close dialog">
     <X className="h-4 w-4" />
   </button>

   // For progress indicators
   <div role="progressbar" aria-label="Loading vocabulary" />
   ```

3. **Ensure Keyboard Access**

   ```tsx
   // Add keyboard handlers
   <div
     role="button"
     tabIndex={0}
     onClick={handleClick}
     onKeyDown={(e) => e.key === 'Enter' && handleClick()}
   >
   ```

4. **Test with Screen Readers**
   - macOS: VoiceOver (Cmd + F5)
   - Windows: NVDA (free) or JAWS
   - Check that all interactive elements are announced

5. **Verify Color Contrast**
   ```bash
   # Run contrast check
   pnpm exec playwright test accessibility.spec.ts -g "color contrast"
   ```

### When Adding New Pages

1. Add accessibility tests to `e2e/accessibility.spec.ts`:

   ```typescript
   test('should not have accessibility issues on new page', async ({ page }) => {
     await page.goto('/new-page');
     await page.waitForLoadState('networkidle');

     const results = await new AxeBuilder({ page }).analyze();
     expect(results.violations).toEqual([]);
   });
   ```

2. Verify keyboard navigation works
3. Check heading hierarchy (one H1, proper nesting)
4. Ensure focus is managed (especially for modals)

## Testing Checklist

Before merging PRs, verify:

- [ ] Automated accessibility tests pass
- [ ] Keyboard navigation works (Tab through page)
- [ ] Screen reader announces content correctly
- [ ] Color contrast meets WCAG AA (use browser DevTools)
- [ ] Focus indicators are visible
- [ ] No automated violations detected by axe

## Common Issues and Solutions

### Issue: Missing ARIA Label

**Problem**: `<div role="progressbar">` without aria-label

**Solution**:

```tsx
<div
  role="progressbar"
  aria-label="Words progress: 5 of 10"
  aria-valuenow={50}
  aria-valuemin={0}
  aria-valuemax={100}
/>
```

### Issue: Insufficient Color Contrast

**Problem**: Text color too light on background

**Solution**:

1. Use browser DevTools > Accessibility > Contrast ratio
2. Adjust color lightness in `app/globals.css`:
   ```css
   /* Darken color by reducing lightness */
   --color-primary: oklch(0.64 0.19 142); /* was 0.72 */
   ```

### Issue: Keyboard Trap

**Problem**: Can't Tab out of modal dialog

**Solution**:

```tsx
import { useEffect, useRef } from 'react';

function Dialog({ onClose }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    // Focus close button when dialog opens
    closeButtonRef.current?.focus();

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true">
      <button ref={closeButtonRef} onClick={onClose}>
        Close
      </button>
    </div>
  );
}
```

### Issue: Missing Alt Text

**Problem**: Images without alt attributes

**Solution**:

```tsx
// Decorative images
<img src="decoration.png" alt="" role="presentation" />

// Meaningful images
<img src="vocabulary.png" alt="Japanese vocabulary flashcard showing 勉強" />
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

## Maintenance

**Regular Tasks**:

1. Run accessibility tests before each release
2. Test new features with keyboard only
3. Verify screen reader compatibility
4. Check color contrast when updating theme
5. Review and update this document as needed

## Contact

For accessibility-related questions or issues, please open a GitHub issue with the `accessibility` label.
