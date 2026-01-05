'use client'

import Link from 'next/link'
import { ProductDTO } from '@/src/types/product'

interface CollectionCardProps {
  name: string
  description: string
  image: string
  href: string
  product?: ProductDTO | null
}

export default function CollectionCard({ name, description, image, href, product }: CollectionCardProps) {
  // Si hay un producto destacado, usar su imagen y link
  const productImage = product?.images && product.images.length > 0 ? product.images[0] : null
  const productHref = product ? `/producto/${product.slug}` : href
  const displayName = product ? product.name : name
  const displayDescription = product ? product.description : description
  const categoryName = name // El nombre de la colección es la categoría

  return (
    <Link href={productHref} className="group">
      <div className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 h-full border border-amaretto-gray-light">
        {/* Imagen del producto o placeholder */}
        <div className="relative w-full h-64 bg-white flex items-center justify-center overflow-hidden">
          {productImage ? (
            <>
              <img
                src={productImage}
                alt={displayName}
                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const parent = e.currentTarget.parentElement
                  if (parent) {
                    const errorDiv = parent.querySelector('.error-placeholder')
                    if (errorDiv) {
                      errorDiv.classList.remove('hidden')
                    }
                  }
                }}
              />
              {/* Badge de categoría sobre la imagen */}
              <div className="absolute top-3 left-3 bg-amaretto-black/80 text-white px-3 py-1 rounded-full text-xs font-sans font-bold uppercase">
                {categoryName}
              </div>
              {product?.isNew && (
                <span className="absolute top-3 right-3 bg-amaretto-pink text-white px-2 py-1 rounded-full text-xs font-sans font-bold">
                  NEW
                </span>
              )}
              {/* Placeholder de error (oculto por defecto) */}
              <div className="error-placeholder hidden absolute inset-0 flex items-center justify-center bg-amaretto-gray-light">
                <div className="text-amaretto-black/30 font-sans text-sm text-center">
                  <p>Imagen no disponible</p>
                  <p className="text-xs mt-1">{categoryName}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="text-amaretto-black/30 font-sans text-4xl mb-2">📿</div>
              <div className="text-amaretto-black/50 font-sans text-sm font-medium uppercase">
                {categoryName}
              </div>
              <div className="text-amaretto-black/30 font-sans text-xs mt-1">
                Selecciona un producto destacado
              </div>
            </div>
          )}
        </div>
        
        {/* Información */}
        <div className="p-6 bg-amaretto-beige">
          <h3 className="font-serif text-xl font-bold text-amaretto-black mb-2 group-hover:text-amaretto-pink transition-colors duration-200">
            {displayName}
          </h3>
          <p className="text-sm text-amaretto-black/70 font-sans line-clamp-2 mb-3">
            {displayDescription}
          </p>
          {product && product.price ? (
            <p className="text-amaretto-pink font-sans font-semibold text-lg">
              ${product.price.toLocaleString('es-MX')} MXN
            </p>
          ) : (
            <p className="text-amaretto-black/50 font-sans text-sm italic">
              Ver colección →
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}


