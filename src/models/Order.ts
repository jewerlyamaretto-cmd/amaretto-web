import mongoose, { Schema, Document, Model } from 'mongoose'
import { IProduct } from './Product'

export interface IOrderItem {
  product: IProduct['_id']
  name: string
  price: number
  quantity: number
}

export interface IOrder extends Document {
  items: IOrderItem[]
  subtotal: number
  shippingCost: number
  total: number
  customer: {
    nombre: string
    email: string
    telefono: string
  }
  shippingAddress: {
    direccion: string
    ciudad: string
    estado: string
    codigoPostal: string
    pais: string
  }
  status: 'pendiente' | 'confirmado' | 'enviado' | 'entregado'
  notes?: string
}

const OrderSchema = new Schema<IOrder>(
  {
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 150 },
    total: { type: Number, required: true },
    customer: {
      nombre: { type: String, required: true },
      email: { type: String, required: true },
      telefono: { type: String, required: true },
    },
    shippingAddress: {
      direccion: { type: String, required: true },
      ciudad: { type: String, required: true },
      estado: { type: String, required: true },
      codigoPostal: { type: String, required: true },
      pais: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ['pendiente', 'confirmado', 'enviado', 'entregado'],
      default: 'pendiente',
    },
    notes: { type: String },
  },
  { timestamps: true }
)

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)

