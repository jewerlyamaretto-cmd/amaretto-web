import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/src/lib/db'
import { Order } from '@/src/models/Order'
import { Product } from '@/src/models/Product'

export async function GET() {
  await connectToDatabase()
  const orders = await Order.find().sort({ createdAt: -1 })
  return NextResponse.json(orders)
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const body = await request.json()
    const { items, customer, shippingAddress } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 })
    }

    const productIds = items.map((item: any) => item.productId)
    const products = await Product.find({ _id: { $in: productIds } })

    if (products.length !== items.length) {
      return NextResponse.json({ error: 'Algunos productos no existen' }, { status: 400 })
    }

    const itemsWithDetails = items.map((item: any) => {
      const product = products.find((p) => p._id.toString() === item.productId)
      if (!product) {
        throw new Error('Producto no disponible')
      }
      return {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      }
    })

    const subtotal = itemsWithDetails.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0
    )

    const shippingCost = 150
    const total = subtotal + shippingCost

    const order = await Order.create({
      items: itemsWithDetails,
      subtotal,
      shippingCost,
      total,
      customer,
      shippingAddress,
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error al crear orden', error)
    return NextResponse.json({ error: 'No se pudo crear la orden' }, { status: 500 })
  }
}

