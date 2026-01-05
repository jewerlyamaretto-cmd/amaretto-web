import mongoose, { Schema, Document, Model } from 'mongoose'

interface IProductBase {
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
  isNew?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IProduct extends Omit<Document, 'isNew'>, IProductBase {}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    discountPrice: { type: Number },
    isOnSale: { type: Boolean, default: false },
    category: {
      type: String,
      required: true,
      enum: ['Anillos', 'Aretes', 'Collares', 'Pulseras'],
    },
    tags: [{ type: String }],
    images: {
      type: [String],
      default: [],
    },
    stock: { type: Number, default: 0 },
    material: { type: String, default: '' },
    medidas: { type: String, default: '' },
    cierre: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
)

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)

