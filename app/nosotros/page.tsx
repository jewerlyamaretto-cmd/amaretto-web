'use client'

import { useEffect, useState } from 'react'
import { SettingsDTO } from '@/src/types/settings'

export default function Nosotros() {
  const [settings, setSettings] = useState<SettingsDTO>({
    phone: '',
    email: '',
    address: '',
    instagram: '',
    facebook: '',
    whatsapp: '',
    aboutUs: '',
    mission: '',
    vision: '',
    businessHours: '',
    shippingInfo: '',
    returnPolicy: '',
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings', { cache: 'no-store' })
        const data = await res.json()
        setSettings(data)
      } catch (err) {
        console.error('Error al cargar settings:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSettings()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-amaretto-black/60 font-sans">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-amaretto-white">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-amaretto-black text-center mb-12">
          Nosotros
        </h1>
        
        {settings.aboutUs && (
          <div className="mb-12">
            <h2 className="font-serif text-2xl font-semibold text-amaretto-black mb-4">
              Nuestra Historia
            </h2>
            <div 
              className="font-sans text-amaretto-black/70 leading-relaxed whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: settings.aboutUs.replace(/\n/g, '<br />') }}
            />
          </div>
        )}

        {settings.mission && (
          <div className="mb-12 bg-amaretto-beige rounded-lg p-8">
            <h2 className="font-serif text-2xl font-semibold text-amaretto-black mb-4">
              Nuestra Misión
            </h2>
            <p className="font-sans text-amaretto-black/70 leading-relaxed whitespace-pre-line">
              {settings.mission}
            </p>
          </div>
        )}

        {settings.vision && (
          <div className="mb-12">
            <h2 className="font-serif text-2xl font-semibold text-amaretto-black mb-4">
              Nuestra Visión
            </h2>
            <p className="font-sans text-amaretto-black/70 leading-relaxed whitespace-pre-line">
              {settings.vision}
            </p>
          </div>
        )}

        {!settings.aboutUs && !settings.mission && !settings.vision && (
          <p className="font-sans text-center text-amaretto-black/70 max-w-2xl mx-auto">
            El contenido de esta página se puede editar desde el panel de administración.
          </p>
        )}
      </section>
    </div>
  )
}


