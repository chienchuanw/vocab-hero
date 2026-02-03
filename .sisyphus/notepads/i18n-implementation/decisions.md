# Decisions - i18n Implementation

## Technical Decisions

<!-- Key technical choices made and rationale -->

- **i18n Library**: next-intl (best App Router support, Benchmark 89.7)
- **Routing Strategy**: Cookie-based (no URL prefix)
- **Default Language**: Auto-detect from browser, fallback to English
- **Supported Locales**: en, zh-TW only
- **zh-CN Handling**: Not supported, fallback to English
- **Missing Keys**: Fallback to English silently
