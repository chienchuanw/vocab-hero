# Environment Variables Management

## Overview

This document describes how to manage environment variables across different environments (development, testing, production).

## Environment Files

### Local Development

**File**: `.env.local` (not committed to Git)

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/db_vocab_hero?schema=public"

# NextAuth (when implemented)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-key-change-in-production"

# Optional: OAuth providers (when implemented)
# GOOGLE_CLIENT_ID=""
# GOOGLE_CLIENT_SECRET=""
```

### Testing

**File**: `.env.test` (not committed to Git)

```env
# Test Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/db_vocab_hero_test?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="test-secret-key"
```

### Production

**Location**: Vercel Dashboard > Project Settings > Environment Variables

```env
# Database (use connection pooling URL from Neon/Supabase)
DATABASE_URL="postgresql://user:password@host:5432/vocab_hero_prod?schema=public"

# NextAuth
NEXTAUTH_URL="https://vocab-hero.vercel.app"
NEXTAUTH_SECRET="<generate-strong-secret>"

# OAuth providers (when implemented)
# GOOGLE_CLIENT_ID="<production-client-id>"
# GOOGLE_CLIENT_SECRET="<production-client-secret>"
```

## Variable Descriptions

### Required Variables

#### DATABASE_URL
- **Description**: PostgreSQL connection string
- **Format**: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public`
- **Environments**: All
- **Example**: `postgresql://postgres:postgres@localhost:5432/db_vocab_hero`

#### NEXTAUTH_URL
- **Description**: Base URL of the application
- **Environments**: All
- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.vercel.app`

#### NEXTAUTH_SECRET
- **Description**: Secret key for NextAuth.js session encryption
- **Environments**: All
- **Generation**: Run `openssl rand -base64 32`
- **Security**: Must be different for each environment

### Optional Variables (Future)

#### GOOGLE_CLIENT_ID
- **Description**: Google OAuth client ID
- **Environments**: Production, Preview
- **Obtain from**: Google Cloud Console

#### GOOGLE_CLIENT_SECRET
- **Description**: Google OAuth client secret
- **Environments**: Production, Preview
- **Obtain from**: Google Cloud Console

## Setup Instructions

### 1. Local Development Setup

```bash
# Copy example file
cp .env.example .env.local

# Edit .env.local with your local database credentials
# Make sure PostgreSQL is running locally
```

### 2. Testing Setup

```bash
# Create test environment file
cp .env.example .env.test

# Update DATABASE_URL to use test database
# The test database should be separate from development
```

### 3. Production Setup (Vercel)

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add each variable for Production environment
5. Add same variables for Preview environment (with different values)

### 4. Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Environment-Specific Configuration

### Development

- Use local PostgreSQL database
- Enable detailed logging
- Hot reload enabled
- Source maps enabled

### Testing

- Use separate test database
- Mock external services
- Faster test execution
- No external API calls

### Production

- Use managed database (Neon/Supabase)
- Minimal logging (errors only)
- Optimized builds
- Connection pooling enabled

## Security Best Practices

### DO

✅ Use different secrets for each environment
✅ Store secrets in Vercel dashboard, not in code
✅ Use `.env.local` for local development
✅ Add `.env*` to `.gitignore`
✅ Rotate secrets regularly
✅ Use strong, random secrets
✅ Enable connection pooling for production database

### DON'T

❌ Commit `.env` files to Git
❌ Share secrets in chat or email
❌ Use same secrets across environments
❌ Hardcode secrets in code
❌ Use weak or predictable secrets
❌ Expose secrets in client-side code

## Accessing Environment Variables

### Server-Side (API Routes, Server Components)

```typescript
// Direct access to all environment variables
const databaseUrl = process.env.DATABASE_URL;
const nextAuthSecret = process.env.NEXTAUTH_SECRET;
```

### Client-Side (Browser)

```typescript
// Only variables prefixed with NEXT_PUBLIC_ are available
// Example: NEXT_PUBLIC_API_URL
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

**Important**: Never expose sensitive data (database URLs, secrets) to the client.

## Troubleshooting

### Variable Not Found

1. Check variable name spelling (case-sensitive)
2. Restart development server after adding new variables
3. Verify `.env.local` exists and is in project root
4. Check Vercel dashboard for production variables

### Database Connection Failed

1. Verify DATABASE_URL format is correct
2. Check database is running (local) or accessible (production)
3. Verify credentials are correct
4. Check firewall/network settings

### NextAuth Errors

1. Verify NEXTAUTH_URL matches your domain
2. Check NEXTAUTH_SECRET is set and not empty
3. Ensure URL includes protocol (http:// or https://)

## Validation

Create a validation script to check required variables:

```typescript
// lib/env.ts
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
] as const;

export function validateEnv() {
  const missing = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}
```

## References

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)

