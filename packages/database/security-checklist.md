# Supabase Production Security Checklist

## Pre-Deployment Security Validation

### 🔐 Authentication Security

#### Password Policies
- [ ] Minimum 8 characters required
- [ ] Uppercase, lowercase, numbers, special chars required
- [ ] Common passwords blocked
- [ ] Password history tracking (last 5 passwords)
- [ ] Account lockout after 5 failed attempts

#### JWT Configuration
- [ ] JWT secret is cryptographically strong (>32 chars)
- [ ] Token expiry set to 24 hours maximum
- [ ] Refresh token rotation enabled
- [ ] Secure algorithm (HS256 minimum) configured
- [ ] Audience claim properly configured

#### OAuth Security
- [ ] Google OAuth redirect URIs whitelist only production domains
- [ ] GitHub OAuth callback URLs restricted to production
- [ ] Client secrets stored securely (never in client code)
- [ ] OAuth scopes limited to minimum required permissions
- [ ] PKCE flow enabled for public clients

### 🛡️ Database Security

#### Row Level Security (RLS)
- [ ] RLS enabled on ALL tables
- [ ] Default deny policy (no access without explicit policy)
- [ ] User isolation policies tested (user A cannot access user B data)
- [ ] Service role bypass policies limited to server-side operations only
- [ ] Anonymous role has no table access
- [ ] Authenticated role has limited, policy-controlled access

#### Data Protection
- [ ] No sensitive data in client-accessible columns
- [ ] PII fields encrypted at application layer where needed
- [ ] Audit trail for all data modifications
- [ ] Soft deletes implemented for critical data
- [ ] Data retention policies defined and implemented

#### API Security
- [ ] Service role key never exposed to client
- [ ] Anon key properly scoped (read-only where possible)
- [ ] API rate limiting configured and tested
- [ ] Request size limits enforced
- [ ] SQL injection protection verified

### 🌐 Network Security

#### CORS Configuration
- [ ] CORS origins whitelist only production domains
- [ ] No wildcard (`*`) origins in production
- [ ] Credentials flag properly configured
- [ ] Preflight requests handled correctly
- [ ] Cross-domain cookie settings secure

#### SSL/TLS
- [ ] All connections use HTTPS
- [ ] TLS 1.2 minimum enforced
- [ ] Certificate chain validated
- [ ] HSTS headers configured
- [ ] Mixed content warnings resolved

### 📊 Monitoring & Logging

#### Security Monitoring
- [ ] Failed login attempt tracking
- [ ] Unusual access pattern detection
- [ ] API abuse monitoring
- [ ] Database connection monitoring
- [ ] Error rate alerting configured

#### Audit Logging
- [ ] Authentication events logged
- [ ] Database schema changes logged
- [ ] Permission changes tracked
- [ ] Admin actions audited
- [ ] Log retention policy defined (minimum 90 days)

### 🔄 Environment Security

#### Environment Variables
- [ ] Production secrets not in version control
- [ ] Environment variables encrypted at rest
- [ ] Secret rotation schedule defined
- [ ] Access to production env vars limited
- [ ] Development/staging use separate credentials

#### Infrastructure Security
- [ ] Database access restricted to application servers
- [ ] No direct database access from public internet
- [ ] Regular security updates applied
- [ ] Backup encryption enabled
- [ ] Point-in-time recovery configured

## Security Testing Checklist

### 🧪 Authentication Testing

#### User Access Control
```bash
# Test 1: Anonymous access should be denied
curl -X GET "https://your-project.supabase.co/rest/v1/user_profiles" \
  -H "apikey: YOUR_ANON_KEY"
# Expected: 401 Unauthorized

# Test 2: User can only access own data
curl -X GET "https://your-project.supabase.co/rest/v1/user_profiles" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer USER_JWT"
# Expected: Only returns current user's profile
```

#### OAuth Flow Testing
- [ ] Google OAuth flow completes successfully
- [ ] GitHub OAuth flow completes successfully
- [ ] OAuth state parameter prevents CSRF
- [ ] Invalid redirect_uri rejected
- [ ] Expired authorization codes rejected

