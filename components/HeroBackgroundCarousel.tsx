'use client'

import { useEffect, useState } from 'react'
import { ProductDTO } from '@/src/types/product'

interface HeroBackgroundCarouselProps {
  products: ProductDTO[]
}

export default function HeroBackgroundCarousel({ products }: HeroBackgroundCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fade, setFade] = useState(true)

  // Filtrar productos que tengan al menos una imagen
  const productsWithImages = products.filter(
    (product) => product.images && product.images.length > 0 && product.images[0]
  )

  useEffect(() => {
    // Si no hay productos o solo hay uno, no rotar
    if (productsWithImages.length <= 1) return

    const interval = setInterval(() => {
      // Fade out
      setFade(false)
      
      // Después de la transición, cambiar de imagen y fade in
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % productsWithImages.length)
        setFade(true)
      }, 500) // Tiempo de transición (debe coincidir con duration-500)
    }, 5000) // Cambiar cada 5 segundos

    return () => clearInterval(interval)
  }, [productsWithImages.length])

  // Si no hay productos con imágenes, mostrar fondo neutro
  if (productsWithImages.length === 0) {
    return (
      <div className="absolute inset-0 bg-amaretto-beige">
        <div className="absolute inset-0 bg-black/10" />
      </div>
    )
  }

  const currentImage = productsWithImages[currentIndex].images[0]

  return (
    <>
      {/* Imagen de fondo con transición fade */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 ease-in-out ${
          fade ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundImage: `url(${currentImage})`,
        }}
      >
        {/* Overlay oscuro para mejorar legibilidad del texto */}
        <div className="absolute inset-0 bg-black/40" />
      </div>
      
      {/* Indicadores de productos (si hay más de uno) */}
      {productsWithImages.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {productsWithImages.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setFade(false)
                setTimeout(() => {
                  setCurrentIndex(index)
                  setFade(true)
                }, 300)
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/70 w-2'
              }`}
              aria-label={`Ver producto ${index + 1}`}
            />
          ))}
        </div>
      )}
    </>
  )
}

