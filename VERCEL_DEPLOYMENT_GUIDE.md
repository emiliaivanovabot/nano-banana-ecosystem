# Vercel Deployment Guide for Nano Banana Ecosystem

## Overview
This guide provides step-by-step instructions for deploying your nano-banana-ecosystem monorepo to Vercel with optimal configuration.

## Project Configuration Summary

### ✅ Completed Configurations
- **Project Size**: Optimized from 729MB to 22MB (GitHub compatible)
- **Package Manager**: Configured for npm (Vercel compatible) 
- **Monorepo Setup**: Turborepo with npm workspaces
- **Build Configuration**: Individual app deployment configs

### Apps Overview
- **Platform App**: Main application (port 3000)
- **Seedream App**: AI image generation app (port 3001)

## Step-by-Step Deployment

### 1. GitHub Repository Setup

**CRITICAL**: Ensure your repository is uploaded to GitHub BEFORE connecting to Vercel.

```bash
# If not already done, commit and push your changes
git add .
git commit -m "Configure Vercel deployment settings"

# Use GitHub CLI for reliable push (regular git push often fails)
gh repo sync --force
```

**Verification**: Check https://github.com/emiliaivanovabot/nano-banana-ecosystem to ensure all files are uploaded with recent timestamps.

### 2. Vercel Project Creation

#### Option A: Deploy Platform App
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import from GitHub: `emiliaivanovabot/nano-banana-ecosystem`
4. **Framework**: Next.js
5. **Root Directory**: `apps/platform`
6. **Build Command**: `cd ../.. && npm run build --filter=platform`
7. **Output Directory**: `apps/platform/.next`
8. **Install Command**: `cd ../.. && npm install`

#### Option B: Deploy Seedream App
1. Create second Vercel project
2. Import same GitHub repository
3. **Framework**: Next.js  
4. **Root Directory**: `apps/seedream`
5. **Build Command**: `cd ../.. && npm run build --filter=seedream`
6. **Output Directory**: `apps/seedream/.next`
7. **Install Command**: `cd ../.. && npm install`

### 3. Environment Variables Configuration

#### Platform App Environment Variables
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-platform-domain.vercel.app
```

#### Seedream App Environment Variables  
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-seedream-domain.vercel.app

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration  
OPENAI_API_KEY=your_openai_api_key

# File Upload Configuration
UPLOAD_DIR=/tmp
MAX_FILE_SIZE=10485760
ALLOWED_MIME_TYPES=image/jpeg,image/jpg,image/png,image/webp

# Rate Limiting
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_WINDOW=3600000
```

**CRITICAL**: Environment variable format must be:
- ✅ `VARIABLE_NAME` = `value` (clean)
- ❌ `VARIABLE_NAME=/tmp` (includes equals in value)

### 4. Deployment Configuration Verification

#### Build Logs Check
1. Go to Vercel Dashboard → Deployments
2. Click on latest deployment
3. Check build logs for:
   - ✅ "Running install command: npm install" 
   - ✅ No "pnpm install" mentions
   - ✅ Successful dependency resolution

#### Function Logs Check  
1. Go to Functions tab in Vercel dashboard
2. Check API routes are deployed correctly
3. Test endpoints return expected responses

### 5. Custom Domains (Optional)

#### Platform App
```env
NEXT_PUBLIC_APP_URL=https://platform.yourdomain.com
```

#### Seedream App  
```env
NEXT_PUBLIC_APP_URL=https://seedream.yourdomain.com
```

## Troubleshooting Guide

### Common Issues & Solutions

#### 1. "pnpm install" appears in build logs
**Cause**: Vercel ignoring npm configuration
**Solution**: Verify all configuration files are properly set:
- ✅ `/package.json` has `"packageManager": "npm@latest"`
- ✅ `/.npmrc` contains npm preferences
- ✅ `/vercel.json` specifies npm commands
- ✅ Clear Vercel Data Cache in dashboard

#### 2. Build fails with workspace resolution errors
**Cause**: Workspace dependencies not resolved
**Solution**: 
- Ensure `package.json` includes workspaces array
- Verify shared package dependencies use `"*"` not `"workspace:*"`
- Check build command includes `cd ../..`

#### 3. Environment variables not working
**Cause**: Variable format or parsing issues
**Solution**:
- Remove any `=` characters from environment variable values
- Use `/tmp` not `./uploads` for file paths
- Test with health check endpoint

#### 4. API routes returning 500 errors  
**Cause**: Missing dependencies or environment variables
**Solution**:
- Check Function logs in Vercel dashboard
- Verify all required environment variables are set
- Ensure file system operations use `/tmp` directory

#### 5. Git push timeouts
**Cause**: GitHub connectivity issues (very common)
**Solution**:
- Use GitHub CLI: `gh repo sync --force`
- If that fails, edit files directly on github.com
- Never use regular `git push` - always times out

### Health Check Endpoints

Create these endpoints to verify deployment:

#### Platform Health Check
Create `/apps/platform/src/app/api/health/route.ts`:
```typescript
export async function GET() {
  return Response.json({ 
    status: 'ok', 
    app: 'platform',
    timestamp: new Date().toISOString() 
  });
}
```

#### Seedream Health Check  
Create `/apps/seedream/src/app/api/health/route.ts`:
```typescript
export async function GET() {
  return Response.json({ 
    status: 'ok',
    app: 'seedream', 
    env: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing',
      openaiKey: process.env.OPENAI_API_KEY ? 'set' : 'missing'
    },
    timestamp: new Date().toISOString()
  });
}
```

### Deployment URLs

After successful deployment:
- **Platform**: https://your-platform.vercel.app
- **Seedream**: https://your-seedream.vercel.app  
- **Platform Health**: https://your-platform.vercel.app/api/health
- **Seedream Health**: https://your-seedream.vercel.app/api/health

## Success Criteria

✅ Both apps deploy without errors
✅ Build logs show "npm install" (not pnpm)  
✅ Health check endpoints return 200 responses
✅ Environment variables properly configured
✅ API routes function correctly
✅ No workspace dependency errors

## Emergency Recovery

If deployment fails completely:

1. **Clear Vercel Cache**: Dashboard → Settings → Data Cache → Purge
2. **Force Redeploy**: Use "Redeploy" with "Use existing Build Cache: NO" 
3. **Verify GitHub**: Ensure latest code is on GitHub with recent timestamps
4. **Delete/Recreate**: Sometimes requires deleting and recreating Vercel project

## Next Steps

After successful deployment:
1. Set up custom domains
2. Configure monitoring and alerting  
3. Set up preview deployments for PRs
4. Configure CI/CD workflows
5. Set up database migrations workflow

## Support

For deployment issues:
1. Check Vercel build logs first
2. Verify all configuration files match this guide
3. Test health check endpoints
4. Clear all caches before retrying

---
**Generated**: Nano Banana Ecosystem Vercel Deployment Guide
**Version**: 1.0  
**Last Updated**: December 2025