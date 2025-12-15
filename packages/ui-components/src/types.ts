// Type definitions for all UI components

export interface ImageModalProps {
  selectedImage: {
    id: string
    result_image_url: string
    prompt?: string
    created_at: string
    generation_type?: string
    username?: string
  } | null
  onClose: () => void
  title: string
  showUsername?: boolean
}

export interface BackButtonProps {
  href: string
  text?: string
  className?: string
}

export interface PageHeaderProps {
  title: string
  subtitle?: string
  backButtonHref?: string
  backButtonText?: string
  className?: string
  children?: React.ReactNode
}