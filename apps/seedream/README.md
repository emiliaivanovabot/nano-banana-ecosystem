# Seedream - AI Image Generation App

Seedream is an AI-powered image generation application built with Next.js 15, leveraging OpenAI and Stability AI APIs to create stunning images from text prompts.

## Features

- 🎨 **AI Image Generation** - Create images using advanced AI models
- 🖼️ **Gallery Management** - View and manage your generated images
- 🔐 **Authentication** - Secure user accounts with Supabase Auth
- 💳 **Subscription Tiers** - Free and premium plans with credit systems
- 📱 **Mobile Responsive** - Optimized for all devices
- 🎯 **Style Presets** - Multiple artistic styles available

## Tech Stack

- **Frontend**: Next.js 15 App Router, React 19, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **AI Services**: OpenAI DALL-E, Stability AI
- **Package Management**: pnpm (Turborepo monorepo)

## Shared Packages

Seedream leverages the following shared packages:

- `@repo/ui` - Shared UI components
- `@repo/auth-config` - Authentication configuration and contexts
- `@repo/database` - Database client and type definitions
- `@repo/constants` - Shared constants and configurations

## Getting Started

### Prerequisites

1. Node.js 18+
2. pnpm package manager
3. Supabase account and project
4. OpenAI API key
5. Stability AI API key (optional)

### Environment Setup

1. Copy the environment example file:
   ```bash
   cp .env.example .env.local
   ```

2. Configure your environment variables:
   ```env
   # Database Configuration
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # AI Service Configuration
   OPENAI_API_KEY=your_openai_api_key
   STABILITY_AI_API_KEY=your_stability_ai_api_key

   # Authentication
   JWT_SECRET=your_jwt_secret_key

   # File Storage
   SUPABASE_STORAGE_BUCKET=seedream-images
   ```

### Installation

From the monorepo root:

```bash
# Install dependencies
pnpm install

# Start Seedream development server
pnpm run dev --filter=seedream

# Or start all apps
pnpm run dev:all
```

The app will be available at http://localhost:3001

### Database Setup

The database schema is defined in the shared `@repo/database` package. Ensure your Supabase database has the following tables:

1. **users** - User profiles and subscription information
2. **seedream_generations** - Generated image records
3. **subscriptions** - User subscription tiers
4. **billing_events** - Billing and usage tracking

## API Endpoints

### Image Generation

- `POST /api/generate-image` - Generate new image from prompt
- `GET /api/user-images` - Fetch user's generated images

## Usage

1. **Sign Up/Sign In** - Create account or sign in
2. **Generate Images** - Enter text prompt and select style
3. **View Gallery** - Browse your generated images
4. **Download Images** - Save images locally

## Architecture

Seedream follows a modular architecture:

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── generate/          # Image generation page
│   ├── gallery/           # Image gallery page
│   ├── login/             # Authentication pages
│   └── register/
├── components/            # Page-specific components
└── lib/                   # Utilities and configurations
```

## Development

### Type Checking

```bash
pnpm run check-types --filter=seedream
```

### Linting

```bash
pnpm run lint --filter=seedream
```

### Building

```bash
pnpm run build --filter=seedream
```

## Integration with Monorepo

Seedream is part of the nano-banana-ecosystem monorepo and shares:

- Authentication flow with other apps
- Database schema and types
- UI components and styling
- Build and deployment configurations

## Deployment

Seedream can be deployed individually or as part of the monorepo:

1. **Environment Variables** - Configure production environment
2. **Database Migrations** - Apply Supabase migrations
3. **Build** - `pnpm run build --filter=seedream`
4. **Deploy** - Deploy to Vercel, Netlify, or any Node.js hosting

## Contributing

1. Follow the monorepo development guidelines
2. Use shared packages for common functionality
3. Maintain TypeScript strict mode compliance
4. Write comprehensive tests for new features

## Support

For technical issues or feature requests, please refer to the main monorepo documentation or create an issue in the project repository.