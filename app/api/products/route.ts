import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/src/lib/db'
import { Product } from '@/src/models/Product'
import * as fileStorage from '@/src/lib/fileStorage'

// Función helper para normalizar URLs de imágenes
const normalizeImageUrl = (imageUrl: string | undefined | null): string | null => {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return null
  }
  
  const url = imageUrl.trim()
  
  // Si ya es una URL completa (http/https), retornarla
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // Si es un public_id, construir la URL completa
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dtoa33cb1'
  return `https://res.cloudinary.com/${cloudName}/image/upload/${url}`
}

export async function GET(request: NextRequest) {
  let useFileStorage = false
  
  try {
    await connectToDatabase()
  } catch (error: any) {
    console.error('Error de conexión a MongoDB, usando almacenamiento en archivo:', error.message)
    useFileStorage = true
  }

  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    let products
    
    if (useFileStorage) {
      // Obtener de archivo
      products = await fileStorage.getAllProducts()
      // Ordenar por fecha de creación (más recientes primero)
      products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else {
      // Obtener de MongoDB
      const filters: Record<string, unknown> = {}
      if (category && category !== 'Todas') {
        filters.category = category
      }
      if (search) {
        filters.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } },
        ]
      }
      products = await Product.find(filters).sort({ createdAt: -1 })
    }

    // Aplicar filtros si se usó almacenamiento en archivo
    if (useFileStorage) {
      if (category && category !== 'Todas') {
        products = products.filter(p => p.category === category)
      }
      if (search) {
        const searchLower = search.toLowerCase()
        products = products.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          (p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchLower)))
        )
      }
    }

    return NextResponse.json(products)
  } catch (error: any) {
    console.error('Error al obtener productos:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  let useFileStorage = false
  
  try {
    await connectToDatabase()
  } catch (error: any) {
    console.error('Error de conexión a MongoDB, usando almacenamiento en archivo:', error.message)
    useFileStorage = true
  }

  try {
    const body = await request.json()

    // Validar campos requeridos
    if (!body.name || !body.slug || !body.description || body.price === undefined) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: name, slug, description, price' },
        { status: 400 }
      )
    }

    // Limpiar y normalizar el slug
    let slug = body.slug.trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    if (!slug) {
      // Si el slug está vacío, generarlo desde el nombre
      slug = body.name.trim().toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }

    // Preparar datos del producto
    const productData: any = {
      name: body.name.trim(),
      slug: slug,
      description: body.description.trim(),
      price: Number(body.price),
      category: body.category || 'Anillos',
      tags: Array.isArray(body.tags) ? body.tags : [],
      images: Array.isArray(body.images) 
        ? body.images.map((img: any) => normalizeImageUrl(img)).filter((img: string | null): img is string => img !== null)
        : [],
      stock: Number(body.stock) || 0,
      material: body.material || '',
      medidas: body.medidas || '',
      cierre: body.cierre || '',
      featured: body.featured || false,
    }

    // Agregar campos de oferta solo si están presentes
    if (body.isOnSale) {
      productData.isOnSale = true
      if (body.originalPrice) productData.originalPrice = Number(body.originalPrice)
      if (body.discountPrice) productData.discountPrice = Number(body.discountPrice)
    } else {
      productData.isOnSale = false
    }

    let product
    
    if (useFileStorage) {
      // Usar almacenamiento en archivo
      product = await fileStorage.createProduct(productData)
      console.log('✅ Producto guardado en archivo (MongoDB no disponible)')
    } else {
      // Usar MongoDB
      const existing = await Product.findOne({ slug: slug })
      if (existing) {
        return NextResponse.json(
          { error: 'Ya existe un producto con este slug' },
          { status: 400 }
        )
      }
      product = await Product.create(productData)
    }
    
    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    console.error('Error al crear producto', error)
    
    // Mensaje de error más descriptivo
    let errorMessage = 'No se pudo crear el producto'
    if (error.code === 11000) {
      errorMessage = 'Ya existe un producto con este slug. Por favor, usa un slug diferente.'
    } else if (error.errors) {
      // Errores de validación de Mongoose
      const validationErrors = Object.values(error.errors).map((err: any) => err.message).join(', ')
      errorMessage = `Error de validación: ${validationErrors}`
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

