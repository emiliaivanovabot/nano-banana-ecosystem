'use client'

import React from 'react'
import '../styles/shared-modal.css'

interface BackButtonProps {
  href: string
  text?: string
  className?: string
}

export default function BackButton({ 
  href, 
  text = "← Zurück", 
  className = "" 
}: BackButtonProps) {
  return (
    <a 
      href={href} 
      className={`back-link ${className}`}
    >
      {text}
    </a>
  )
}