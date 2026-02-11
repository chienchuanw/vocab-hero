# CI/CD Setup Documentation

## Overview

This document provides a comprehensive overview of the CI/CD pipeline setup for Vocab Hero.

## Components

### 1. GitHub Actions CI Workflow

**File**: `.github/workflows/ci.yml`

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs**:

#### Lint and Type Check
- Runs ESLint to check code quality
- Runs TypeScript compiler to check types
- Ensures code follows project standards

#### Unit Tests
- Runs Vitest unit tests with coverage
- Uploads coverage reports to Codecov
- Requires 80% code coverage threshold

#### E2E Tests
- Installs Playwright browsers
- Runs end-to-end tests
- Uploads test reports as artifacts

#### Build
- Builds Next.js application
- Verifies build succeeds
- Checks build output

**Node.js Version**: 22
**Package Manager**: pnpm 9

### 2. PR Checks Workflow

**File**: `.github/workflows/pr-checks.yml`

**Triggers**:
- Pull request opened, synchronized, or reopened

**Jobs**:

#### PR Information
- Displays PR number, title, author, and branches

#### Validate PR
- Checks PR title follows Conventional Commits format
- Detects merge conflicts
- Ensures PR is ready for review

#### Size Check
- Counts changed files and lines
- Warns if PR is too large (>50 files or >1000 lines)
- Encourages smaller, focused PRs

#### Required Checks
- Aggregates all check results
- Must pass before PR can be merged

### 3. Vercel Deployment

**File**: `vercel.json`

**Configuration**:
- Framework: Next.js
- Build Command: `pnpm build`
- Install Command: `pnpm install`
- Region: Tokyo (hnd1)

**Deployment Branches**:
- `main` → Production deployment
- `develop` → Preview deployment
- All PRs → Unique preview URLs

**Environment Variables**:
- Managed in Vercel dashboard
- Separate variables for Production/Preview/Development
- See `ENVIRONMENT_VARIABLES.md` for details

### 4. Environment Variables Management

**Files**:
- `.env.example` - Template for local setup
- `.env.local` - Local development (not committed)
- `.env.test` - Testing environment (not committed)

**Documentation**: See `ENVIRONMENT_VARIABLES.md`

## Workflow Diagrams

### Development Workflow

```
Developer → Create Branch → Write Code → Write Tests
                                              ↓
                                         Run Tests Locally
                                              ↓
                                         Commit Changes
                                              ↓
                                         Push to GitHub
                                              ↓
                                    GitHub Actions CI Runs
                                              ↓
                                    All Checks Pass? ─No→ Fix Issues
                                              ↓ Yes
                                         Create PR
                                              ↓
                                    PR Checks Run
                                              ↓
                                    Vercel Preview Deploy
                                              ↓
                                         Code Review
                                              ↓
                                    Merge to develop
                                              ↓
                                    Deploy to Preview
```

### Production Deployment

```
develop Branch → All Tests Pass → Create Release PR
                                              ↓
                                    Code Review & Approval
                                              ↓
                                    Merge to main
                                              ↓
                                    GitHub Actions CI
                                              ↓
                                    All Checks Pass?
                                              ↓ Yes
                                    Vercel Production Deploy
                                              ↓
                                    Run Database Migrations
                                              ↓
                                    Monitor Deployment
```

## Required Checks for PR Merge

Before a PR can be merged, the following must pass:

1. ✅ ESLint (no errors)
2. ✅ TypeScript type check (no errors)
3. ✅ Unit tests (all passing, 80% coverage)
4. ✅ E2E tests (all passing)
5. ✅ Build succeeds
6. ✅ PR title follows Conventional Commits
7. ✅ Code review approved
8. ✅ No merge conflicts

## Local Development Commands

```bash
# Run all checks locally before pushing
pnpm lint              # ESLint
pnpm tsc --noEmit      # Type check
pnpm test              # Unit tests
pnpm test:coverage     # Unit tests with coverage
pnpm test:e2e          # E2E tests
pnpm build             # Build application

# Run all checks at once
pnpm lint && pnpm tsc --noEmit && pnpm test && pnpm build
```

## Deployment Commands

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# List all deployments
vercel ls
```

## Monitoring and Debugging

### GitHub Actions

1. Go to repository → Actions tab
2. Select workflow run
3. View logs for each job
4. Download artifacts (test reports, coverage)

### Vercel Deployments

1. Go to Vercel dashboard
2. Select project
3. View deployment logs
4. Check function logs for runtime errors

### Coverage Reports

- Uploaded to Codecov after each CI run
- View coverage trends over time
- Identify untested code

## Troubleshooting

### CI Failures

**Lint Errors**:
```bash
pnpm lint --fix  # Auto-fix issues
```

**Type Errors**:
```bash
pnpm tsc --noEmit  # Check types locally
```

**Test Failures**:
```bash
pnpm test --watch  # Run tests in watch mode
pnpm test --ui     # Run tests with UI
```

**Build Failures**:
```bash
pnpm build  # Build locally to see errors
rm -rf .next && pnpm build  # Clean build
```

### Deployment Failures

**Environment Variables**:
- Check all required variables are set in Vercel
- Verify variable names match exactly
- Redeploy after adding new variables

**Database Connection**:
- Verify DATABASE_URL is correct
- Check database is accessible
- Enable connection pooling

## Best Practices

### Before Creating PR

1. Run all tests locally
2. Check code coverage
3. Run linter and fix issues
4. Build application successfully
5. Write descriptive PR title and description

### PR Guidelines

- Keep PRs small and focused
- One feature or fix per PR
- Include tests for new code
- Update documentation if needed
- Link related issues

### Commit Messages

Follow Conventional Commits format:
- `feat(scope): description` - New feature
- `fix(scope): description` - Bug fix
- `docs(scope): description` - Documentation
- `test(scope): description` - Tests
- `chore(scope): description` - Maintenance

## Security

### Secrets Management

- Never commit secrets to Git
- Use Vercel environment variables
- Rotate secrets regularly
- Use different secrets per environment

### Dependencies

- Regularly update dependencies
- Review security advisories
- Use `pnpm audit` to check vulnerabilities

## Future Enhancements

- [ ] Add automated dependency updates (Dependabot)
- [ ] Integrate Sentry for error tracking
- [ ] Add performance monitoring
- [ ] Implement automated database backups
- [ ] Add staging environment
- [ ] Set up blue-green deployments

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Documentation](https://vercel.com/docs)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Codecov Documentation](https://docs.codecov.com/)

