# @nano-banana/ui-components

Shared UI components and design system for the nano-banana ecosystem.

## Installation

```bash
npm install @nano-banana/ui-components
```

## Components

### ImageModal
Full-featured image modal with pan/zoom functionality, prompt copying, and fullscreen mode.

```tsx
import { ImageModal } from '@nano-banana/ui-components'

<ImageModal
  selectedImage={image}
  onClose={handleClose}
  title="Gallery"
  showUsername={true}
/>
```

### BackButton
Standardized back navigation button.

```tsx
import { BackButton } from '@nano-banana/ui-components'

<BackButton href="/dashboard" text="← Zurück zum Dashboard" />
```

### PageHeader
Standard page header with title, subtitle, and optional back button.

```tsx
import { PageHeader } from '@nano-banana/ui-components'

<PageHeader
  title="Community Inspiration"
  subtitle="Entdecke kreative Kunstwerke"
  backButtonHref="/dashboard"
/>
```

## Design System

This package provides the single source of truth for:
- Modal styles and behavior
- Button colors and interactions
- Typography and spacing
- Header layouts
- Dark mode support

**IMPORTANT**: Never override these styles in your apps. All colors and designs are fixed to maintain consistency across the entire nano-banana ecosystem.