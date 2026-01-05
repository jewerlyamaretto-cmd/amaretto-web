'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'


const emptyProduct = {
  name: '',
  slug: '',
  description: '',
  price: 0,
  originalPrice: 0,
  discountPrice: 0,
  isOnSale: false,
  category: 'Anillos',
  tags: '',
  images: '',
  stock: 0,
  material: '',
  medidas: '',
  cierre: '',
}

type ProductForm = typeof emptyProduct & {
  _id?: string
}

interface Order {
  _id: string
  customer: {
    nombre: string
    email: string
    telefono: string
  }
  total: number
  status: string
  createdAt: string
}

interface SettingsForm {
  phone: string
  email: string
  address: string
  instagram: string
  facebook: string
  whatsapp: string
  aboutUs: string
  mission: string
  vision: string
  businessHours: string
  shippingInfo: string
  returnPolicy: string
}

export default function AdminPage() {
  const router = useRouter()
  const [products, setProducts] = useState<ProductForm[]>([])
  const [form, setForm] = useState<ProductForm>(emptyProduct)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isOrdersLoading, setIsOrdersLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [settings, setSettings] = useState<SettingsForm>({
    phone: '',
    email: '',
    address: '',
    instagram: '',
    facebook: '',
    whatsapp: '',
    aboutUs: '',
    mission: '',
    vision: '',
    businessHours: '',
    shippingInfo: '',
    returnPolicy: '',
  })
  const [isSettingsLoading, setIsSettingsLoading] = useState(false)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [productImages, setProductImages] = useState<string[]>([])
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  async function fetchProducts() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/products', { cache: 'no-store' })
      const data = await res.json()
      setProducts(data)
    } catch (err) {
      console.error(err)
      setError('No se pudieron cargar los productos')
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchOrders() {
    setIsOrdersLoading(true)
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' })
      const data = await res.json()
      setOrders(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsOrdersLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts()
      fetchOrders()
      fetchSettings()
    }
  }, [isAuthenticated])

  async function fetchSettings() {
    setIsSettingsLoading(true)
    try {
      const res = await fetch('/api/settings', { cache: 'no-store' })
      const data = await res.json()
      setSettings(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSettingsLoading(false)
    }
  }

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault()
    setIsSavingSettings(true)
    setError(null)

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al guardar la configuración')
      }

      await fetchSettings()
      alert('Configuración guardada exitosamente')
    } catch (err) {
      console.error(err)
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar la configuración'
      setError(errorMessage)
      
      // Si el error es de conexión a MongoDB, mostrar ayuda adicional
      if (errorMessage.includes('MONGODB_URI') || errorMessage.includes('conexión a la base de datos')) {
        setTimeout(() => {
          const helpMessage = `
Para guardar la configuración, necesitas configurar MongoDB:

1. Abre el archivo .env.local en la raíz del proyecto
2. Agrega tu cadena de conexión de MongoDB:
   MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/amaretto

O si tienes MongoDB local:
   MONGODB_URI=mongodb://localhost:27017/amaretto

3. Reinicia el servidor (npm run dev)

¿Necesitas ayuda para configurar MongoDB Atlas? Visita: https://www.mongodb.com/cloud/atlas/register
          `
          if (confirm(helpMessage + '\n\n¿Quieres ver más información?')) {
            window.open('https://www.mongodb.com/cloud/atlas/register', '_blank')
          }
        }, 100)
      }
    } finally {
      setIsSavingSettings(false)
    }
  }

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/check')
      if (res.ok) {
        setIsAuthenticated(true)
      } else {
        router.push('/admin/login')
      }
    } catch (err) {
      router.push('/admin/login')
    } finally {
      setIsCheckingAuth(false)
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch (err) {
      console.error('Error al cerrar sesión:', err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? checked 
        : name === 'price' || name === 'stock' || name === 'originalPrice' || name === 'discountPrice'
        ? Number(value) 
        : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Validar campos requeridos
      if (!form.name || !form.name.trim()) {
        setError('El nombre del producto es requerido')
        setIsSubmitting(false)
        return
      }

      if (!form.slug || !form.slug.trim()) {
        setError('El slug del producto es requerido')
        setIsSubmitting(false)
        return
      }

      if (!form.description || !form.description.trim()) {
        setError('La descripción del producto es requerida')
        setIsSubmitting(false)
        return
      }

      if (!form.price || form.price <= 0) {
        setError('El precio del producto debe ser mayor a 0')
        setIsSubmitting(false)
        return
      }

      // Generar slug automáticamente si no está presente o limpiar el slug
      let slug = form.slug ? form.slug.trim().toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') : ''

      if (!slug) {
        // Si el slug está vacío después de limpiarlo, generarlo desde el nombre
        slug = form.name.trim().toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
        // Actualizar el slug en el formulario
        setForm(prev => ({ ...prev, slug }))
      }

      // Preparar payload base
      const payload: any = {
        name: form.name.trim(),
        slug: slug,
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category,
        tags: form.tags ? form.tags.split(',').map((tag) => tag.trim()).filter(tag => tag) : [],
        images: productImages.length > 0 ? productImages : [],
        stock: Number(form.stock) || 0,
        material: form.material || '',
        medidas: form.medidas || '',
        cierre: form.cierre || '',
        featured: false,
      }
      
      // Si está en oferta, configurar campos de oferta
      if (form.isOnSale && form.discountPrice && form.discountPrice > 0) {
        payload.isOnSale = true
        payload.originalPrice = form.originalPrice && form.originalPrice > 0 ? Number(form.originalPrice) : Number(form.price)
        payload.discountPrice = Number(form.discountPrice)
        payload.price = Number(form.discountPrice) // El precio mostrado es el precio con descuento
      } else {
        // Si no está en oferta, no incluir campos de oferta
        payload.isOnSale = false
      }

      const method = form._id ? 'PUT' : 'POST'
      const url = form._id ? `/api/products/${form._id}` : '/api/products'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar el producto')
      }

      // Éxito
      await fetchProducts()
      setForm(emptyProduct)
      setProductImages([])
      setError(null)
      
      // Mostrar mensaje de éxito
      const successMsg = form._id ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente'
      setSuccessMessage(successMsg)
      
      // Ocultar el mensaje después de 4 segundos
      setTimeout(() => {
        setSuccessMessage(null)
      }, 4000)
      
      // Scroll al inicio para ver la notificación
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error('Error al guardar producto:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar el producto'
      setError(errorMessage)
      
      // Scroll al error
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (product: ProductForm) => {
    // Cargar URLs de imágenes
    const imagesArray = product.images 
      ? (Array.isArray(product.images) 
          ? product.images 
          : String(product.images).split(',').map(img => img.trim()).filter(img => img))
      : []
    
    setForm({
      ...product,
      tags: product.tags ? (Array.isArray(product.tags) ? product.tags.join(', ') : String(product.tags)) : '',
      images: '',
      originalPrice: product.originalPrice || 0,
      discountPrice: product.discountPrice || 0,
      isOnSale: product.isOnSale || false,
    })
    setProductImages(imagesArray)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Validar cantidad máxima
    if (productImages.length + files.length > 5) {
      setError('Máximo 5 imágenes permitidas')
      return
    }

    setIsUploadingImages(true)
    setError(null)

    try {
      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append('files', file)
      })

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al subir las imágenes')
      }

      if (!data || !data.files || !Array.isArray(data.files) || data.files.length === 0) {
        throw new Error('No se recibieron imágenes del servidor')
      }

      // Agregar las URLs de Cloudinary al estado
      const newUrls = data.files.filter((url: string) => url && typeof url === 'string' && url.trim().startsWith('http'))
      
      if (newUrls.length === 0) {
        throw new Error('No se recibieron URLs válidas')
      }

      setProductImages(prev => [...prev, ...newUrls])
      setSuccessMessage(`${newUrls.length} imagen(es) subida(s) exitosamente`)
      setTimeout(() => setSuccessMessage(null), 4000)
      
      e.target.value = '' // Limpiar input
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Error al subir las imágenes')
    } finally {
      setIsUploadingImages(false)
    }
  }

  const handleRemoveImage = (index: number) => {
    setProductImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Deseas eliminar este producto?')) return
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('No se pudo eliminar el producto')
      await fetchProducts()
    } catch (err) {
      console.error(err)
      setError('No se pudo eliminar el producto')
    }
  }

  const handleToggleStock = async (id: string, currentStock: number) => {
    try {
      const newStock = currentStock > 0 ? 0 : 10 // Si está agotado, poner 10; si tiene stock, poner 0
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      })
      if (!res.ok) throw new Error('No se pudo actualizar el stock')
      await fetchProducts()
    } catch (err) {
      console.error(err)
      setError('No se pudo actualizar el stock')
    }
  }

  const handleToggleSale = async (id: string, product: ProductForm) => {
    try {
      const updates: Partial<ProductForm> = {}
      
      if (product.isOnSale) {
        // Quitar oferta: restaurar precio original
        updates.isOnSale = false
        updates.price = product.originalPrice || product.price
        updates.originalPrice = undefined
        updates.discountPrice = undefined
      } else {
        // Activar oferta: guardar precio actual como original y aplicar descuento
        updates.isOnSale = true
        updates.originalPrice = product.price
        updates.discountPrice = product.discountPrice || Math.round(product.price * 0.8) // 20% descuento por defecto
        updates.price = updates.discountPrice
      }
      
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error('No se pudo actualizar la oferta')
      await fetchProducts()
    } catch (err) {
      console.error(err)
      setError('No se pudo actualizar la oferta')
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-amaretto-white flex items-center justify-center">
        <p className="text-amaretto-black/60 font-sans">Verificando acceso...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-amaretto-white py-12">
      {/* Notificación de éxito */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-amaretto-pink text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md border-2 border-amaretto-gold/30">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-sans font-semibold text-sm">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <header className="text-center">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              <p className="text-sm uppercase tracking-[0.2em] text-amaretto-pink font-semibold mb-4">Administración</p>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-amaretto-black mb-4">
                Gestión de productos
              </h1>
              <p className="font-sans text-amaretto-black/70 max-w-2xl mx-auto">
                Agrega, edita o elimina productos de manera sencilla. Los cambios se reflejan de inmediato en la tienda.
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <button
                onClick={handleLogout}
                className="text-sm font-sans text-amaretto-black/70 hover:text-amaretto-pink transition-colors px-4 py-2 rounded-lg border border-amaretto-gray-light hover:border-amaretto-pink"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </header>

        <section className="bg-amaretto-beige rounded-2xl p-8 shadow-sm border border-amaretto-gray-light/60">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-amaretto-black">Formulario de producto</h2>
              <p className="text-sm font-sans text-amaretto-black/70">
                {form._id ? 'Editando producto existente' : 'Crea un producto nuevo'}
              </p>
            </div>
            {form._id && (
              <button
                type="button"
                onClick={() => {
                  setForm(emptyProduct)
                  setProductImages([])
                  setError(null)
                }}
                className="text-sm font-sans text-amaretto-black/70 hover:text-amaretto-pink transition-colors"
              >
                Cancelar edición
              </button>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-100 text-red-700 font-sans text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-sans font-medium text-amaretto-black mb-2">Nombre</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-amaretto-gray-light focus:ring-2 focus:ring-amaretto-pink outline-none font-sans"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-sans font-medium text-amaretto-black mb-2">Slug</label>
                <input
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-amaretto-gray-light focus:ring-2 focus:ring-amaretto-pink outline-none font-sans"
                  placeholder="anillo-elegante"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-sans font-medium text-amaretto-black mb-2">Precio (MXN)</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-amaretto-gray-light focus:ring-2 focus:ring-amaretto-pink outline-none font-sans"
                  min={0}
                  required
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isOnSale"
                  checked={form.isOnSale}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-amaretto-gray-light text-amaretto-pink focus:ring-2 focus:ring-amaretto-pink"
                />
                <label className="text-sm font-sans font-medium text-amaretto-black">
                  Producto en oferta
                </label>
              </div>
              {form.isOnSale && (
                <>
                  <div>
                    <label className="block text-sm font-sans font-medium text-amaretto-black mb-2">
                      Precio original (MXN)
                    </label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={form.originalPrice}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-amaretto-gray-light focus:ring-2 focus:ring-amaretto-pink outline-none font-sans"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-sans font-medium text-amaretto-black mb-2">
                      Precio con descuento (MXN)
                    </label>
                    <input
                      type="number"
                      name="discountPrice"
                      value={form.discountPrice}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-amaretto-gray-light focus:ring-2 focus:ring-amaretto-pink outline-none font-sans"
                      min={0}
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-sans font-medium text-amaretto-black mb-2">Categoría</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-amaretto-gray-light focus:ring-2 focus:ring-amaretto-pink outline-none font-sans"
                >
                  <option value="Anillos">Anillos</option>
                  <option value="Aretes">Aretes</option>
                  <option value="Collares">Collares</option>
                  <option value="Pulseras">Pulseras</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-sans font-medium text-amaretto-black mb-2">Etiquetas (separadas por coma)</label>
                <input
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-amaretto-gray-light focus:ring-2 focus:ring-amaretto-pink outline-none font-sans"
                  placeholder="elegante, minimalista"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-sans font-medium text-amaretto-black mb-2">Descripción</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-amaretto-gray-light focus:ring-2 focus:ring-amaretto-pink outline-none font-sans h-32"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-sans font-medium text-amaretto-black mb-2">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    min={0}
                    className="w-full px-4 py-3 rounded-lg border border-amaretto-gray-light focus:ring-2 focus:ring-amaretto-pink outline-none font-sans"
                  />
                </div>
                <div>
                  <label className="block text-sm font-sans font-medium text-amaretto-black mb-2">
                    Imágenes del producto (1-5 imágenes)
                  </label>
                  
                  {/* Input para subir imágenes */}
                  <label className="block w-full px-4 py-3 bg-amaretto-pink text-white rounded-lg cursor-pointer hover:bg-amaretto-pink/90 transition-colors text-center font-sans text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed mb-3">
                    {isUploadingImages ? 'Subiendo imágenes...' : 'Subir imágenes'}
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      multiple
                      onChange={handleImageUpload}
                      disabled={isUploadingImages || productImages.length >= 5}
                      className="hidden"
                    />
                  </label>
                  
                  {productImages.length > 0 && (
                    <div className="mt-4 space-y-4">
                      <p className="text-sm font-sans font-medium text-amaretto-black mb-2">
                        Vista previa de imágenes ({productImages.length}/5):
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {productImages.map((imageUrl, index) => {
                          if (!imageUrl) return null
                          
                          const url = String(imageUrl).trim()
                          
                          return (
                            <div 
                              key={`img-${index}-${url}`} 
                              className="relative group"
                            >
                              <div className="w-full h-24 rounded-lg border-2 border-amaretto-gray-light overflow-hidden bg-white">
                                <img
                                  src={url}
                                  alt={`Imagen ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold z-10 hover:bg-red-600"
                                aria-label="Eliminar imagen"
                              >
                                ×
                              </button>
                              <span className="absolute bottom-1 left-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-semibold">
                                {index + 1}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-amaretto-black/60 mt-2">
                    {productImages.length}/5 imágenes. Puedes subir hasta 5 imágenes por producto.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-sans font-medium text-amaretto-black mb-2">Material</label>
                  <input
                    name="material"
                    value={form.material}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-amaretto-gray-light focus:ring-2 focus:ring-amaretto-pink outline-none font-sans"
                  />
                </div>
                <div>
                  <label className="block text-sm font-sans font-medium text-amaretto-black mb-2">Medidas</label>
                  <input
                    name="medidas"
                    value={form.medidas}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-amaretto-gray-light focus:ring-2 focus:ring-amaretto-pink outline-none font-sans"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-sans font-medium text-amaretto-black mb-2">Tipo de cierre</label>
                <input
                  name="cierre"
                  value={form.cierre}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-amaretto-gray-light focus:ring-2 focus:ring-amaretto-pink outline-none font-sans"
                />
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-amaretto-black text-white font-sans font-medium px-6 py-3 rounded-lg hover:bg-amaretto-black/90 transition-colors duration-200 disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : form._id ? 'Actualizar producto' : 'Crear producto'}
              </button>
            </div>
          </form>
        </section>

        <section className="bg-white rounded-2xl p-8 shadow-sm border border-amaretto-gray-light/60">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-amaretto-black">Productos existentes</h2>
              <p className="text-sm font-sans text-amaretto-black/70">
                Administra todos tus productos publicados
              </p>
            </div>
            <button
              onClick={fetchProducts}
              className="text-sm font-sans text-amaretto-black/70 hover:text-amaretto-pink transition-colors"
            >
              Actualizar lista
            </button>
          </div>

          {isLoading ? (
            <p className="text-center text-amaretto-black/60 font-sans">Cargando productos...</p>
          ) : products.length === 0 ? (
            <p className="text-center text-amaretto-black/60 font-sans">No hay productos registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-sm uppercase tracking-wide text-amaretto-black/60 font-sans">
                    <th className="px-4 py-2">Producto</th>
                    <th className="px-4 py-2">Categoría</th>
                    <th className="px-4 py-2">Precio</th>
                    <th className="px-4 py-2">Stock</th>
                    <th className="px-4 py-2">Estado</th>
                    <th className="px-4 py-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} className="bg-amaretto-beige/60 rounded-xl text-sm font-sans">
                      <td className="px-4 py-3 font-medium text-amaretto-black">
                        <p>{product.name}</p>
                        <p className="text-xs text-amaretto-black/60">{product.slug}</p>
                      </td>
                      <td className="px-4 py-3 text-amaretto-black/80">{product.category}</td>
                      <td className="px-4 py-3 text-amaretto-black font-medium">
                        {product.isOnSale && product.originalPrice ? (
                          <div>
                            <span className="line-through text-amaretto-black/40 text-xs mr-2">
                              ${product.originalPrice.toLocaleString('es-MX')}
                            </span>
                            <span className="text-amaretto-pink font-bold">
                              ${product.price?.toLocaleString('es-MX')} MXN
                            </span>
                            <span className="ml-2 text-xs bg-amaretto-pink/20 text-amaretto-pink px-2 py-0.5 rounded">
                              OFERTA
                            </span>
                          </div>
                        ) : (
                          `$${product.price?.toLocaleString('es-MX')} MXN`
                        )}
                      </td>
                      <td className="px-4 py-3 text-amaretto-black/80">{product.stock || 0}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {product.stock > 0 ? (
                            <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium w-fit">
                              Disponible
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium w-fit">
                              Agotado
                            </span>
                          )}
                          {product.isOnSale && (
                            <span className="px-2 py-1 rounded-full bg-amaretto-pink/20 text-amaretto-pink text-xs font-medium w-fit">
                              En oferta
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2 flex-wrap">
                          <button
                            onClick={() => handleEdit(product)}
                            className="px-3 py-1 rounded-lg border border-amaretto-gray-light text-amaretto-black text-xs hover:border-amaretto-pink transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleToggleStock(product._id!, product.stock || 0)}
                            className={`px-3 py-1 rounded-lg border text-xs transition-colors ${
                              product.stock > 0
                                ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                                : 'border-green-200 text-green-600 hover:bg-green-50'
                            }`}
                          >
                            {product.stock > 0 ? 'Marcar agotado' : 'Marcar disponible'}
                          </button>
                          <button
                            onClick={() => handleToggleSale(product._id!, product)}
                            className={`px-3 py-1 rounded-lg border text-xs transition-colors ${
                              product.isOnSale
                                ? 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                : 'border-amaretto-pink text-amaretto-pink hover:bg-amaretto-pink/10'
                            }`}
                          >
                            {product.isOnSale ? 'Quitar oferta' : 'Poner oferta'}
                          </button>
                          <button
                            onClick={() => handleDelete(product._id!)}
                            className="px-3 py-1 rounded-lg border border-red-200 text-red-600 text-xs hover:bg-red-50 transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl p-8 shadow-sm border border-amaretto-gray-light/60">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-amaretto-black">Pedidos recientes</h2>
              <p className="text-sm font-sans text-amaretto-black/70">
                Visualiza los pedidos enviados por la tienda y confirma cada solicitud.
              </p>
            </div>
            <button
              onClick={fetchOrders}
              className="text-sm font-sans text-amaretto-black/70 hover:text-amaretto-pink transition-colors"
            >
              Actualizar pedidos
            </button>
          </div>

          {isOrdersLoading ? (
            <p className="text-center text-amaretto-black/60 font-sans">Cargando pedidos...</p>
          ) : orders.length === 0 ? (
            <p className="text-center text-amaretto-black/60 font-sans">Aún no hay pedidos registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-sm uppercase tracking-wide text-amaretto-black/60 font-sans">
                    <th className="px-4 py-2">Cliente</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Total</th>
                    <th className="px-4 py-2">Estado</th>
                    <th className="px-4 py-2">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="bg-amaretto-beige/60 text-sm font-sans">
                      <td className="px-4 py-3 font-medium text-amaretto-black">
                        {order.customer.nombre}
                        <p className="text-xs text-amaretto-black/60">{order.customer.telefono}</p>
                      </td>
                      <td className="px-4 py-3 text-amaretto-black/80">{order.customer.email}</td>
                      <td className="px-4 py-3 text-amaretto-black font-medium">
                        ${order.total.toLocaleString('es-MX')} MXN
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 rounded-full bg-white border border-amaretto-gray-light text-xs text-amaretto-black">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-amaretto-black/70">
                        {new Date(order.createdAt).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Sección de Configuración */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-amaretto-gray-light/60">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-amaretto-black">Configuración de la Tienda</h2>
              <p className="text-sm font-sans text-amaretto-black/70">
                Edita la información de contacto, redes sociales y contenido de la tienda
              </p>
            </div>
            <button
              onClick={fetchSettings}
              className="text-sm font-sans text-amaretto-black/70 hover:text-amaretto-pink transition-colors"
            >
              Recargar
            </button>
          </div>

          {isSettingsLoading ? (
            <p className="text-center text-amaretto-black/60 font-sans">Cargando configuración...</p>
          ) : (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Información de Contacto */}
              <div className="space-y-4">
                <h3 className="font-serif text-xl font-semibold text-amaretto-black border-b border-amaretto-gray-light pb-2">
                  Información de Contacto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-sans font-medium text-amaretto-black mb-2">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={settings.phone}
                      onChange={handleSettingsChange}
                      className="w-full px-4 py-3 rounded-lg border border-amaretto-gray-light focus:ring-2 focus:ring-amaretto-pink outline-none font-sans"
                      placeholder="+52 55 1234 5678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-sans font-medium text-amaretto-black mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={settings.email}
                      onChange={handleSettingsChange}
                      className="w-full px-4 py-3 rounded-lg border border-amaretto-gray-light focus:ring-2 focus:ring-amaretto-pink outline-none font-sans"
                      placeholder="jewerlyamaretto@gmail.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-sans font-medium text-amaretto-black mb-2">
                      Dirección
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={settings.address}
                      onChange={handleSettingsChange}
                      className="w-full px-4 py-3 rounded-lg border border-amaretto-gray-light focus:ring-2 focus:ring-amaretto-pink outline-none font-sans"
                      placeholder="México"
                    />
                  </div>
                </div>
              </div>

              {/* Redes Sociales */}
              <div className="space-y-4">
                <h3 className="font-serif text-xl font-semibold text-amaretto-black border-b border-amaretto-gray-light pb-2">
                  Redes Sociales
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-sans font-medium text-amaretto-black mb-2">
                      Instagram (URL)
                    </label>
                    <input
                      type="url"
                      name="instagram"
                      value={settings.instagram}
                      onChange={handleSettingsChange}
                      className="w-full px-4 py-3 rounded-lg border border-amaretto-gray-light focus:ring-2 focus:ring-amaretto-pink outline-none font-sans"
                      placeholder="https://instagram.com/amaretto"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-sans font-medium text-amaretto-black mb-2">
                      Facebook (URL)
                    </label>
                    <input
                      type="url"
                      name="facebook"
                      value={settings.facebook}
                      onChange={handleSettingsChange}
                      className="w-full px-4 py-3 rounded-lg border border-amaretto-gray-light focus:ring-2 focus:ring-amaretto-pink outline-none font-sans"
                      placeholder="https://facebook.com/amaretto"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-sans font-medium text-amaretto-black mb-2">
                      WhatsApp (número sin +)
                    </label>
                    <input
                      type="text"
                      name="whatsapp"
                      value={settings.whatsapp}
                      onChange={handleSettingsChange}
                      className="w-full px-4 py-3 rounded-lg border border-amaretto-gray-light focus:ring-2 focus:ring-amaretto-pink outline-none font-sans"
                      placeholder="526141920272"
                    />
                  </div>
                </div>
              </div>

              {/* Contenido */}
              <div className="space-y-4">
                <h3 className="font-serif text-xl font-semibold text-amaretto-black border-b border-amaretto-gray-light pb-2">
                  Contenido
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-sans font-medium text-amaretto-black mb-2">
                      Nuestra Historia / Sobre Nosotros
                    </label>
                    <textarea
                      name="aboutUs"
                      value={settings.aboutUs}
                      onChange={handleSettingsChange}
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg border border-amaretto-gray-light focus:ring-2 focus:ring-amaretto-pink outline-none font-sans"
                      placeholder="Escribe la historia de tu marca..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-sans font-medium text-amaretto-black mb-2">
                      Misión
                    </label>
                    <textarea
                      name="mission"
                      value={settings.mission}
                      onChange={handleSettingsChange}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-amaretto-gray-light focus:ring-2 focus:ring-amaretto-pink outline-none font-sans"
                      placeholder="Nuestra misión es..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-sans font-medium text-amaretto-black mb-2">
                      Visión
                    </label>
                    <textarea
                      name="vision"
                      value={settings.vision}
                      onChange={handleSettingsChange}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-amaretto-gray-light focus:ring-2 focus:ring-amaretto-pink outline-none font-sans"
                      placeholder="Nuestra visión es..."
                    />
                  </div>
                </div>
              </div>

              {/* Información Adicional */}
              <div className="space-y-4">
                <h3 className="font-serif text-xl font-semibold text-amaretto-black border-b border-amaretto-gray-light pb-2">
                  Información Adicional
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-sans font-medium text-amaretto-black mb-2">
                      Horarios de Atención
                    </label>
                    <input
                      type="text"
                      name="businessHours"
                      value={settings.businessHours}
                      onChange={handleSettingsChange}
                      className="w-full px-4 py-3 rounded-lg border border-amaretto-gray-light focus:ring-2 focus:ring-amaretto-pink outline-none font-sans"
                      placeholder="Lunes a Viernes: 9:00 AM - 6:00 PM"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-sans font-medium text-amaretto-black mb-2">
                      Información de Envíos
                    </label>
                    <input
                      type="text"
                      name="shippingInfo"
                      value={settings.shippingInfo}
                      onChange={handleSettingsChange}
                      className="w-full px-4 py-3 rounded-lg border border-amaretto-gray-light focus:ring-2 focus:ring-amaretto-pink outline-none font-sans"
                      placeholder="Envíos a todo México"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-sans font-medium text-amaretto-black mb-2">
                      Política de Devoluciones
                    </label>
                    <textarea
                      name="returnPolicy"
                      value={settings.returnPolicy}
                      onChange={handleSettingsChange}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-amaretto-gray-light focus:ring-2 focus:ring-amaretto-pink outline-none font-sans"
                      placeholder="Política de devoluciones y cambios..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-amaretto-gray-light">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="bg-amaretto-black text-white font-sans font-medium px-6 py-3 rounded-lg hover:bg-amaretto-black/90 transition-colors duration-200 disabled:opacity-50"
                >
                  {isSavingSettings ? 'Guardando...' : 'Guardar Configuración'}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}

