'use client'

import React from 'react'
import BackButton from './BackButton'
import '../styles/shared-modal.css'

interface PageHeaderProps {
  title: string
  subtitle?: string
  backButtonHref?: string
  backButtonText?: string
  className?: string
  children?: React.ReactNode
}

export default function PageHeader({
  title,
  subtitle,
  backButtonHref,
  backButtonText = "← Zurück",
  className = "",
  children
}: PageHeaderProps) {
  return (
    <div className={`inspiration-header ${className}`}>
      <div className="header-content">
        {backButtonHref && (
          <BackButton href={backButtonHref} text={backButtonText} />
        )}
        <div className="title-section">
          <h1>{title}</h1>
          {subtitle && <p className="subtitle">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  )
}