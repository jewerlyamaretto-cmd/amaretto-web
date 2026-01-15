'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import { ProductDTO } from '@/src/types/product'

const categories = ['Todas', 'Nuevo', 'Anillos', 'Aretes', 'Collares', 'Pulseras']
const productsPerPage = 24

export default function ColeccionContent() {
  const searchParams = useSearchParams()
  const categoriaParam = searchParams.get('categoria')
  
  // Capitalizar primera letra de la categoría si viene de la URL
  const getCategoryFromParam = (param: string | null) => {
    if (!param) return 'Todas'
    return param.charAt(0).toUpperCase() + param.slice(1).toLowerCase()
  }

  const [selectedCategory, setSelectedCategory] = useState(
    categoriaParam ? getCategoryFromParam(categoriaParam) : 'Todas'
  )
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 })
  const [currentPage, setCurrentPage] = useState(1)
  const [products, setProducts] = useState<ProductDTO[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/products', { cache: 'no-store' })
        if (!res.ok) {
          throw new Error('Error al cargar productos')
        }
        const data = await res.json()
        setProducts(Array.isArray(data) ? data : [])
        
        // Si no hay productos y no hay error, mostrar mensaje informativo
        if (Array.isArray(data) && data.length === 0) {
          setError('No hay productos disponibles. Configura MongoDB para agregar productos desde el panel de administración.')
        }
      } catch (err) {
        console.error(err)
        setError('No se pudieron cargar los productos. Verifica tu conexión o el backend.')
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Actualizar categoría cuando cambia el parámetro de URL
  useEffect(() => {
    if (categoriaParam) {
      setSelectedCategory(getCategoryFromParam(categoriaParam))
      setCurrentPage(1)
    }
  }, [categoriaParam])

  // Scroll al inicio cuando cambia la página
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  // Filtrar productos
  const filteredProducts = products.filter((product) => {
    let matchesCategory = false
    if (selectedCategory === 'Todas') {
      matchesCategory = true
    } else if (selectedCategory === 'Nuevo') {
      matchesCategory = product.isNew === true
    } else {
      matchesCategory = product.category === selectedCategory
    }
    const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max
    return matchesCategory && matchesPrice
  })

  // Calcular paginación
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  const startIndex = (currentPage - 1) * productsPerPage
  const endIndex = startIndex + productsPerPage
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

  // Resetear página cuando cambian los filtros
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handlePriceChange = (min: number, max: number) => {
    setPriceRange({ min, max })
    setCurrentPage(1)
  }

  return (
    <>
      {/* Header */}
      <section className="bg-amaretto-beige py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-amaretto-black text-center mb-4">
            Colección
          </h1>
          <p className="text-center text-amaretto-black/70 font-sans max-w-2xl mx-auto">
            Descubre nuestras piezas elegantes y minimalistas
          </p>
        </div>
      </section>

      {/* Filtros */}
      <section className="border-b border-amaretto-gray-light bg-amaretto-white sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Filtro por categoría */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-amaretto-black mb-2 font-sans">
                Categoría
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-4 py-2 rounded-lg font-sans text-sm transition-colors duration-200 ${
                      selectedCategory === category
                        ? 'bg-amaretto-pink text-white'
                        : 'bg-amaretto-beige text-amaretto-black hover:bg-amaretto-gray-light'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtro por precio */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-amaretto-black mb-2 font-sans">
                Rango de precio
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="0"
                  max="5000"
                  value={priceRange.min}
                  onChange={(e) => handlePriceChange(Number(e.target.value), priceRange.max)}
                  className="w-24 px-3 py-2 border border-amaretto-gray-light rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-amaretto-pink"
                  placeholder="Mín"
                />
                <span className="text-amaretto-black/60 font-sans">-</span>
                <input
                  type="number"
                  min="0"
                  max="5000"
                  value={priceRange.max}
                  onChange={(e) => handlePriceChange(priceRange.min, Number(e.target.value))}
                  className="w-24 px-3 py-2 border border-amaretto-gray-light rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-amaretto-pink"
                  placeholder="Máx"
                />
                <span className="text-amaretto-black/60 font-sans text-sm">MXN</span>
              </div>
            </div>

            {/* Contador de resultados */}
            <div className="text-sm text-amaretto-black/60 font-sans">
              {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </section>

      {/* Grilla de productos */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <p className="text-center text-amaretto-black/60 font-sans">Cargando productos...</p>
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
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1
                      // Mostrar solo algunas páginas alrededor de la actual
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 2 && page <= currentPage + 2)
                      ) {
                        return (
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
                        )
                      } else if (
                        page === currentPage - 3 ||
                        page === currentPage + 3
                      ) {
                        return (
                          <span key={page} className="px-2 text-amaretto-black/60 font-sans">
                            ...
                          </span>
                        )
                      }
                      return null
                    })}
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
                No se encontraron productos con los filtros seleccionados.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

