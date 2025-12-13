# Vercel Staging Deployment Guide

## 🚀 Quick Deployment Steps

### 1. **Vercel Environment Secrets Setup**

Zuerst alle Secrets in Vercel Dashboard hinzufügen:

```bash
# Supabase Secrets  
@nano_supabase_url = "https://qoxznbwvyomyyijokkgk.supabase.co"
@nano_supabase_anon_key = "eyJhbGciOi..."  
@nano_supabase_service_key = "eyJhbGciOi..."

# API Keys
@nano_runpod_api_key = "rpa_H55OQ..."
@nano_runpod_endpoint = "0wdu1jyimdgri3"  
@nano_gemini_api_key = "AIzaSyAfo6..."
@nano_jwt_secret = "production-secret-hier"
```

### 2. **Platform App Deployment**

```bash
# From project root
cd apps/platform
vercel --prod
# Follow prompts:
# - Project name: nano-platform-v2
# - Domain: platform-v2.vercel.app (auto-assigned)
```

### 3. **Seedream App Deployment** 

```bash
cd apps/seedream  
vercel --prod
# Follow prompts:
# - Project name: nano-seedream-v2
# - Domain: seedream-v2.vercel.app (auto-assigned)
```

## 🔐 Cross-Domain Auth Testing

Nach Deployment diese URLs testen:

### Auth Flow Test
1. **Login**: `https://platform-v2.vercel.app/login`
   - Credentials: `emilia.berlin` / `2002`
   - Verify: Dashboard loads with user data

2. **Cross-App Navigation**: 
   - Go to: `https://seedream-v2.vercel.app` 
   - Expected: Auto-login oder Session transfer
   - Test: AI image generation works

3. **Session Persistence**:
   - Refresh both apps
   - Expected: User bleibt eingeloggt
   - Test: Logout from one app = logout from both

## ⚠️ Expected Issues & Solutions

### Issue 1: Cookie Domain nicht .vercel.app
**Symptom**: Login funktioniert nur in einer App
**Fix**: Environment Variable `VERCEL_URL` wird automatisch gesetzt

### Issue 2: CORS Errors zwischen Apps  
**Symptom**: API calls zwischen Apps fehlschlagen
**Fix**: Bereits konfiguriert in `next.config.ts`

### Issue 3: Environment Variables nicht geladen
**Symptom**: "Missing Supabase environment variables"  
**Fix**: Vercel Dashboard → Project → Settings → Environment Variables

### Issue 4: Build Errors auf Vercel
**Symptom**: Turbo build fails
**Fix**: Check build command in `vercel.json`:
```json
"buildCommand": "cd ../.. && npx turbo build --filter=platform"
```

## 📱 Mobile Testing

Nach erfolgreichem Desktop-Test:
1. Mobile Safari: Cross-app navigation 
2. Chrome Mobile: Session persistence
3. PWA Install: Beide Apps als separate PWAs

## ✅ Success Criteria

**Deployment erfolgreich wenn:**
- ✅ Platform Dashboard zeigt V1 user data (8 users, 4000+ generations)
- ✅ Seedream Login funktioniert mit V1 credentials  
- ✅ Cross-app navigation behält Session bei
- ✅ API Endpoints antworten < 2s
- ✅ Keine Console Errors in Browser

## 🔄 Nächste Schritte nach Staging

**Wenn alles funktioniert:**
1. **Custom Domains** setup:
   - `platform.nano-banana.app` → Platform App
   - `seedream.nano-banana.app` → Seedream App
2. **Gemini App** als nächste App hinzufügen
3. **Analytics** für User Journey tracking

---

**Ready for deployment!** 🚀