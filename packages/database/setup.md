# Nano Banana Ecosystem - Database Setup Guide

## Production Supabase Setup Instructions

### 1. Create New Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose organization and set project details:
   - **Name**: `nano-banana-ecosystem-prod`
   - **Password**: Generate strong database password
   - **Region**: Choose closest to your users (US East for US audience)
4. Wait for project creation (3-5 minutes)

### 2. Configure Authentication Settings

In your Supabase dashboard, go to **Authentication > Settings**:

#### Site URL Configuration
```
Site URL: https://platform.nanobanan.ai
```

#### Additional Redirect URLs
```
https://platform.nanobanan.ai/**
https://seedream.nanobanan.ai/**
http://localhost:3000/**
http://localhost:3001/**
```

#### JWT Settings
- JWT expiry: `86400` (24 hours)
- Disable signup: `false`
- Enable email confirmations: `true`
- Enable secure email change: `true`
- Enable manual linking: `false`

#### Email Templates
Customize the email templates in **Authentication > Email Templates**:
- Welcome email with nano-banana branding
- Password recovery with custom styling
- Email change confirmation

### 3. Set Up OAuth Providers

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - **Authorized origins**: 
     - `https://platform.nanobanan.ai`
     - `https://seedream.nanobanan.ai`
   - **Authorized redirect URIs**:
     - `https://your-project.supabase.co/auth/v1/callback`
5. Copy Client ID and Secret to Supabase dashboard

#### GitHub OAuth Setup
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth App:
   - **Application name**: `Nano Banana Ecosystem`
   - **Homepage URL**: `https://platform.nanobanan.ai`
   - **Authorization callback URL**: `https://your-project.supabase.co/auth/v1/callback`
3. Copy Client ID and Secret to Supabase dashboard

### 4. Run Database Migrations

#### Install Dependencies
```bash
cd packages/database
npm install
```

#### Set Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your production values:
```env
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Run Schema Migration
```bash
# Navigate to database package
cd packages/database

# Run migration (make sure you're in the database package directory)
node -e "
const { runMigrations } = require('./migrations.ts');
runMigrations().catch(console.error);
"
```

### 5. Configure Security Settings

#### Row Level Security (RLS)
- ✅ Enabled on all tables by default in schema
- ✅ User isolation policies implemented
- ✅ Service role bypass for server operations

#### API Rate Limiting
In Supabase dashboard, go to **Settings > API**:
- Enable rate limiting: `true`
- Requests per minute: `60`
- Burst limit: `100`

#### CORS Configuration
In **Settings > API > CORS**:
```
https://platform.nanobanan.ai
https://seedream.nanobanan.ai
http://localhost:3000
http://localhost:3001
```

### 6. Environment Variables for Applications

#### Platform App (.env.local)
```env
# Supabase Configuration
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="eyJ..."

# OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GITHUB_CLIENT_ID="your-github-client-id"

# Application URLs
NEXT_PUBLIC_SITE_URL="https://platform.nanobanan.ai"
NEXT_PUBLIC_SEEDREAM_URL="https://seedream.nanobanan.ai"
```

#### Seedream App (.env.local)
```env
# Supabase Configuration (same as platform)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="eyJ..."

# Application URLs
NEXT_PUBLIC_SITE_URL="https://seedream.nanobanan.ai"
NEXT_PUBLIC_PLATFORM_URL="https://platform.nanobanan.ai"
```

### 7. Test Database Connection

#### Health Check
```bash
node -e "
const { healthCheck } = require('./migrations.ts');
healthCheck().then(console.log).catch(console.error);
"
```

#### Manual Testing
```sql
-- Test user profile access (should fail without auth)
SELECT * FROM user_profiles LIMIT 1;

-- Test RLS policies
SELECT has_table_privilege('user_profiles', 'SELECT');
```

### 8. Production Monitoring Setup

#### Enable Monitoring
In Supabase dashboard:
1. Go to **Settings > Integrations**
2. Enable **Supabase Metrics**
3. Set up alerts for:
   - Database connection errors
   - High response times (>500ms)
   - Authentication failures
   - API rate limit hits

#### Database Performance
1. Go to **Database > Logs**
2. Monitor slow queries
3. Check index usage
4. Set up alerts for connection pool exhaustion

### 9. Backup and Recovery

#### Enable Point-in-Time Recovery
1. Go to **Settings > Database**
2. Enable PITR (Point-in-Time Recovery)
3. Set retention period: `7 days` minimum

#### Database Backups
- Automatic daily backups enabled by default
- Manual backup before major deployments
- Test restore process quarterly

### 10. Security Checklist

#### Pre-Production Checklist
- [ ] RLS enabled on all tables
- [ ] Service role key secured (not in client code)
- [ ] OAuth providers configured with correct domains
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Email verification required
- [ ] Strong password policies enforced
- [ ] Monitoring and alerts configured
- [ ] Backup and recovery tested

#### Post-Production Checklist
- [ ] Health check passes
- [ ] Authentication flow tested
- [ ] Cross-domain auth working
- [ ] API responses under 200ms
- [ ] No data leakage between users
- [ ] OAuth flows working
- [ ] Email delivery working
- [ ] Monitoring alerts active

### 11. Troubleshooting

#### Common Issues

**"Authentication failed" errors**:
- Check JWT secret configuration
- Verify site URL matches exactly
- Confirm redirect URLs include protocol

**"RLS policy violation" errors**:
- Ensure user is authenticated
- Check policy conditions match user context
- Verify service role usage for admin operations

**Cross-domain authentication issues**:
- Check cookie domain configuration
- Verify CORS settings
- Confirm both domains in redirect URLs

**Performance issues**:
- Check connection pool settings
- Monitor slow query logs
- Verify indexes are being used

### 12. Support and Maintenance

#### Regular Tasks
- [ ] Weekly database performance review
- [ ] Monthly security audit
- [ ] Quarterly backup restore test
- [ ] Update Supabase client libraries

#### Emergency Contacts
- Supabase Support: [Dashboard > Help & Support]
- Database DBA: [Your team contact]
- Infrastructure Team: [Your team contact]

---

## Next Steps

After completing this setup:
1. ✅ Database foundation ready
2. ⏳ Deploy applications to Vercel
3. ⏳ Configure custom domains
4. ⏳ Set up production monitoring
5. ⏳ Run end-to-end tests

This completes the production database setup for the Nano Banana Ecosystem.