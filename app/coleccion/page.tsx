import { Suspense } from 'react'
import ColeccionContent from './ColeccionContent'
import Loading from './loading'

export default function Coleccion() {
  return (
    <div className="min-h-screen bg-amaretto-white">
      <Suspense fallback={<Loading />}>
        <ColeccionContent />
      </Suspense>
    </div>
  )
}
