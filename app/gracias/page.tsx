'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/src/context/CartContext'

export default function Gracias() {
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    const order = searchParams.get('orderId')
    setOrderId(order)
    clearCart()
  }, [searchParams, clearCart])

  return (
    <div className="min-h-screen bg-amaretto-white">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Ícono de éxito */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Título */}
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-amaretto-black mb-4">
            ¡Gracias por tu compra!
          </h1>

          {/* Mensaje */}
          <p className="text-lg text-amaretto-black/70 font-sans mb-8 max-w-2xl mx-auto">
            Hemos recibido tu pedido. Nuestro equipo lo revisará y te enviaremos un correo o mensaje de WhatsApp
            con los detalles para completar el pago y coordinar el envío.
          </p>

          {orderId && (
            <div className="bg-amaretto-beige rounded-lg p-4 mb-8">
              <p className="text-sm text-amaretto-black/60 font-sans mb-2">ID de pedido:</p>
              <p className="text-sm font-mono text-amaretto-black font-sans break-all">{orderId}</p>
            </div>
          )}

          {/* Información adicional */}
          <div className="bg-amaretto-beige rounded-lg p-6 mb-8 text-left max-w-2xl mx-auto">
            <h2 className="font-serif text-xl font-bold text-amaretto-black mb-4">
              ¿Qué sigue?
            </h2>
            <ul className="space-y-3 font-sans text-amaretto-black/70">
              <li className="flex items-start gap-3">
                <span className="text-amaretto-pink font-bold">1.</span>
                <span>Nos pondremos en contacto contigo para confirmar tu pedido y coordinar el pago.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amaretto-pink font-bold">2.</span>
                <span>
                  Procesaremos tu pedido y te notificaremos cuando sea enviado.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amaretto-pink font-bold">3.</span>
                <span>
                  Recibirás un número de seguimiento para rastrear tu envío.
                </span>
              </li>
            </ul>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/coleccion"
              className="inline-block bg-amaretto-black text-white font-sans font-medium px-8 py-4 rounded-lg hover:bg-amaretto-black/90 transition-colors duration-200"
            >
              Continuar comprando
            </Link>
            <Link
              href="/"
              className="inline-block bg-amaretto-beige text-amaretto-black font-sans font-medium px-8 py-4 rounded-lg hover:bg-amaretto-gray-light transition-colors duration-200"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}


