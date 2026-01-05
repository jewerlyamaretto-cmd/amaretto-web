'use client'

import { useState } from 'react'
import { useCart } from '@/src/context/CartContext'
import { ProductDTO } from '@/src/types/product'

interface AddToCartButtonProps {
  product: ProductDTO
  quantity?: number
  className?: string
}

export default function AddToCartButton({ product, quantity = 1, className = "" }: AddToCartButtonProps) {
  const { addItem, setIsOpen } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = () => {
    setIsAdding(true)
    addItem(product, quantity)
    
    // Mostrar mini-carrito después de agregar
    setTimeout(() => {
      setIsOpen(true)
      setIsAdding(false)
    }, 300)
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding || product.stock === 0}
      className={`w-full bg-amaretto-black text-white font-sans font-medium px-6 py-3 rounded-lg hover:bg-amaretto-black/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isAdding ? 'Agregando...' : product.stock === 0 ? 'Agotado' : 'Agregar al carrito'}
    </button>
  )
}

