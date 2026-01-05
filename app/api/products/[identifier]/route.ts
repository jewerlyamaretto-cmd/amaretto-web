import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/src/lib/db'
import { Product } from '@/src/models/Product'
import mongoose from 'mongoose'
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

export async function GET(
  request: NextRequest,
  { params }: { params: { identifier: string } }
) {
  let useFileStorage = false
  
  try {
    await connectToDatabase()
  } catch (error: any) {
    console.error('Error de conexión a MongoDB, usando almacenamiento en archivo:', error.message)
    useFileStorage = true
  }

  try {
    const { identifier } = params
    let product
    
    if (useFileStorage) {
      product = mongoose.Types.ObjectId.isValid(identifier) 
        ? await fileStorage.getProductById(identifier)
        : await fileStorage.getProductBySlug(identifier)
    } else {
      product = await findProductByIdentifier(identifier)
    }

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error al obtener producto:', error)
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { identifier: string } }
) {
  let useFileStorage = false
  
  try {
    await connectToDatabase()
  } catch (error: any) {
    console.error('Error de conexión a MongoDB, usando almacenamiento en archivo:', error.message)
    useFileStorage = true
  }

  try {
    const { identifier } = params
    const body = await request.json()

    // Validar campos requeridos
    if (!body.name || !body.slug || !body.description || body.price === undefined) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: name, slug, description, price' },
        { status: 400 }
      )
    }

    let product
    
    if (useFileStorage) {
      // Usar almacenamiento en archivo
      const fileProduct = mongoose.Types.ObjectId.isValid(identifier) 
        ? await fileStorage.getProductById(identifier)
        : await fileStorage.getProductBySlug(identifier)
      
      if (!fileProduct) {
        return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
      }

      // Limpiar y normalizar el slug
      let slug = body.slug.trim().toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      if (!slug) {
        slug = body.name.trim().toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      }

      const productData: any = {
        name: body.name.trim(),
        slug: slug,
        description: body.description.trim(),
        price: Number(body.price),
        category: body.category || 'Anillos',
        tags: Array.isArray(body.tags) ? body.tags : [],
        images: Array.isArray(body.images) 
          ? body.images.map(img => normalizeImageUrl(img)).filter((img): img is string => img !== null)
          : [],
        stock: Number(body.stock) || 0,
        material: body.material || '',
        medidas: body.medidas || '',
        cierre: body.cierre || '',
        featured: body.featured || false,
      }

      if (body.isOnSale) {
        productData.isOnSale = true
        if (body.originalPrice) productData.originalPrice = Number(body.originalPrice)
        if (body.discountPrice) productData.discountPrice = Number(body.discountPrice)
      } else {
        productData.isOnSale = false
      }

      product = await fileStorage.updateProduct(fileProduct._id, productData)
      if (!product) {
        return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
      }
      console.log('✅ Producto actualizado en archivo (MongoDB no disponible)')
    } else {
      // Usar MongoDB
      product = await findProductByIdentifier(identifier)
      
      if (!product) {
        return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
      }

      // Si el slug cambió, verificar que no exista otro producto con ese slug
      if (body.slug && body.slug !== product.slug) {
        const existing = await Product.findOne({ slug: body.slug })
        if (existing && existing._id.toString() !== product._id.toString()) {
          return NextResponse.json(
            { error: 'Ya existe un producto con este slug' },
            { status: 400 }
          )
        }
      }

      const productData: any = {
        name: body.name.trim(),
        slug: body.slug.trim(),
        description: body.description.trim(),
        price: Number(body.price),
        category: body.category || 'Anillos',
        tags: Array.isArray(body.tags) ? body.tags : [],
        images: Array.isArray(body.images) 
          ? body.images.map(img => normalizeImageUrl(img)).filter((img): img is string => img !== null)
          : [],
        stock: Number(body.stock) || 0,
        material: body.material || '',
        medidas: body.medidas || '',
        cierre: body.cierre || '',
        featured: body.featured || false,
      }

      if (body.isOnSale) {
        productData.isOnSale = true
        if (body.originalPrice) productData.originalPrice = Number(body.originalPrice)
        if (body.discountPrice) productData.discountPrice = Number(body.discountPrice)
      } else {
        productData.isOnSale = false
        productData.originalPrice = undefined
        productData.discountPrice = undefined
      }

      Object.assign(product, productData)
      await product.save()
    }

    return NextResponse.json(product)
  } catch (error: any) {
    console.error('Error al actualizar producto', error)
    
    // Mensaje de error más descriptivo
    let errorMessage = 'No se pudo actualizar el producto'
    if (error.code === 11000) {
      errorMessage = 'Ya existe un producto con este slug'
    } else if (error.message) {
      errorMessage = error.message
    } else if (error.errors) {
      // Errores de validación de Mongoose
      const validationErrors = Object.values(error.errors).map((err: any) => err.message).join(', ')
      errorMessage = `Error de validación: ${validationErrors}`
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { identifier: string } }
) {
  let useFileStorage = false
  
  try {
    await connectToDatabase()
  } catch (error: any) {
    console.error('Error de conexión a MongoDB, usando almacenamiento en archivo:', error.message)
    useFileStorage = true
  }

  try {
    const { identifier } = params
    let success = false
    
    if (useFileStorage) {
      const productId = mongoose.Types.ObjectId.isValid(identifier) 
        ? identifier
        : (await fileStorage.getProductBySlug(identifier))?._id
      
      if (!productId) {
        return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
      }
      
      success = await fileStorage.deleteProduct(productId)
      console.log('✅ Producto eliminado de archivo (MongoDB no disponible)')
    } else {
      const product = await findProductByIdentifier(identifier)
      if (!product) {
        return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
      }
      await product.deleteOne()
      success = true
    }
    
    if (!success) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al eliminar producto', error)
    return NextResponse.json(
      { error: 'No se pudo eliminar el producto' },
      { status: 500 }
    )
  }
}

async function findProductByIdentifier(identifier: string) {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    return Product.findById(identifier)
  }

  return Product.findOne({ slug: identifier })
}

