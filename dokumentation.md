# 📘 Nano Banana Ecosystem V2 – Technische Dokumentation (Masterplan, konsolidiert)

**Version:** 2.0 (Migration Phase)
**Status:** In Development (Greenfield Setup)
**Architektur-Typ:** Monorepo (Turborepo) mit Micro‑Frontend‑Ansatz (Multi‑Project Deployments auf Vercel)

Diese Dokumentation ist als **Masterplan** gedacht – für dich und jeden AI‑Assistenten – damit die Umsetzung **ohne Interpretationsfehler** möglich ist. Sie definiert Architektur, Routing/Proxy, Auth, DB‑Regeln, Setup, Deployment und verbindliche Standards.

---

## 1. Executive Summary & Strategie

Wir migrieren von einer monolithischen **V1‑Anwendung** zu einer skalierbaren **V2‑Architektur**.

### 1.1 Ziele

* **Modulare Plattform:** Eine zentrale **Platform** + mehrere **AI‑Module** (jedes Modell = eigenes Modul).
* **Greenfield:** Neuer Start im Turborepo, keine V1‑Git‑History.
* **Keine Downtime:** Phase 1 nutzt weiterhin die V1‑DB, keine riskanten Migrationen.
* **Stabiler Login ohne eigene Domain:** Cross‑Module‑Auth über Proxy/Pfad‑Modell unter einer gemeinsamen Vercel‑Domain.

### 1.2 Kerndecisions (fix)

* **Code‑Basis:** kompletter Neustart als Turborepo.
* **Datenbank:** Phase 1 nutzt die bestehende V1‑PostgreSQL Datenbank.
* **Auth:** zentralisierte Auth‑Hoheit in `apps/platform`, Module sind reine Session‑Konsumenten.
* **Routing:** **Pfad-/Proxy‑Modell via Rewrites** auf `https://platform-iota-swart.vercel.app` (Phase 1).
* **Deployment:** Vercel **Multi‑Project** Deployment: **jede App = eigenes Vercel‑Projekt**, aber **ein GitHub Repo**.

> **Wichtig:** Aussagen wie “Cookie auf .nano-banana.app” gelten erst in **Phase 2**, wenn eine eigene Domain existiert. In Phase 1: **kein `domain` im Cookie**.

---

## 2. Architektur-Übersicht

### 2.1 Monorepo Struktur (Turborepo)

```
nano-banana-ecosystem/
├── apps/
│   ├── platform/         # Dashboard, Auth-Provider, Billing, User Settings, Navigation
│   ├── nano-banana/      # Modul: Nano Banana (Image)
│   ├── seedream/         # Modul: Seedream (Image)
│   ├── qwen/             # Modul: Qwen (Text/Tools)
│   ├── grok/             # Modul: Grok (Text/Tools)
│   ├── openai/           # Modul: OpenAI (Text/Tools)
│   └── wan-2.5/          # Modul: Wan 2.5 (Video)
├── packages/
│   ├── ui/               # Shared UI + Tailwind Preset + Design Tokens
│   ├── database/         # Prisma Schema & Prisma Client (Single Source of Truth)
│   ├── auth-config/      # NextAuth/Auth.js Optionen, Cookie Settings, Session Helpers
│   ├── typescript-config/ # Shared TS config
│   └── eslint-config/    # Shared ESLint rules
├── package.json
└── turbo.json
```

### 2.2 Architekturprinzipien

* **Platform = Control Center:** Auth, Account, Billing, Settings, zentrale Navigation.
* **Jedes Modell = eigenes Modul:** eigenständig deploybar, eigenes Vercel‑Projekt, eigener Lifecycle.
* **Shared Code in Packages:** UI, Auth‑Konfig, DB‑Client/Schema, TS/Lint.
* **Micro‑Frontend‑Ansatz:** Module sind unabhängig, aber teilen dieselben Standards (Auth/DB/UI).

---

## 3. Tech Stack

* **Framework:** Next.js (App Router)
* **Sprache:** TypeScript
* **Styling:** Tailwind CSS (zentral über `@repo/ui`)
* **DB ORM:** Prisma (zentral in `@repo/database`)
* **Auth:** NextAuth.js / Auth.js (zentral in `@repo/auth-config`)
* **Deployment:** Vercel (Multi‑Project Deployment)

---

## 4. URL-, Routing- und Proxy-Konzept (Phase 1, ohne eigene Domain)

