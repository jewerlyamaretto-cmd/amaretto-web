'use client'

import Link from 'next/link'
import { useCart } from '@/src/context/CartContext'

export default function MiniCarrito() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, getSubtotal, getTotal } = useCart()

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => setIsOpen(false)}
      />

      {/* Mini Carrito */}
      <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-full sm:w-96 bg-amaretto-white shadow-xl z-50 overflow-y-auto">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-amaretto-gray-light">
            <h2 className="font-serif text-xl font-bold text-amaretto-black">
              Carrito de Compras
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-amaretto-black/60 hover:text-amaretto-black transition-colors duration-200"
              aria-label="Cerrar carrito"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-amaretto-black/60 font-sans mb-4">
                  Tu carrito está vacío
                </p>
                <Link
                  href="/coleccion"
                  onClick={() => setIsOpen(false)}
                  className="inline-block bg-amaretto-black text-white font-sans font-medium px-6 py-3 rounded-lg hover:bg-amaretto-black/90 transition-colors duration-200"
                >
                  Ver colección
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.product._id}
                    className="flex gap-4 pb-4 border-b border-amaretto-gray-light last:border-0"
                  >
                    {/* Imagen */}
                    <div className="w-20 h-20 bg-amaretto-beige rounded-lg flex-shrink-0 flex items-center justify-center">
                      <span className="text-amaretto-black/30 font-sans text-xs">
                        {item.product.images && item.product.images[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              const parent = e.currentTarget.parentElement
                              if (parent) {
                                parent.innerHTML = '<span class="text-amaretto-black/30 font-sans text-xs">Imagen</span>'
                              }
                            }}
                          />
                        ) : (
                          <span className="text-amaretto-black/30 font-sans text-xs">Imagen</span>
                        )}
                      </span>
                    </div>

                    {/* Información */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/producto/${item.product.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="block"
                      >
                        <h3 className="font-serif text-sm font-semibold text-amaretto-black mb-1 hover:text-amaretto-pink transition-colors duration-200 truncate">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-amaretto-black/60 font-sans mb-2">
                        ${item.product.price.toLocaleString('es-MX')} MXN
                      </p>

                      {/* Cantidad */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center border border-amaretto-gray-light rounded text-amaretto-black hover:bg-amaretto-beige transition-colors duration-200"
                          aria-label="Disminuir cantidad"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19.5 12h-15"
                            />
                          </svg>
                        </button>
                        <span className="text-sm font-sans text-amaretto-black w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center border border-amaretto-gray-light rounded text-amaretto-black hover:bg-amaretto-beige transition-colors duration-200"
                          aria-label="Aumentar cantidad"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 4.5v15m7.5-7.5h-15"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Subtotal y eliminar */}
                    <div className="flex flex-col items-end justify-between">
                      <p className="text-sm font-sans font-medium text-amaretto-black">
                        ${(item.product.price * item.quantity).toLocaleString('es-MX')} MXN
                      </p>
                      <button
                        onClick={() => removeItem(item.product._id)}
                        className="text-amaretto-black/40 hover:text-amaretto-pink transition-colors duration-200"
                        aria-label="Eliminar producto"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer con resumen */}
          {items.length > 0 && (
            <div className="border-t border-amaretto-gray-light p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-sans">
                  <span className="text-amaretto-black/60">Subtotal:</span>
                  <span className="text-amaretto-black font-medium">
                    ${getSubtotal().toLocaleString('es-MX')} MXN
                  </span>
                </div>
                <div className="flex justify-between text-sm font-sans">
                  <span className="text-amaretto-black/60">Envío estimado:</span>
                  <span className="text-amaretto-black font-medium">$150 MXN</span>
                </div>
                <div className="flex justify-between text-lg font-sans pt-2 border-t border-amaretto-gray-light">
                  <span className="text-amaretto-black font-bold">Total:</span>
                  <span className="text-amaretto-black font-bold">
                    ${getTotal().toLocaleString('es-MX')} MXN
                  </span>
                </div>
              </div>
              <Link
                href="/carrito"
                onClick={() => setIsOpen(false)}
                className="block w-full bg-amaretto-black text-white font-sans font-medium px-6 py-3 rounded-lg hover:bg-amaretto-black/90 transition-colors duration-200 text-center"
              >
                Ver carrito completo
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

