import Link from 'next/link'
import { notFound } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import AddToCartButton from '@/components/AddToCartButton'
import WhatsAppButton from '@/components/WhatsAppButton'
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

/**
 * Obtiene un producto por su slug
 * Retorna null si no se encuentra o hay un error
 */
async function getProductData(slug: string): Promise<ProductDTO | null> {
  try {
    // Validar slug
    if (!slug || typeof slug !== 'string') {
      return null
    }

    const cleanSlug = slug.trim()
    if (!cleanSlug) {
      return null
    }

    // Conectar a la base de datos
    await connectToDatabase()

    // Buscar producto por slug exacto (búsqueda principal)
    let product = await Product.findOne({ slug: cleanSlug }).lean()

    // Si no se encuentra, intentar con slug decodificado
    if (!product) {
      try {
        const decodedSlug = decodeURIComponent(cleanSlug)
        if (decodedSlug !== cleanSlug) {
          product = await Product.findOne({ slug: decodedSlug }).lean()
        }
      } catch (decodeError) {
        // Ignorar errores de decodificación
      }
    }

    // Si aún no se encuentra, retornar null (no hacer más búsquedas para evitar problemas)
    if (!product) {
      return null
    }

    // Validar que el producto tenga datos mínimos
    if (!product.name || product.price === undefined || product.price === null) {
      return null
    }

    // Convertir a DTO de forma segura
    try {
      const productDto: ProductDTO = {
        _id: product._id?.toString() || '',
        name: product.name || '',
        slug: product.slug || cleanSlug,
        description: product.description || '',
        price: typeof product.price === 'number' ? product.price : 0,
        originalPrice: typeof product.originalPrice === 'number' ? product.originalPrice : undefined,
        discountPrice: typeof product.discountPrice === 'number' ? product.discountPrice : undefined,
        isOnSale: Boolean(product.isOnSale),
        category: product.category || 'Anillos',
        tags: Array.isArray(product.tags) ? product.tags : [],
        images: Array.isArray(product.images) ? product.images.filter((img): img is string => typeof img === 'string' && img.length > 0) : [],
        stock: typeof product.stock === 'number' ? product.stock : 0,
        material: typeof product.material === 'string' ? product.material : '',
        medidas: typeof product.medidas === 'string' ? product.medidas : '',
        cierre: typeof product.cierre === 'string' ? product.cierre : '',
        featured: Boolean(product.featured),
        isNew: Boolean(product.isNew),
      }

      return productDto
    } catch (parseError) {
      console.error('Error al convertir producto a DTO:', parseError)
      return null
    }
  } catch (error) {
    // Capturar todos los errores y retornar null en lugar de lanzar
    console.error('Error al obtener producto:', error instanceof Error ? error.message : 'Error desconocido')
    return null
  }
}

/**
 * Obtiene productos relacionados
 * Retorna array vacío si hay error
 */
async function getRelated(slug: string, category?: string): Promise<ProductDTO[]> {
  try {
    if (!category || typeof category !== 'string') {
      return []
    }

    if (!slug || typeof slug !== 'string') {
      return []
    }

    await connectToDatabase()

    const related = await Product.find({
      slug: { $ne: slug },
      category: category,
      stock: { $gt: 0 },
    })
      .limit(4)
      .lean()

    // Convertir a DTOs de forma segura
    const relatedDtos: ProductDTO[] = related
      .filter((p) => p.name && p.price !== undefined && p.price !== null)
      .map((p) => ({
        _id: p._id?.toString() || '',
        name: p.name || '',
        slug: p.slug || '',
        description: p.description || '',
        price: typeof p.price === 'number' ? p.price : 0,
        originalPrice: typeof p.originalPrice === 'number' ? p.originalPrice : undefined,
        discountPrice: typeof p.discountPrice === 'number' ? p.discountPrice : undefined,
        isOnSale: Boolean(p.isOnSale),
        category: p.category || 'Anillos',
        tags: Array.isArray(p.tags) ? p.tags : [],
        images: Array.isArray(p.images) ? p.images.filter((img): img is string => typeof img === 'string' && img.length > 0) : [],
        stock: typeof p.stock === 'number' ? p.stock : 0,
        material: typeof p.material === 'string' ? p.material : '',
        medidas: typeof p.medidas === 'string' ? p.medidas : '',
        cierre: typeof p.cierre === 'string' ? p.cierre : '',
        featured: Boolean(p.featured),
        isNew: Boolean(p.isNew),
      }))

    return relatedDtos
  } catch (error) {
    console.error('Error al obtener productos relacionados:', error instanceof Error ? error.message : 'Error desconocido')
    return []
  }
}

export default async function ProductoPage({ params }: ProductoPageProps) {
  // Resolver params (puede ser Promise en Next.js 15)
  let slug: string

  try {
    const resolvedParams = params instanceof Promise ? await params : params

    if (!resolvedParams || !resolvedParams.slug || typeof resolvedParams.slug !== 'string') {
      notFound()
    }

    // Decodificar slug de forma segura
    try {
      slug = decodeURIComponent(resolvedParams.slug)
    } catch {
      slug = resolvedParams.slug
    }

    // Validar slug
    if (!slug || slug.trim() === '') {
      notFound()
    }
  } catch (error) {
    // Si hay error al procesar params, mostrar 404
    notFound()
  }

  // Obtener producto
  const product = await getProductData(slug)

  // Si no se encuentra el producto, mostrar 404
  if (!product) {
    notFound()
  }

  // Validar datos mínimos del producto
  if (!product.name || product.price === undefined || product.price === null) {
    notFound()
  }

  // Obtener productos relacionados (no crítico, puede fallar sin romper la página)
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
            {product.category && (
              <>
                <span>/</span>
                <Link
                  href={`/coleccion?categoria=${encodeURIComponent(product.category.toLowerCase())}`}
                  className="hover:text-amaretto-pink transition-colors duration-200"
                >
                  {product.category}
                </Link>
              </>
            )}
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
                {product.images && product.images.length > 0 && product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-amaretto-black/30 font-sans text-sm">
                    Imagen principal
                  </div>
                )}
              </div>

              {/* Miniaturas */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-3 gap-4">
                  {product.images.slice(1, 4).map((image, index) => (
                    <div
                      key={`${product._id}-thumb-${index}`}
                      className="relative w-full h-24 bg-amaretto-gray-light rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity duration-200"
                    >
                      <img
                        src={image}
                        alt={`${product.name} - Vista ${index + 2}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              )}
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
                {product.name}
              </h1>

              {/* Precio */}
              {product.price !== undefined && product.price !== null && (
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
                {(product.stock ?? 0) > 0 && product.price !== undefined && product.price !== null ? (
                  <>
                    <AddToCartButton product={product} />
                    <WhatsAppButton
                      message={`Hola, me interesa el producto: ${product.name} - ${product.category || 'Producto'}`}
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
                    {product.price === undefined || product.price === null ? 'Producto no disponible' : 'Producto agotado'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Productos relacionados */}
      {relatedProducts.length > 0 && (
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
      )}
    </div>
  )
}
