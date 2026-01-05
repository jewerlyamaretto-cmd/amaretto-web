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

  return (
    <Link href={productHref} className="group">
      <div className="bg-amaretto-beige rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
        {/* Imagen del producto o placeholder */}
        <div className="relative w-full h-48 bg-amaretto-gray-light flex items-center justify-center overflow-hidden">
          {productImage ? (
            <img
              src={productImage}
              alt={displayName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                const parent = e.currentTarget.parentElement
                if (parent) {
                  parent.innerHTML = '<div class="text-amaretto-black/30 font-sans text-sm">Imagen no disponible</div>'
                }
              }}
            />
          ) : (
            <div className="text-amaretto-black/30 font-sans text-sm">
              {image || 'Imagen'}
            </div>
          )}
          {product?.isNew && (
            <span className="absolute top-2 right-2 bg-amaretto-pink text-white px-2 py-1 rounded-full text-xs font-sans font-bold">
              NEW
            </span>
          )}
        </div>
        
        {/* Información */}
        <div className="p-6">
          <h3 className="font-serif text-xl font-bold text-amaretto-black mb-2 group-hover:text-amaretto-pink transition-colors duration-200">
            {displayName}
          </h3>
          <p className="text-sm text-amaretto-black/70 font-sans line-clamp-2">
            {displayDescription}
          </p>
          {product && product.price && (
            <p className="text-amaretto-pink font-sans font-semibold mt-2">
              ${product.price.toLocaleString('es-MX')} MXN
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}


