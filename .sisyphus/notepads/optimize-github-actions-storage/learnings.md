## 2026-04-03 Task: T1 Baseline
- `gh` CLI not authenticated locally — skip cache measurement
- `actionlint` installed at v1.7.12, `shellcheck` at v0.11.0
- Validation of workflow YAML is fully functional
## 2026-04-03 Task: Cache Cleanup Workflow
- Use env vars for PR head refs in GitHub Actions scripts to satisfy actionlint security checks
-  can target both the PR merge ref and the head branch ref for branch-specific cleanup
- Scheduled cleanup should filter out  before deleting cache IDs
## 2026-04-03 Task: Cache Cleanup Workflow
- Use environment variables for PR head refs in GitHub Actions scripts to satisfy actionlint security checks
- gh cache list can target both the PR merge ref and the head branch ref for branch-specific cleanup
- Scheduled cleanup should filter out refs/heads/main before deleting cache IDs

## 2026-04-03 Task: optimize-github-actions-storage
- `actions/checkout` aligned to v6 in both PR workflow jobs
- `fetch-depth: 50` is enough for size checks and avoids a full history clone
- `actionlint` flagged direct PR expressions in inline scripts; moving values into step env vars keeps behavior while staying lint-clean

## 2026-04-03 Task: CI Consolidation (Task 2)
- Consolidated 3 parallel jobs (lint-and-typecheck, test, build) into 1 sequential job — eliminates 2x redundant checkout+install+prisma-generate cycles
- Changed codecov `if: always()` to `if: ${{ !cancelled() }}` — prevents upload on cancelled workflows while still uploading on test failure
- Fixed build step DATABASE_URL from `test_db` (wrong) to `db_vocab_hero_test` (matches postgres service POSTGRES_DB)
- Removed `develop` from branch triggers — branch doesn't exist
- Added `paths-ignore` for docs/assets to skip CI on non-code changes
- Added `concurrency` group with `cancel-in-progress: true` to auto-cancel superseded runs
- PostgreSQL service container only needed once at job level (was duplicated across test job only before)
- actionlint passes cleanly — no `${{ }}` expressions in `run:` blocks

## 2026-04-03 Task: F4 Scope Fidelity Check
- `git diff HEAD~3..HEAD --stat` shows only `.github/workflows/{ci.yml,cache-cleanup.yml,pr-checks.yml` modified
- No application code paths (`packages/`, `src/`) changed in the 3-commit range
- `ci.yml` meets scope: single sequential CI job, `paths-ignore`, main-only branches, concurrency group, codecov guarded by `!cancelled()`, build/test DB URL aligned to `db_vocab_hero_test`
- `cache-cleanup.yml` meets scope: PR-close + weekly schedule triggers, two cleanup jobs, `permissions: actions: write`, uses `gh cache` flows, preserves `refs/heads/main`
- `pr-checks.yml` meets scope: both checkout steps are `actions/checkout@v6`, size-check uses `fetch-depth: 50`, concurrency group added, PR validation logic preserved