### 4.1 Warum Proxy/Pfad-Modell?

Vercel isoliert Cookies zwischen unterschiedlichen `*.vercel.app` Projekten. Ohne eigene Domain verlierst du sonst den Login beim Wechsel zwischen Projekten.

**Lösung:** Die Platform wird zum **Haupteingang** und leitet Pfade via **Rewrites** auf die Modul‑Projekte um.

### 4.2 Live URL-Konzept

**Zentrale URL (Haupteingang):**

* `https://platform-iota-swart.vercel.app`

**Module (sichtbar als Pfade):**

* `https://platform-iota-swart.vercel.app/nano-banana`
* `https://platform-iota-swart.vercel.app/seedream`
* `https://platform-iota-swart.vercel.app/qwen`
* `https://platform-iota-swart.vercel.app/grok`
* `https://platform-iota-swart.vercel.app/openai`
* `https://platform-iota-swart.vercel.app/wan-2.5`

**Der Clou:** Für den Browser bleibt alles unter **derselben Domain** → Cookie bleibt gültig → Session stabil.

---

## 5. Proxy-Standard (Routing, Cross-App Auth, ENV) — Fixierte Regeln

### 5.1 Platform Rewrites (apps/platform/next.config.js)

**Regel:** Die `destination` darf **nicht** den Modulnamen enthalten, weil das Zielprojekt den Pfad bereits über `basePath` verwaltet.

Beispiel (Template):

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/nano-banana/:path*', destination: 'https://nano-v2-nano-banana.vercel.app/:path*' },
      { source: '/seedream/:path*',    destination: 'https://nano-v2-seedream.vercel.app/:path*' },
      { source: '/qwen/:path*',        destination: 'https://nano-v2-qwen.vercel.app/:path*' },
      { source: '/grok/:path*',        destination: 'https://nano-v2-grok.vercel.app/:path*' },
      { source: '/openai/:path*',      destination: 'https://nano-v2-openai.vercel.app/:path*' },
      { source: '/wan-2.5/:path*',     destination: 'https://nano-v2-wan-2-5.vercel.app/:path*' },
    ]
  },
}

module.exports = nextConfig
```

> **Reihenfolge beim Rollout:** Modul zuerst deployen (URL erhalten), dann Platform‑Rewrite eintragen, dann push.

### 5.2 Modul-Konfiguration (basePath Pflicht)

Jede Modul‑App muss wissen, dass sie unter einem Unterpfad läuft.

Beispiel `apps/nano-banana/next.config.js`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/nano-banana',

  // OPTIONAL: Nur aktivieren, wenn _next Assets über Proxy Probleme machen
  // assetPrefix: '/nano-banana',
}

module.exports = nextConfig
```

Analog:

* `apps/seedream` → `basePath: '/seedream'`
* `apps/qwen` → `basePath: '/qwen'`
* `apps/grok` → `basePath: '/grok'`
* `apps/openai` → `basePath: '/openai'`
* `apps/wan-2.5` → `basePath: '/wan-2.5'`

### 5.3 Modul Middleware (Auth-Schutz)

**Ziel:** Alles im Modul ist geschützt. Wenn keine Session vorhanden ist → immer Redirect zur Platform‑Login‑Route.

Beispiel `apps/nano-banana/middleware.ts`:

```ts
import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "https://platform-iota-swart.vercel.app/api/auth/signin",
  },
})

export const config = {
  // Schützt alles außer API-Routen, Next-Internals und statische Dateien
  matcher: ["/((?!api|_next/|favicon.ico).*)"],
}
```

### 5.4 Eiserne Regel: Auth-Hoheit & /api/auth/*

* **Nur** `apps/platform` hostet:

  * `apps/platform/app/api/auth/[...nextauth]/route.ts`
* Module haben **keine** NextAuth API Routes.
* Module dürfen eigene APIs haben (z. B. `/api/generate`, `/api/history`), aber **niemals** `/api/auth/*`.

---

## 6. Auth-Konzept (Cross-Module via Proxy)

### 6.1 Grundidee

Alle Module erscheinen im Browser unter derselben Domain `platform-iota-swart.vercel.app`. Dadurch teilen sie automatisch denselben Cookie‑Jar.

### 6.2 Cookie-Settings (packages/auth-config)

**Regel:** Cookie gilt für alle Pfade (`path: '/'`) und **ohne `domain`** (wichtig für `*.vercel.app`).

Beispiel (Konzept):

