'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

interface LogoProps {
  className?: string
  width?: number
  height?: number
  variant?: 'default' | 'footer'
}

export default function Logo({ className = '', width = 200, height = 60, variant = 'default' }: LogoProps) {
  const [imageError, setImageError] = useState(false)

  if (imageError) {
    // Fallback a texto si la imagen no se carga
    return (
      <Link href="/" className={`flex-shrink-0 ${className}`}>
        <h1 className="font-serif text-2xl font-bold text-amaretto-black">
          amaretto
        </h1>
      </Link>
    )
  }

  return (
    <Link href="/" className={`flex-shrink-0 ${className}`}>
      <div className="relative" style={{ width, height }}>
        <Image
          src="/assets/logo.png"
          alt="Amaretto Jewelry"
          width={width}
          height={height}
          priority
          className="h-auto w-auto object-contain"
          onError={() => setImageError(true)}
        />
      </div>
    </Link>
  )
}