### 🔍 Data Access Testing

#### RLS Policy Validation
```sql
-- Test user isolation
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-1-uuid';
SELECT * FROM user_profiles; -- Should only return user-1's profile

SET request.jwt.claim.sub = 'user-2-uuid';
SELECT * FROM user_profiles; -- Should only return user-2's profile

-- Test anonymous access
SET ROLE anon;
SELECT * FROM user_profiles; -- Should return no rows
```

#### API Endpoint Testing
- [ ] GET /user_profiles returns only current user
- [ ] POST /billing_events requires authentication
- [ ] UPDATE operations limited to user's own data
- [ ] DELETE operations properly authorized
- [ ] Bulk operations respect RLS policies

### 🚀 Performance Security Testing

#### Rate Limiting Validation
```bash
# Test API rate limits
for i in {1..100}; do
  curl -X GET "https://your-project.supabase.co/rest/v1/user_profiles" \
    -H "apikey: YOUR_ANON_KEY" &
done
# Expected: Some requests return 429 Too Many Requests
```

#### Connection Pool Testing
- [ ] Database handles expected concurrent connections
- [ ] Connection timeouts properly configured
- [ ] No connection leaks under load
- [ ] Pool exhaustion handled gracefully

### 🎯 Production Readiness

#### Pre-Launch Security Review
- [ ] All security tests pass
- [ ] Penetration testing completed
- [ ] Security team sign-off obtained
- [ ] Incident response plan documented
- [ ] Security contact information updated

#### Post-Launch Monitoring
- [ ] Security dashboards active
- [ ] Alerting rules configured and tested
- [ ] Log aggregation working
- [ ] Backup and recovery tested
- [ ] Security patch process documented

## Emergency Response

### 🚨 Security Incident Response

#### Immediate Actions
1. **Identify** the scope of the security incident
2. **Contain** the threat (disable affected accounts/APIs)
3. **Assess** the impact and data exposure
4. **Notify** relevant stakeholders
5. **Document** all actions taken

#### Communication Plan
- [ ] Internal security team contact list
- [ ] Customer notification templates
- [ ] Regulatory reporting requirements
- [ ] Public communication strategy

### 🔧 Common Security Issues

#### Authentication Bypass
```bash
# Check for authentication bypass vulnerabilities
# Verify all endpoints require proper authentication
curl -X POST "https://your-project.supabase.co/rest/v1/user_profiles" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@evil.com"}'
# Expected: 401 Unauthorized (no API key)
```

#### Data Exposure
```sql
-- Audit for potential data exposure
SELECT schemaname, tablename, hasrlspolicy 
FROM pg_tables 
LEFT JOIN (
  SELECT schemaname, tablename, 
  CASE WHEN COUNT(*) > 0 THEN true ELSE false END as hasrlspolicy
  FROM pg_policies 
  GROUP BY schemaname, tablename
) policies USING (schemaname, tablename)
WHERE schemaname = 'public';
-- All public tables should have RLS policies
```

## Security Maintenance Schedule

### 🗓️ Regular Security Tasks

#### Weekly
- [ ] Review authentication logs for anomalies
- [ ] Check API rate limit violations
- [ ] Monitor database performance metrics
- [ ] Verify backup completion

#### Monthly
- [ ] Security patch review and application
- [ ] Access review (remove unused accounts)
- [ ] Rate limit effectiveness review
- [ ] Security metric trending analysis

#### Quarterly
- [ ] Full security audit
- [ ] Penetration testing
- [ ] Disaster recovery testing
- [ ] Security training updates
- [ ] Incident response plan review

#### Annually
- [ ] Security architecture review
- [ ] Compliance audit (SOC 2, etc.)
- [ ] Third-party security assessment
- [ ] Insurance policy review

---

## Security Contact Information

**Primary Security Contact**: [Your Security Team]
**Supabase Support**: help@supabase.com
**Emergency Escalation**: [24/7 Contact]

**Remember**: Security is an ongoing process, not a one-time setup. Regular monitoring, testing, and updates are essential for maintaining a secure production environment.