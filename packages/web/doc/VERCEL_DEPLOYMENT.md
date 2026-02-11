# Vercel Deployment Guide

## Overview

This document provides instructions for deploying Vocab Hero to Vercel.

## Prerequisites

- Vercel account (sign up at https://vercel.com)
- GitHub repository connected to Vercel
- PostgreSQL database (Neon, Supabase, or other provider)

## Initial Setup

### 1. Connect GitHub Repository

1. Go to https://vercel.com/new
2. Import your GitHub repository `vocab-hero`
3. Select the repository and click "Import"

### 2. Configure Project Settings

**Framework Preset**: Next.js

**Root Directory**: `./` (leave as default)

**Build Command**: `pnpm build`

**Output Directory**: `.next` (default)

**Install Command**: `pnpm install`

### 3. Environment Variables

Add the following environment variables in Vercel dashboard:

#### Production Environment

```env
DATABASE_URL=postgresql://user:password@host:5432/database
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key-here
```

#### Preview Environment (for PR deployments)

```env
DATABASE_URL=postgresql://user:password@host:5432/preview_database
NEXTAUTH_URL=https://your-preview-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key-here
```

#### Development Environment

```env
DATABASE_URL=postgresql://user:password@host:5432/dev_database
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

### 4. Database Setup

#### Option 1: Neon (Recommended)

1. Sign up at https://neon.tech
2. Create a new project
3. Create databases:
   - `vocab_hero_prod` (production)
   - `vocab_hero_preview` (preview/staging)
4. Copy connection strings to Vercel environment variables

#### Option 2: Supabase

1. Sign up at https://supabase.com
2. Create a new project
3. Go to Settings > Database
4. Copy connection string (use "Connection Pooling" for better performance)
5. Add to Vercel environment variables

### 5. Deployment Branches

**Production**: `main` branch
- Automatically deploys to production domain
- Runs database migrations
- Uses production environment variables

**Preview**: `develop` branch and all PRs
- Automatically deploys to preview URLs
- Uses preview environment variables
- Useful for testing before merging to main

## Deployment Workflow

### Automatic Deployments

1. **Push to `main`**: Triggers production deployment
2. **Push to `develop`**: Triggers preview deployment
3. **Open PR**: Creates a unique preview deployment for the PR

### Manual Deployments

1. Go to Vercel dashboard
2. Select your project
3. Click "Deployments" tab
4. Click "Redeploy" on any previous deployment

## Database Migrations

### Production Migrations

Migrations should be run manually for production:

```bash
# Connect to production database
DATABASE_URL="your-production-url" pnpm prisma migrate deploy
```

### Preview Migrations

For preview deployments, you can add a build command:

```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

## Monitoring and Logs

### View Deployment Logs

1. Go to Vercel dashboard
2. Select your project
3. Click on a deployment
4. View "Build Logs" and "Function Logs"

### Error Tracking

Consider integrating error tracking services:
- Sentry
- LogRocket
- Datadog

## Performance Optimization

### Edge Functions

Vercel automatically deploys Next.js API routes as serverless functions.

### Caching

Configure caching headers in `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=60, s-maxage=60' },
        ],
      },
    ];
  },
};
```

### Image Optimization

Next.js Image component is automatically optimized by Vercel.

## Troubleshooting

### Build Failures

1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Test build locally: `pnpm build`
4. Check Node.js version compatibility

### Database Connection Issues

1. Verify DATABASE_URL is correct
2. Check database is accessible from Vercel's IP ranges
3. Ensure connection pooling is enabled for serverless

### Environment Variable Issues

1. Verify variables are set for correct environment (Production/Preview/Development)
2. Redeploy after adding new variables
3. Check variable names match exactly (case-sensitive)

## Security Best Practices

1. Never commit `.env` files to Git
2. Use Vercel's environment variable encryption
3. Rotate secrets regularly
4. Use different databases for production and preview
5. Enable Vercel's security headers

## Useful Commands

```bash
# Install Vercel CLI
pnpm add -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls
```

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

