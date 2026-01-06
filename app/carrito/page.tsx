'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useCart } from '@/src/context/CartContext'

export default function Carrito() {
  const { items, removeItem, updateQuantity, getSubtotal, getTotal, clearCart } = useCart()
  const whatsappNumber = '526141920272'

  const orderSummary = useMemo(() => {
    return items
      .map(
        (item) =>
          `• ${item.product.name} x${item.quantity} - $${(item.product.price * item.quantity).toLocaleString(
            'es-MX'
          )} MXN`
      )
      .join('\n')
  }, [items])

  const whatsappMessage = encodeURIComponent(
    `Hola, me interesa confirmar mi pedido:\n\n${orderSummary}\n\nTotal: $${getTotal().toLocaleString(
      'es-MX'
    )} MXN\n\n(El envío se coordinará al confirmar el pedido)`
  )
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-amaretto-white">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-amaretto-black text-center mb-8">
            Carrito de Compras
          </h1>
          <div className="text-center py-16">
            <p className="text-amaretto-black/60 font-sans text-lg mb-6">
              Tu carrito está vacío
            </p>
            <Link
              href="/coleccion"
              className="inline-block bg-amaretto-black text-white font-sans font-medium px-8 py-4 rounded-lg hover:bg-amaretto-black/90 transition-colors duration-200"
            >
              Ver colección
            </Link>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-amaretto-white">
      {/* Header */}
      <section className="bg-amaretto-beige py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-amaretto-black text-center mb-4">
            Carrito de Compras
          </h1>
          <p className="text-center text-amaretto-black/70 font-sans max-w-2xl mx-auto">
            Revisa tu selección y envíanos tu pedido por WhatsApp. Coordinaremos el pago y el envío directamente contigo.
          </p>
        </div>
      </section>

      {/* Contenido */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de productos */}
            <div className="lg:col-span-2 space-y-6">
              {/* Botón limpiar carrito */}
              <div className="flex justify-end">
                <button
                  onClick={clearCart}
                  className="text-sm text-amaretto-black/60 hover:text-amaretto-pink font-sans transition-colors duration-200"
                >
                  Limpiar carrito
                </button>
              </div>

              {/* Items */}
              {items.map((item) => (
                <div
                  key={item.product._id}
                  className="flex flex-col sm:flex-row gap-6 p-6 border border-amaretto-gray-light rounded-lg bg-amaretto-white"
                >
                  {/* Imagen */}
                  <Link
                    href={`/producto/${item.product.slug}`}
                    className="w-full sm:w-32 h-32 bg-amaretto-beige rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
                  >
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
                      <span className="text-amaretto-black/30 font-sans text-xs">
                        Imagen
                      </span>
                    )}
                  </Link>

                  {/* Información */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/producto/${item.product.slug}`}
                      className="block mb-2"
                    >
                      <h3 className="font-serif text-xl font-bold text-amaretto-black hover:text-amaretto-pink transition-colors duration-200 mb-1">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-amaretto-black/60 font-sans mb-2">
                        {item.product.category}
                      </p>
                    </Link>
                    <p className="text-lg font-sans font-medium text-amaretto-black mb-4">
                      ${item.product.price.toLocaleString('es-MX')} MXN
                    </p>

                    {/* Cantidad */}
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-sans text-amaretto-black/60">
                        Cantidad:
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center border border-amaretto-gray-light rounded text-amaretto-black hover:bg-amaretto-beige transition-colors duration-200"
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
                        <span className="text-base font-sans text-amaretto-black w-10 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border border-amaretto-gray-light rounded text-amaretto-black hover:bg-amaretto-beige transition-colors duration-200"
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
                  </div>

                  {/* Subtotal y eliminar */}
                  <div className="flex flex-col items-end justify-between sm:w-32">
                    <p className="text-lg font-sans font-bold text-amaretto-black mb-4">
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
                        className="w-6 h-6"
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

            {/* Resumen */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-amaretto-beige rounded-lg p-6 space-y-4">
                <h2 className="font-serif text-2xl font-bold text-amaretto-black mb-2">
                  Resumen de tu selección
                </h2>
                <p className="text-sm font-sans text-amaretto-black/70">
                  No realizamos pagos en línea por ahora. Al enviarnos tu pedido por WhatsApp confirmaremos stock, coordinaremos el pago y el envío contigo.
                </p>

                <div className="space-y-3 pb-4 border-b border-amaretto-gray-light">
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-amaretto-black/60">Total:</span>
                    <span className="text-amaretto-black font-medium">
                      ${getSubtotal().toLocaleString('es-MX')} MXN
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-sans pt-4 border-t border-amaretto-gray-light">
                  <span className="text-amaretto-black font-bold">Total:</span>
                  <span className="text-amaretto-black font-bold">
                    ${getTotal().toLocaleString('es-MX')} MXN
                  </span>
                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-[#25D366] text-white font-sans font-medium px-6 py-4 rounded-lg hover:bg-[#1ebe57] transition-colors duration-200 text-center mt-6"
                >
                  Enviar pedido por WhatsApp
                </a>

                <Link
                  href="/coleccion"
                  className="block w-full text-center text-amaretto-black/60 hover:text-amaretto-pink font-sans text-sm transition-colors duration-200 mt-4"
                >
                  Continuar comprando
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
