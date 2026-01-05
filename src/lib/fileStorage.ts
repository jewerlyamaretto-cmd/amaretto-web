import { writeFile, readFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const DATA_DIR = join(process.cwd(), 'data')
const PRODUCTS_FILE = join(DATA_DIR, 'products.json')

export interface FileProduct {
  _id: string
  name: string
  slug: string
  description: string
  price: number
  originalPrice?: number
  discountPrice?: number
  isOnSale?: boolean
  category: 'Anillos' | 'Aretes' | 'Collares' | 'Pulseras'
  tags?: string[]
  images: string[]
  stock: number
  material: string
  medidas: string
  cierre: string
  featured?: boolean
  createdAt: string
  updatedAt: string
}

async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true })
  }
}

async function readProducts(): Promise<FileProduct[]> {
  try {
    await ensureDataDir()
    if (!existsSync(PRODUCTS_FILE)) {
      return []
    }
    const data = await readFile(PRODUCTS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error al leer productos del archivo:', error)
    return []
  }
}

async function writeProducts(products: FileProduct[]): Promise<void> {
  try {
    await ensureDataDir()
    await writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error al escribir productos al archivo:', error)
    throw error
  }
}

export async function getAllProducts(): Promise<FileProduct[]> {
  return await readProducts()
}

export async function getProductBySlug(slug: string): Promise<FileProduct | null> {
  const products = await readProducts()
  return products.find(p => p.slug === slug) || null
}

export async function getProductById(id: string): Promise<FileProduct | null> {
  const products = await readProducts()
  return products.find(p => p._id === id) || null
}

export async function createProduct(productData: Omit<FileProduct, '_id' | 'createdAt' | 'updatedAt'>): Promise<FileProduct> {
  const products = await readProducts()
  
  // Verificar que no exista un producto con el mismo slug
  if (products.some(p => p.slug === productData.slug)) {
    throw new Error('Ya existe un producto con este slug')
  }
  
  const newProduct: FileProduct = {
    ...productData,
    _id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  products.push(newProduct)
  await writeProducts(products)
  return newProduct
}

export async function updateProduct(id: string, updates: Partial<FileProduct>): Promise<FileProduct | null> {
  const products = await readProducts()
  const index = products.findIndex(p => p._id === id)
  
  if (index === -1) {
    return null
  }
  
  // Verificar slug único si se está actualizando
  if (updates.slug && updates.slug !== products[index].slug) {
    if (products.some(p => p.slug === updates.slug && p._id !== id)) {
      throw new Error('Ya existe un producto con este slug')
    }
  }
  
  products[index] = {
    ...products[index],
    ...updates,
    _id: products[index]._id, // No permitir cambiar el ID
    updatedAt: new Date().toISOString(),
  }
  
  await writeProducts(products)
  return products[index]
}

export async function deleteProduct(id: string): Promise<boolean> {
  const products = await readProducts()
  const filtered = products.filter(p => p._id !== id)
  
  if (filtered.length === products.length) {
    return false // No se encontró el producto
  }
  
  await writeProducts(filtered)
  return true
}


