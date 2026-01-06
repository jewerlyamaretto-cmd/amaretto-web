'use client'

import Link from 'next/link'
import { ProductDTO } from '@/src/types/product'

interface ProductCardProps {
  product: ProductDTO
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/producto/${product.slug}`} className="group">
      <div className="bg-amaretto-white border border-amaretto-gray-light rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {/* Imagen del producto */}
        <div className="relative w-full h-64 bg-amaretto-beige overflow-hidden">
          {product.isNew && (
            <div className="absolute top-2 right-2 z-10 bg-amaretto-pink text-white px-3 py-1 rounded-full text-xs font-sans font-bold shadow-lg">
              NEW
            </div>
          )}
          {product.images && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                const parent = e.currentTarget.parentElement
                if (parent) {
                  parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-amaretto-black/30 font-sans text-sm">Imagen no disponible</div>'
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-amaretto-black/30 font-sans text-sm">
              Imagen
            </div>
          )}
        </div>
        
        {/* Información del producto */}
        <div className="p-4">
          <p className="text-xs text-amaretto-black/60 font-sans uppercase tracking-wide mb-1">
            {product.category}
          </p>
          <h3 className="font-serif text-lg font-semibold text-amaretto-black mb-2 group-hover:text-amaretto-pink transition-colors duration-200">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            {product.isOnSale && product.originalPrice ? (
              <>
                <span className="line-through text-amaretto-black/40 text-sm">
                  ${product.originalPrice.toLocaleString('es-MX')}
                </span>
                <span className="text-amaretto-pink font-bold text-lg">
                  ${product.price.toLocaleString('es-MX')} MXN
                </span>
                <span className="text-xs bg-amaretto-pink/20 text-amaretto-pink px-2 py-0.5 rounded font-medium">
                  OFERTA
                </span>
              </>
            ) : (
              <p className="text-amaretto-black font-sans font-medium">
                ${product.price.toLocaleString('es-MX')} MXN
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

