import Link from 'next/link'
import CollectionCard from '@/components/CollectionCard'
import TestimonialCard from '@/components/TestimonialCard'
import WhatsAppButton from '@/components/WhatsAppButton'
import HeroProductCarousel from '@/components/HeroProductCarousel'
import { connectToDatabase } from '@/src/lib/db'
import { Product } from '@/src/models/Product'
import { Settings } from '@/src/models/Settings'
import { ProductDTO } from '@/src/types/product'

async function getSettings() {
  try {
    await connectToDatabase()
    const settings = await Settings.findOne().lean()
    return settings || { heroType: 'random', heroImage: '' }
  } catch (error) {
    console.error('Error al obtener settings:', error)
    return { heroType: 'random', heroImage: '' }
  }
}

async function getProductsForHero() {
  try {
    await connectToDatabase()
    const products = await Product.find({ stock: { $gt: 0 } })
      .limit(20) // Obtener más productos para mejor variedad
      .lean()
    
    // Mezclar productos aleatoriamente
    const shuffled = products.sort(() => Math.random() - 0.5)
    return JSON.parse(JSON.stringify(shuffled)) as ProductDTO[]
  } catch (error) {
    console.error('Error al obtener productos para hero:', error)
    return []
  }
}

async function getHomepageFeatured() {
  try {
    await connectToDatabase()
    const { HomepageFeatured } = await import('@/src/models/HomepageFeatured')
    const featured = await HomepageFeatured.findOne().lean()
    
    if (!featured) {
      return null
    }

    return {
      ringsProductId: featured.ringsProductId || undefined,
      earringsProductId: featured.earringsProductId || undefined,
      necklacesProductId: featured.necklacesProductId || undefined,
      braceletsProductId: featured.braceletsProductId || undefined,
    }
  } catch (error) {
    console.error('Error al obtener productos destacados:', error)
    return null
  }
}

async function getFeaturedProducts(featuredIds: {
  ringsProductId?: string
  earringsProductId?: string
  necklacesProductId?: string
  braceletsProductId?: string
}) {
  try {
    await connectToDatabase()
    const productIds = [
      featuredIds.ringsProductId,
      featuredIds.earringsProductId,
      featuredIds.necklacesProductId,
      featuredIds.braceletsProductId,
    ].filter((id): id is string => !!id)

    if (productIds.length === 0) {
      return {}
    }

    const products = await Product.find({ _id: { $in: productIds } }).lean()
    const productsMap: Record<string, ProductDTO> = {}

    products.forEach((product) => {
      const productDto = JSON.parse(JSON.stringify(product)) as ProductDTO
      productsMap[product._id.toString()] = productDto
    })

    return {
      rings: featuredIds.ringsProductId ? productsMap[featuredIds.ringsProductId] : null,
      earrings: featuredIds.earringsProductId ? productsMap[featuredIds.earringsProductId] : null,
      necklaces: featuredIds.necklacesProductId ? productsMap[featuredIds.necklacesProductId] : null,
      bracelets: featuredIds.braceletsProductId ? productsMap[featuredIds.braceletsProductId] : null,
    }
  } catch (error) {
    console.error('Error al obtener productos destacados:', error)
    return {}
  }
}

