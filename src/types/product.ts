export interface ProductDTO {
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
}