```ts
export const authOptions = {
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // Phase 1: keine domain Angabe!
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
```

### 6.3 Environment Variablen (Auth Pflicht)

**In JEDEM Vercel‑Projekt (platform + alle Module):**

* `NEXTAUTH_URL = https://platform-iota-swart.vercel.app`
* `NEXTAUTH_SECRET = <identisch in allen Projekten>`

**Warum:**

* Session wird unter Platform‑Domain ausgestellt.
* Module müssen den Cookie entschlüsseln können → Secret identisch.
* Redirect‑Welt muss konsistent sein → URL identisch.

---

## 7. Datenbank-Strategie (Hybrid, Phase 1)

### 7.1 Prinzip

* V2 verbindet sich direkt mit V1‑Postgres.
* `packages/database/schema.prisma` spiegelt V1 1:1.
* Änderungen in Phase 1: **nur additiv** (optional + Defaults), **keine Breaking Changes**.

### 7.2 Strikte DB-Regeln

* **Nie** `prisma migrate dev` gegen die Live‑DB.
* Schemaänderungen **nur** in `packages/database/schema.prisma`.
* Neue Felder: **immer optional** (`String?`, `DateTime?` etc.) + sinnvolle Defaults.
* Migrationen: manuell oder **vorsichtig** mit `prisma db push` (nur wenn verstanden und abgesichert).
* PrismaClient: Singleton/global cached, um Vercel‑Connection‑Probleme zu vermeiden.

### 7.3 Module und DB-Abhängigkeit

* **DB Pflicht:** Module, die persistieren (z. B. History, Credits, Jobs, Billing‑Linking).
* **DB optional:** reine UI‑Wrapper, die nur APIs durchreichen (aber langfristig meist trotzdem DB für Logging/Quota sinnvoll).

---

## 8. Setup-Anleitung (lokal, Greenfield)

### 8.1 Repo Initialisierung

```bash
npx create-turbo@latest nano-banana-ecosystem
cd nano-banana-ecosystem

git init
git remote add origin <NEUE_GITHUB_REPO_URL>
```

### 8.2 Turborepo Grundstruktur

* Entferne Demo‑Apps (`apps/web`, `apps/docs`) oder repurpose:

  * `apps/web` → `apps/platform`
* Lege Module in `apps/` an:

  * `nano-banana`, `seedream`, `qwen`, `grok`, `openai`, `wan-2.5`

### 8.3 Shared Packages einrichten

**A) `packages/ui`**

* Tailwind Preset + Komponenten (Button, Card, Input, Layout).
* Export‑API: Apps importieren nur `@repo/ui`.

**B) `packages/database`**

* `schema.prisma` spiegeln (V1).
* `npx prisma generate`
* PrismaClient Singleton Export.

**C) `packages/auth-config`**

* NextAuth Optionen zentral.
* Helper für Session (z. B. `getServerSession` Wrapper).
* Cookie Settings zentral.

---

## 9. Standard-App-Schablone (pro Modul)

Wenn du ein neues Modul anlegst (z. B. `apps/qwen`), brauchst du mindestens:

1. `next.config.js`

* `basePath: '/qwen'`
* optional `assetPrefix`

2. `middleware.ts`

* `withAuth` + Redirect zur Platform SignIn URL
* matcher excludes `/_next/`

3. `app/layout.tsx`

* importiert `@repo/ui` Layout/Styles
* konsistente Navigation/Branding (mindestens Header)

4. `tailwind.config.ts`

* extends preset aus `@repo/ui`

5. optional `app/api/*`

* Feature‑Endpoints (nie `/api/auth/*`)

---

## 10. Apps bauen (Migration)

### 10.1 Platform (apps/platform)

**Inhalt:**

* Dashboard, Billing, User Settings
* zentrale Navigation zu allen Modulen
* **einziger Auth‑Provider** (`/api/auth/[...nextauth]`)

**Pflicht:**

* `app/api/auth/[...nextauth]/route.ts` nutzt `@repo/auth-config`

### 10.2 Module (apps/nano-banana, apps/seedream, apps/qwen, apps/grok, apps/openai, apps/wan-2.5)

**Pflicht je Modul:**

* `basePath` korrekt
* `middleware.ts` korrekt
* ggf. DB Zugriff über `@repo/database`
* UI Komponenten via `@repo/ui`

---

## 11. Deployment Strategie (Vercel)

### 11.1 Single Repo, Multi Projects

