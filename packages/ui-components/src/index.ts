// Main exports for @nano-banana/ui-components

// Import all CSS styles (will be copied to dist/styles)
import './styles/shared-modal.css'
import './styles/shared-buttons.css'
import './styles/shared-typography.css'
import './styles/shared-backgrounds.css'
import './styles/shared-layout.css'
import './styles/shared-badges.css'
import './styles/shared-charts.css'

export { default as ImageModal } from './components/ImageModal'
export { default as BackButton } from './components/BackButton'
export { default as PageHeader } from './components/PageHeader'

export type { 
  ImageModalProps,
  BackButtonProps, 
  PageHeaderProps 
} from './types'