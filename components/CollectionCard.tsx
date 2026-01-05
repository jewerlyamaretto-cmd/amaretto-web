import Link from 'next/link'

interface CollectionCardProps {
  name: string
  description: string
  image: string
  href: string
}

export default function CollectionCard({ name, description, image, href }: CollectionCardProps) {
  return (
    <Link href={href} className="group">
      <div className="bg-amaretto-beige rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
        {/* Imagen placeholder */}
        <div className="relative w-full h-48 bg-amaretto-gray-light flex items-center justify-center">
          <div className="text-amaretto-black/30 font-sans text-sm">
            {image || 'Imagen'}
          </div>
        </div>
        
        {/* Información */}
        <div className="p-6">
          <h3 className="font-serif text-xl font-bold text-amaretto-black mb-2 group-hover:text-amaretto-pink transition-colors duration-200">
            {name}
          </h3>
          <p className="text-sm text-amaretto-black/70 font-sans">
            {description}
          </p>
        </div>
      </div>
    </Link>
  )
}


