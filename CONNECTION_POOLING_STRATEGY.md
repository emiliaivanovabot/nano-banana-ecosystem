# Connection Pooling Strategy - V2 Monorepo

## 🚨 Problem: DB Connection Limits

Mit 7+ Apps auf Vercel können wir schnell an Supabase Connection Limits stoßen:

```
Platform + Seedream + Gemini + WAN Video + Qwen Edit + Kling Avatar + Grok = 7 Apps
Jede App: ~3-10 Connections = 21-70 simultane DB Connections
Supabase Free: 60 Connections Limit ⚠️
```

## ✅ Lösungsansätze

### 1. **Supabase Connection Pooling (Bereits aktiv)**
```typescript
// packages/database/supabase-config.ts
export const productionSupabaseConfig = {
  db: {
    schema: 'public'
  },
  auth: {
    autoRefreshToken: true,
    persistSession: false, // Wichtig für Vercel Edge
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'x-connection-mode': 'transaction' // Connection Pooling aktiviert
    }
  }
}
```

### 2. **Per-App Connection Limits**
```typescript
// Jede App limitiert Connections
const createServerSupabaseClient = () => {
  return createClient(url, key, {
    ...productionSupabaseConfig,
    db: {
      ...productionSupabaseConfig.db,
      connectionString: process.env.SUPABASE_URL,
      poolSize: 3 // Max 3 Connections pro App
    }
  })
}
```

### 3. **Edge Functions für Heavy Queries**
```typescript
// Für komplexe Queries: Vercel Edge Functions statt API Routes
// Edge Functions nutzen globales Connection Pooling
export const config = {
  runtime: 'edge'
}

export default async function handler(req: Request) {
  const supabase = createClient(url, key, { 
    db: { mode: 'transaction' } 
  })
  // Heavy query hier
}
```

## 📊 Monitoring

### Connection Usage Tracking
```sql
-- Supabase Dashboard Query
SELECT 
  count(*) as active_connections,
  datname,
  usename,
  application_name
FROM pg_stat_activity 
WHERE state = 'active'
GROUP BY datname, usename, application_name;
```

### Alert Thresholds
- **Green**: < 30 Connections
- **Yellow**: 30-45 Connections  
- **Red**: > 45 Connections (Scale up oder optimieren)

## 🔄 Scaling Strategy

### Phase 1: Current (Supabase Free)
- Connection Pooling aktiviert
- Pro App: max 3-5 Connections
- Monitoring Dashboard

### Phase 2: Growth (Supabase Pro)
- Upgrade zu 200+ Connections
- Prisma Accelerate für globales Pooling
- Read Replicas für bessere Performance

### Phase 3: Enterprise
- Dedicated Database
- PgBouncer für Connection Pooling
- Multi-Region Setup

## ⚡ Quick Fixes

**Sofort umsetzen:**
1. `persistSession: false` in allen Apps
2. `x-connection-mode: transaction` Header
3. Edge Functions für heavy queries
4. Connection monitoring alerts

**Bei Problemen:**
1. Supabase Pro upgrade ($25/month)
2. Prisma Accelerate ($29/month)
3. Connection Pooler wie PgBouncer

---

**Status**: ✅ Grundsetup implementiert, Monitoring ausstehend