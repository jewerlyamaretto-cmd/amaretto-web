'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ProductImage from './ProductImage'
import { ProductDTO } from '@/src/types/product'

interface HeroProductCarouselProps {
  products: ProductDTO[]
}

export default function HeroProductCarousel({ products }: HeroProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // Si solo hay un producto, no rotar
    if (products.length <= 1) return

    // Rotar cada 5 segundos
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [products.length])

  if (products.length === 0) {
    return (
      <div className="relative w-full h-96 bg-amaretto-beige rounded-lg flex items-center justify-center">
        <p className="text-amaretto-black/30 font-sans text-sm">
          No hay productos disponibles
        </p>
      </div>
    )
  }

  const currentProduct = products[currentIndex]

  return (
    <div className="relative w-full h-96 bg-amaretto-beige rounded-lg overflow-hidden">
      {currentProduct.images && currentProduct.images[0] ? (
        <Link 
          href={`/producto/${currentProduct.slug}`} 
          className="block w-full h-full group"
        >
          <div className="w-full h-96 bg-amaretto-beige">
            <img
              src={currentProduct.images[0]}
              alt={currentProduct.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                const parent = e.currentTarget.parentElement
                if (parent) {
                  parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-amaretto-black/30 font-sans text-sm">Imagen no disponible</div>'
                }
              }}
            />
          </div>
          {/* Overlay con información del producto */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 font-sans text-sm uppercase tracking-wide mb-1">
                  {currentProduct.category}
                </p>
                <h3 className="text-white font-serif text-2xl font-bold mb-2">
                  {currentProduct.name}
                </h3>
                <p className="text-white font-sans text-lg font-semibold">
                  ${currentProduct.price?.toLocaleString('es-MX')} MXN
                </p>
              </div>
              {currentProduct.isNew && (
                <span className="bg-amaretto-pink text-white px-4 py-2 rounded-full text-sm font-sans font-bold">
                  NEW
                </span>
              )}
            </div>
          </div>
          
          {/* Indicadores de productos (si hay más de uno) */}
          {products.length > 1 && (
            <div className="absolute top-4 right-4 flex gap-2">
              {products.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentIndex(index)
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-amaretto-pink w-6'
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Ver producto ${index + 1}`}
                />
              ))}
            </div>
          )}
        </Link>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-amaretto-black/30 font-sans text-sm">
          Imagen no disponible
        </div>
      )}
    </div>
  )
}

