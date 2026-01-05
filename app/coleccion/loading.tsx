export default function Loading() {
  return (
    <div className="min-h-screen bg-amaretto-white">
      <section className="bg-amaretto-beige py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-12 bg-amaretto-gray-light rounded animate-pulse"></div>
        </div>
      </section>
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-amaretto-beige rounded-lg h-96 animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}