* **Ein GitHub Repo**.
* **Mehrere Vercel Projekte**, jedes Projekt zeigt auf denselben Repo, aber mit eigenem Root Directory.

Beispiel:

* Projekt: `nano-v2-platform` → Root: `apps/platform`
* Projekt: `nano-v2-nano-banana` → Root: `apps/nano-banana`
* Projekt: `nano-v2-seedream` → Root: `apps/seedream`
* Projekt: `nano-v2-qwen` → Root: `apps/qwen`
* Projekt: `nano-v2-grok` → Root: `apps/grok`
* Projekt: `nano-v2-openai` → Root: `apps/openai`
* Projekt: `nano-v2-wan-2-5` → Root: `apps/wan-2.5`

### 11.2 Build Commands (pro Projekt)

Empfohlenes Pattern:

* `cd ../.. && npx turbo run build --filter=<appname>`

Beispiele:

* Platform: `--filter=platform`
* Nano Banana: `--filter=nano-banana`
* Seedream: `--filter=seedream`
* Wan: `--filter=wan-2.5` (abhängig vom tatsächlichen package/app name)

### 11.3 ENV Variablen (Pflicht)

**In jedem Projekt:**

* `NEXTAUTH_URL = https://platform-iota-swart.vercel.app`
* `NEXTAUTH_SECRET = <identisch überall>`

**Nur wo benötigt:**

* `DATABASE_URL = <V1 Postgres Connection>`

### 11.4 Deploy-Reihenfolge (wegen Rewrites)

1. Modul deployen → Vercel URL entsteht (z. B. `https://nano-v2-seedream.vercel.app`)
2. Platform `rewrites()` destination auf diese URL setzen
3. push → Platform deploy → Pfad routing funktioniert

---

## 12. Entwicklungs-Workflow & Regeln (Strikt)

### 12.1 Single Source of Truth

* DB: `@repo/database`
* Auth: `@repo/auth-config`
* UI/Tailwind: `@repo/ui`

### 12.2 Keine DB-Breaks

* Kein Drop/Rename/Constraint‑Bruch in Phase 1.
* Nur additive, optionale Felder + Defaults.

### 12.3 Ports lokal (optional Standard)

* platform: `3000`
* nano-banana: `3001`
* seedream: `3002`
* qwen: `3003`
* grok: `3004`
* openai: `3005`
* wan-2.5: `3006`

### 12.4 Navigation (UX-Regel)

Links immer als Root‑Pfad (weil Platform alles verteilt):

* `<Link href="/nano-banana">`
* `<Link href="/seedream">`
* `<Link href="/qwen">`
* `<Link href="/grok">`
* `<Link href="/openai">`
* `<Link href="/wan-2.5">`

---

## 13. Nächste Schritte (Checkliste)

1. Repo initialisieren (Greenfield), Turborepo clean.
2. `packages/database` V1 Schema spiegeln + Prisma generate.
3. `apps/platform` Grundgerüst + NextAuth Route.
4. Erstes Modul (`apps/nano-banana`) minimal lauffähig machen (basePath + middleware + UI).
5. Erstes Modul in Vercel deployen → URL.
6. Platform Rewrites eintragen → `/nano-banana` routing testen.
7. Cross‑Module Auth testen:

   * Login in Platform → Zugriff Modul ohne erneuten Login.
8. Nacheinander Module hinzufügen (seedream, qwen, grok, openai, wan-2.5).
9. DB‑Writes erst dann aktivieren, wenn DB‑Regeln/Schema sauber stehen.

---

## 14. Phase 2 (Später, optional) – Eigene Domain

Wenn `nano-banana.app` aktiv ist:

* Cookie kann auf `.nano-banana.app` gesetzt werden.
* Subdomain‑Strategie möglich (z. B. `seedream.nano-banana.app`) **oder** Pfadstrategie bleibt.
* Proxy‑Rewrites können entfallen, wenn alles unter eigener Domain sauber routet.

---

## Kurzfazit: Finales “Wahrheitsmodell”

* **Pfad-/Proxy‑Modell via Rewrites ist Phase‑1 Wahrheit.**
* **Platform ist Gateway + Auth‑Hoheit.**
* **Jedes Modell ist ein eigenes Modul (eigene App, eigenes Vercel Projekt).**
* **Ein GitHub Repo, viele Vercel Projekte.**
* **Cookies ohne domain, NEXTAUTH_URL überall Platform‑Domain, Secret überall identisch.**
