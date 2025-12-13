# Turborepo starter

This Turborepo starter is maintained by the Turborepo core team.

## Using this example

Run the following command:

```sh
npx create-turbo@latest
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org/) app
- `web`: another [Next.js](https://nextjs.org/) app
- `@repo/ui`: a stub React component library shared by both `web` and `docs` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build
yarn dlx turbo build
pnpm exec turbo build
```

You can build a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build --filter=docs

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build --filter=docs
yarn exec turbo build --filter=docs
pnpm exec turbo build --filter=docs
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev
yarn exec turbo dev
pnpm exec turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev --filter=web

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev --filter=web
yarn exec turbo dev --filter=web
pnpm exec turbo dev --filter=web
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo login

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo login
yarn exec turbo login
pnpm exec turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo link

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo link
yarn exec turbo link
pnpm exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)


🛠️ Schritt-für-Schritt-Plan für die V2-Dokumentation & Datenbank1. Überprüfung der V2-Dokumentation (Datenbank-Fokus)Ihre erste Aufgabe ist eine kurze Kontrolle der V2-Dokumentation.FrageHintergrundIhre AktionWurde die Tabellenstruktur bedacht?In der Regel MUSS ein "Design-First"-Ansatz die Datenbankstruktur festlegen (Datenmodelle, Beziehungen).Prüfen Sie: Gibt es einen Abschnitt wie Datenmodell, Schema, Entitätsbeziehungen oder Database Schema?Ist die Struktur dort erwähnt?War es ein reiner Architektur-Umbau (von Monolith zu Micro-Services) oder auch eine Datenbank-Migration/Änderung?Vergleichen Sie: Stimmt das gewünschte V2-Schema in der Doku mit dem Schema, das Sie im neuen Projekt (packages/database) anlegen werden?📌 Wichtig: Wenn die V2-Doku eine neue, verbesserte Datenbankstruktur vorsieht, ist dies der Zeitpunkt, sie im neuen V2-Projekt umzusetzen. Wenn die Doku sagt, die DB-Struktur bleibt wie in V1, dann ist das so.2. Die Umsetzung im neuen V2-ProjektDer V2-Umbau wird höchstwahrscheinlich mit einem Tool wie Prisma (oder einem ähnlichen ORM) umgesetzt.Implementierung des V2-Schemas: Sie definieren die Tabellenstruktur exakt nach der V2-Doku in der Schema-Datei (schema.prisma oder Ähnliches) in Ihrem neuen packages/database Ordner.Keine Migration (noch): Sie legen das Schema an, aber Sie wenden es noch nicht auf die Produktiv-Datenbank von V1 an!3. Der Übergang (Datenmigration)Dies ist der kritischste und riskanteste Schritt. Es gibt zwei Wege:A. Der "Clean-Cut" (Empfohlen, falls möglich)Sie erstellen eine komplett neue, leere V2-Datenbank.Vorteil: Die V1-Datenbank bleibt unangetastet, falls Sie zurückrollen müssen.Nachteil: Sie müssen die Daten aus der V1-DB exportieren, nach der V2-Struktur transformieren und in die V2-DB importieren. Dies erfordert oft ein separates Skript.B. Die "In-Place" Migration (Riskant)Sie passen die bestehende V1-Produktiv-Datenbank mit Migrations-Tools (z.B. prisma migrate) an die V2-Struktur an.Vorteil: Die Daten sind sofort an Ort und Stelle.Nachteil: Sehr hohes Risiko. Wenn die Migration fehlschlägt, ist die V1-Anwendung kaputt. V1-Code kann danach evtl. nicht mehr mit dem neuen Schema arbeiten.