export default async function Home() {
  const settings = await getSettings()
  // Siempre obtener productos para el hero de fondo
  const heroProducts = await getProductsForHero()
  
  // Obtener productos destacados
  const featuredIds = await getHomepageFeatured()
  const featuredProducts = featuredIds ? await getFeaturedProducts(featuredIds) : {}

  const collections = [
    {
      name: 'Anillos',
      description: 'Anillos elegantes en acero inoxidable y chapa de oro',
      image: 'anillos',
      href: '/coleccion?categoria=anillos',
      product: featuredProducts.rings,
    },
    {
      name: 'Aretes',
      description: 'Aretes minimalistas para cada ocasión',
      image: 'aretes',
      href: '/coleccion?categoria=aretes',
      product: featuredProducts.earrings,
    },
    {
      name: 'Collares',
      description: 'Collares delicados que complementan tu estilo',
      image: 'collares',
      href: '/coleccion?categoria=collares',
      product: featuredProducts.necklaces,
    },
    {
      name: 'Pulseras',
      description: 'Pulseras versátiles y cómodas',
      image: 'pulseras',
      href: '/coleccion?categoria=pulseras',
      product: featuredProducts.bracelets,
    },
  ]

  const testimonials = [
    {
      name: 'María González',
      comment: 'Me encanta la calidad de las piezas. Son elegantes y no me causan alergias. Perfectas para el día a día.',
      rating: 5,
    },
    {
      name: 'Ana Martínez',
      comment: 'La entrega fue súper rápida y el empaque muy cuidado. Los aretes son hermosos y muy cómodos.',
      rating: 5,
    },
    {
      name: 'Laura Sánchez',
      comment: 'Excelente relación calidad-precio. Las piezas se ven mucho más caras de lo que cuestan. Totalmente recomendado.',
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-amaretto-beige py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Texto */}
            <div className="text-center md:text-left">
              <h1 className="font-serif text-4xl md:text-6xl font-bold text-amaretto-black mb-6">
                Joyería elegante para tu día a día
              </h1>
              <p className="text-lg text-amaretto-black/70 font-sans mb-8 max-w-xl mx-auto md:mx-0">
                Piezas minimalistas en acero inoxidable y chapa de oro. 
                Hipoalergénicas, resistentes y diseñadas para mujeres modernas.
              </p>
              <Link
                href="/coleccion"
                className="inline-block bg-amaretto-black text-white font-sans font-medium px-8 py-4 rounded-lg hover:bg-amaretto-black/90 transition-colors duration-200"
              >
                Ver colección
              </Link>
            </div>
            
            {/* Imagen Hero */}
            {heroProducts.length > 0 ? (
              <HeroProductCarousel products={heroProducts} />
            ) : (
              <div className="relative w-full h-96 bg-amaretto-beige rounded-lg flex items-center justify-center">
                <p className="text-amaretto-black/30 font-sans text-sm">
                  No hay productos disponibles
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Colecciones Destacadas */}
      <section className="py-16 md:py-24 bg-amaretto-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-amaretto-black text-center mb-12">
            Nuestras Colecciones
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {collections.map((collection) => (
              <CollectionCard
                key={collection.name}
                name={collection.name}
                description={collection.description}
                image={collection.image}
                href={collection.href}
                product={collection.product}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Lo que nos hace diferentes */}
      <section className="py-16 md:py-24 bg-amaretto-beige">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-amaretto-black text-center mb-12">
            Lo que nos hace diferentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Materiales hipoalergénicos */}
            <div className="bg-amaretto-white rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-amaretto-pink/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-amaretto-pink"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-bold text-amaretto-black mb-3">
                Materiales hipoalergénicos
              </h3>
              <p className="text-amaretto-black/70 font-sans text-sm">
                Todas nuestras piezas están diseñadas para ser seguras y cómodas, 
                sin causar irritaciones ni alergias.
              </p>
            </div>

            {/* Resistentes al agua */}
            <div className="bg-amaretto-white rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-amaretto-pink/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-amaretto-pink"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-bold text-amaretto-black mb-3">
                Resistentes al agua
              </h3>
              <p className="text-amaretto-black/70 font-sans text-sm">
                Puedes usar tus joyas en la ducha, piscina o playa sin preocuparte 
                por dañarlas.
              </p>
            </div>

            {/* Envíos a todo México */}
            <div className="bg-amaretto-white rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-amaretto-pink/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-amaretto-pink"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-bold text-amaretto-black mb-3">
                Envíos a todo México
              </h3>
              <p className="text-amaretto-black/70 font-sans text-sm">
                Llevamos la elegancia hasta tu puerta. Envíos rápidos y seguros 
                a toda la República Mexicana.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-16 md:py-24 bg-amaretto-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-amaretto-black text-center mb-12">
            Lo que dicen nuestras clientas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                name={testimonial.name}
                comment={testimonial.comment}
                rating={testimonial.rating}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 md:py-24 bg-amaretto-pink/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-amaretto-black mb-6">
            ¿Tienes alguna pregunta?
          </h2>
          <p className="text-lg text-amaretto-black/70 font-sans mb-8">
            Estamos aquí para ayudarte. Contáctanos por WhatsApp y te responderemos 
            en breve.
          </p>
          <WhatsAppButton message="Hola, me interesa conocer más sobre Amaretto Jewelry">
            Hablar por WhatsApp
          </WhatsAppButton>
        </div>
      </section>
    </div>
  )
}
