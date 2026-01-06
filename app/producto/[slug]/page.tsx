import Link from 'next/link'
import { notFound } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import AddToCartButton from '@/components/AddToCartButton'
import WhatsAppButton from '@/components/WhatsAppButton'
import ProductImage from '@/components/ProductImage'
import { connectToDatabase } from '@/src/lib/db'
import { Product } from '@/src/models/Product'
import { ProductDTO } from '@/src/types/product'

export const dynamic = 'force-dynamic'

interface ProductoPageProps {
  params: Promise<{
    slug: string
  }> | {
    slug: string
  }
}

async function getProductData(slug: string) {
  try {
    await connectToDatabase()
    
    // Limpiar y normalizar el slug
    const cleanSlug = slug.trim()
    if (!cleanSlug) {
      return null
    }
    
    // Intentar buscar con el slug tal cual
    let product = await Product.findOne({ slug: cleanSlug }).lean()
    
    // Si no se encuentra, intentar con el slug decodificado
    if (!product) {
      try {
        const decodedSlug = decodeURIComponent(cleanSlug)
        if (decodedSlug !== cleanSlug) {
          product = await Product.findOne({ slug: decodedSlug }).lean()
        }
      } catch (e) {
        // Si falla la decodificación, continuar
      }
    }
    
    // Si aún no se encuentra, intentar buscar sin case sensitive (solo si el slug no tiene caracteres especiales)
    if (!product && /^[a-z0-9-]+$/i.test(cleanSlug)) {
      try {
        product = await Product.findOne({ 
          slug: { $regex: new RegExp(`^${cleanSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } 
        }).lean()
      } catch (e) {
        // Si falla la búsqueda regex, continuar
      }
    }
    
    if (!product) {
      return null
    }
    
    // Validar que el producto tenga los campos mínimos necesarios
    if (!product.name || product.price === undefined) {
      console.error('Producto encontrado pero con datos incompletos:', product._id)
      return null
    }
    
    return JSON.parse(JSON.stringify(product)) as ProductDTO
  } catch (error) {
    console.error('Error al obtener producto:', error)
    return null
  }
}

async function getRelated(slug: string, category?: string) {
  try {
    if (!category) {
      return []
    }
    
    await connectToDatabase()
    const related = await Product.find({
      slug: { $ne: slug },
      category: category,
      stock: { $gt: 0 }, // Solo productos con stock
    })
      .limit(4)
      .lean()

    return JSON.parse(JSON.stringify(related)) as ProductDTO[]
  } catch (error) {
    console.error('Error al obtener productos relacionados:', error)
    return []
  }
}

export default async function ProductoPage({ params }: ProductoPageProps) {
  try {
    // Manejar params como Promise (Next.js 15) o objeto directo
    const resolvedParams = params instanceof Promise ? await params : params
    
    // Validar que params tenga slug
    if (!resolvedParams || !resolvedParams.slug) {
      console.error('Slug no proporcionado en params')
      notFound()
    }
    
    // Decodificar el slug en caso de que tenga caracteres especiales
    let slug: string
    try {
      slug = decodeURIComponent(resolvedParams.slug)
    } catch {
      slug = resolvedParams.slug
    }
    
    // Validar que el slug no esté vacío
    if (!slug || slug.trim() === '') {
      console.error('Slug vacío')
      notFound()
    }
    
    const product = await getProductData(slug)

    if (!product) {
      console.error('Producto no encontrado para slug:', slug)
      notFound()
    }

    // Validar que el producto tenga los campos mínimos
    if (!product.name) {
      console.error('Producto sin nombre:', product._id)
      notFound()
    }

    const relatedProducts = await getRelated(slug, product.category || undefined)

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
            {product.category && (
              <>
                <Link href={`/coleccion?categoria=${encodeURIComponent(product.category.toLowerCase())}`} className="hover:text-amaretto-pink transition-colors duration-200">
                  {product.category}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-amaretto-black">{product.name || 'Producto'}</span>
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
                {product.category && (
                  <p className="text-sm text-amaretto-black/60 font-sans uppercase tracking-wide">
                    {product.category}
                  </p>
                )}
                {product.isNew && (
                  <span className="bg-amaretto-pink text-white px-3 py-1 rounded-full text-xs font-sans font-bold">
                    NEW
                  </span>
                )}
              </div>

              {/* Nombre */}
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-amaretto-black">
                {product.name || 'Producto sin nombre'}
              </h1>

              {/* Precio */}
              {product.price !== undefined && (
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
              )}

              {/* Estado de stock */}
              <div className="flex items-center gap-2">
                {(product.stock ?? 0) > 0 ? (
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
              {product.description && (
                <div className="pt-4 border-t border-amaretto-gray-light">
                  <h2 className="font-serif text-xl font-bold text-amaretto-black mb-3">
                    Descripción
                  </h2>
                  <p className="text-amaretto-black/70 font-sans leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Detalles técnicos */}
              {(product.material || product.medidas || product.cierre) && (
                <div className="pt-4 border-t border-amaretto-gray-light">
                  <h2 className="font-serif text-xl font-bold text-amaretto-black mb-4">
                    Detalles técnicos
                  </h2>
                  <dl className="space-y-3 font-sans">
                    {product.material && (
                      <div className="flex justify-between">
                        <dt className="text-amaretto-black/60 font-medium">Material:</dt>
                        <dd className="text-amaretto-black">{product.material}</dd>
                      </div>
                    )}
                    {product.medidas && (
                      <div className="flex justify-between">
                        <dt className="text-amaretto-black/60 font-medium">Medidas:</dt>
                        <dd className="text-amaretto-black">{product.medidas}</dd>
                      </div>
                    )}
                    {product.cierre && (
                      <div className="flex justify-between">
                        <dt className="text-amaretto-black/60 font-medium">Tipo de cierre:</dt>
                        <dd className="text-amaretto-black">{product.cierre}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {/* Botones de acción */}
              <div className="pt-6 space-y-4">
                {(product.stock ?? 0) > 0 && product.price !== undefined ? (
                  <>
                    <AddToCartButton product={product} />
                    <WhatsAppButton
                      message={`Hola, me interesa el producto: ${product.name || 'Producto'} - ${product.category || 'Producto'}`}
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
                    {product.price === undefined ? 'Producto no disponible' : 'Producto agotado'}
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
  } catch (error) {
    console.error('Error en ProductoPage:', error)
    // En caso de error, mostrar página 404
    notFound()
  }
}
