'use client'

interface ProductImageProps {
  src: string
  alt: string
  className?: string
  fallback?: string
}

export default function ProductImage({ src, alt, className = '', fallback = 'Imagen no disponible' }: ProductImageProps) {
  return (
    <div className={`relative ${className}`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
          const parent = e.currentTarget.parentElement
          if (parent) {
            parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-amaretto-black/30 font-sans text-sm">${fallback}</div>`
          }
        }}
      />
    </div>
  )
}

