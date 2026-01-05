import { Suspense } from 'react'
import NuevoContent from './NuevoContent'

export default function NuevoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <NuevoContent />
    </Suspense>
  )
}

