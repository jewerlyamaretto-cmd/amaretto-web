import Link from 'next/link'
import { notFound } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import AddToCartButton from '@/components/AddToCartButton'
import WhatsAppButton from '@/components/WhatsAppButton'
import ProductImage from '@/components/ProductImage'
import { connectToDatabase } from '@/src/lib/db'
import { Product } from '@/src/models/Product'
import { ProductDTO } from '@/src/types/product'

interface ProductoPageProps {
  params: {
    slug: string
  }
}

async function getProductData(slug: string) {
  try {
    await connectToDatabase()
    const product = await Product.findOne({ slug }).lean()
    return product ? (JSON.parse(JSON.stringify(product)) as ProductDTO) : null
  } catch (error) {
    console.error('Error de conexión a MongoDB:', error)
    return null
  }
}

async function getRelated(slug: string) {
  try {
    await connectToDatabase()
    const current = await Product.findOne({ slug }).lean()
    if (!current) return []

    const related = await Product.find({
      slug: { $ne: slug },
      category: current.category,
    })
      .limit(4)
      .lean()

    return JSON.parse(JSON.stringify(related)) as ProductDTO[]
  } catch (error) {
    console.error('Error de conexión a MongoDB:', error)
    return []
  }
}

export default async function ProductoPage({ params }: ProductoPageProps) {
  const product = await getProductData(params.slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelated(params.slug)

  return (
    <div className="min-h-screen bg-amaretto-white">
      {/* Breadcrumb */}
      <section className="bg-amaretto-beige py-4 border-b border-amaretto-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm font-sans text-amaretto-black/60">
            <Link href="/" className="hover:text-amaretto-pink transition-colors duration-200">
              Inicio
            </Link>
            <span>/</span>
            <Link href="/coleccion" className="hover:text-amaretto-pink transition-colors duration-200">
              Colección
            </Link>
            <span>/</span>
            <Link href={`/coleccion?categoria=${product.category.toLowerCase()}`} className="hover:text-amaretto-pink transition-colors duration-200">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-amaretto-black">{product.name}</span>
          </nav>
        </div>
      </section>

      {/* Información del producto */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Imágenes */}
            <div className="space-y-4">
              {/* Imagen principal */}
              <div className="relative w-full h-96 bg-amaretto-beige rounded-lg overflow-hidden">
                {product.images && product.images[0] ? (
                  <ProductImage
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-96"
                    fallback="Imagen principal"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-amaretto-black/30 font-sans text-sm">
                    Imagen principal
                  </div>
                )}
              </div>
              
              {/* Miniaturas */}
              <div className="grid grid-cols-3 gap-4">
                {product.images && product.images.length > 1 ? (
                  product.images.slice(1, 4).map((image, index) => (
                    <div
                      key={index}
                      className="relative w-full h-24 bg-amaretto-gray-light rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity duration-200"
                    >
                      <ProductImage
                        src={image}
                        alt={`${product.name} - Vista ${index + 2}`}
                        className="w-full h-24"
                        fallback="Imagen"
                      />
                    </div>
                  ))
                ) : null}
              </div>
            </div>

            {/* Información */}
            <div className="space-y-6">
              {/* Categoría y Badge NEW */}
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-sm text-amaretto-black/60 font-sans uppercase tracking-wide">
                  {product.category}
                </p>
                {product.isNew && (
                  <span className="bg-amaretto-pink text-white px-3 py-1 rounded-full text-xs font-sans font-bold">
                    NEW
                  </span>
                )}
              </div>

              {/* Nombre */}
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-amaretto-black">
                {product.name}
              </h1>

              {/* Precio */}
              <div className="flex items-center gap-3 flex-wrap">
                {product.isOnSale && product.originalPrice ? (
                  <>
                    <span className="line-through text-amaretto-black/40 text-xl">
                      ${product.originalPrice.toLocaleString('es-MX')}
                    </span>
                    <span className="text-3xl font-sans font-bold text-amaretto-pink">
                      ${product.price.toLocaleString('es-MX')} MXN
                    </span>
                    <span className="text-sm bg-amaretto-pink/20 text-amaretto-pink px-3 py-1 rounded font-medium">
                      OFERTA
                    </span>
                  </>
                ) : (
                  <p className="text-3xl font-sans font-bold text-amaretto-black">
                    ${product.price.toLocaleString('es-MX')} MXN
                  </p>
                )}
              </div>

              {/* Estado de stock */}
              <div className="flex items-center gap-2">
                {product.stock > 0 ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <p className="text-sm font-sans text-amaretto-black">
                      En stock ({product.stock} disponibles)
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <p className="text-sm font-sans text-amaretto-black">
                      Agotado
                    </p>
                  </>
                )}
              </div>

              {/* Descripción */}
              <div className="pt-4 border-t border-amaretto-gray-light">
                <h2 className="font-serif text-xl font-bold text-amaretto-black mb-3">
                  Descripción
                </h2>
                <p className="text-amaretto-black/70 font-sans leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Detalles técnicos */}
              <div className="pt-4 border-t border-amaretto-gray-light">
                <h2 className="font-serif text-xl font-bold text-amaretto-black mb-4">
                  Detalles técnicos
                </h2>
                <dl className="space-y-3 font-sans">
                  <div className="flex justify-between">
                    <dt className="text-amaretto-black/60 font-medium">Material:</dt>
                    <dd className="text-amaretto-black">{product.material}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-amaretto-black/60 font-medium">Medidas:</dt>
                    <dd className="text-amaretto-black">{product.medidas}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-amaretto-black/60 font-medium">Tipo de cierre:</dt>
                    <dd className="text-amaretto-black">{product.cierre}</dd>
                  </div>
                </dl>
              </div>

              {/* Botones de acción */}
              <div className="pt-6 space-y-4">
                {product.stock > 0 ? (
                  <>
                    <AddToCartButton product={product} />
                    <WhatsAppButton
                      message={`Hola, me interesa el producto: ${product.name} - ${product.category}`}
                      className="w-full"
                    >
                      Comprar por WhatsApp
                    </WhatsAppButton>
                  </>
                ) : (
                  <button
                    disabled
                    className="w-full bg-amaretto-gray-light text-amaretto-black/50 font-sans font-medium px-6 py-3 rounded-lg cursor-not-allowed"
                  >
                    Producto agotado
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Productos relacionados */}
      <section className="py-16 bg-amaretto-beige">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-amaretto-black text-center mb-12">
            Productos relacionados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct._id}
                product={relatedProduct}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
