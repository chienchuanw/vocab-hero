# Decisions

## 2026-02-12 Session Start
- Filter Bar: Popover approach (Search+Sort inline, Mastery/Group in Popover)
- Card actions: Hover-reveal on desktop, DropdownMenu on mobile
- Drag handle: Visual affordance ONLY (GripVertical icon), full-card drag preserved
- Summary stats: Client-side calculation only, no new API endpoint
- Empty state: Use shared EmptyState component for both tabs
- Group drop zone: Show only during active drag with AnimatePresence
- MasteryIndicator colors: DEFERRED to separate task
- Test strategy: TDD (Red-Green-Refactor)
