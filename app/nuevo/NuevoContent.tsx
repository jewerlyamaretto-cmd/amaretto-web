'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import { ProductDTO } from '@/src/types/product'

const productsPerPage = 24

export default function NuevoContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<ProductDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/products?isNew=true', { cache: 'no-store' })
      if (!res.ok) {
        throw new Error('Error al cargar productos')
      }
      const data = await res.json()
      setProducts(data)
    } catch (err) {
      console.error(err)
      setError('No se pudieron cargar los productos nuevos')
    } finally {
      setIsLoading(false)
    }
  }

  const totalPages = Math.ceil(products.length / productsPerPage)
  const startIndex = (currentPage - 1) * productsPerPage
  const endIndex = startIndex + productsPerPage
  const currentProducts = products.slice(startIndex, endIndex)

  return (
    <div className="min-h-screen bg-amaretto-white">
      {/* Hero Section */}
      <section className="bg-amaretto-beige py-16 md:py-24 border-b border-amaretto-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-amaretto-black mb-4">
              Productos Nuevos
            </h1>
            <p className="text-lg text-amaretto-black/70 font-sans max-w-2xl mx-auto">
              Descubre nuestras últimas incorporaciones. Piezas frescas y elegantes para tu colección.
            </p>
          </div>
        </div>
      </section>

      {/* Grilla de productos */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <p className="text-center text-amaretto-black/60 font-sans">Cargando productos nuevos...</p>
          ) : error ? (
            <p className="text-center text-red-500 font-sans">{error}</p>
          ) : currentProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                  />
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg font-sans text-sm bg-amaretto-beige text-amaretto-black hover:bg-amaretto-gray-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Anterior
                  </button>
                  
                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg font-sans text-sm transition-colors duration-200 ${
                          currentPage === page
                            ? 'bg-amaretto-pink text-white'
                            : 'bg-amaretto-beige text-amaretto-black hover:bg-amaretto-gray-light'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg font-sans text-sm bg-amaretto-beige text-amaretto-black hover:bg-amaretto-gray-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-amaretto-black/60 font-sans text-lg">
                No hay productos nuevos en este momento.
              </p>
              <p className="text-amaretto-black/40 font-sans text-sm mt-2">
                Vuelve pronto para ver nuestras últimas incorporaciones.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

