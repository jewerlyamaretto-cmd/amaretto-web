import { NextRequest, NextResponse } from 'next/server'
import { cloudinary } from '@/src/lib/cloudinary'

export async function GET(request: NextRequest) {
  try {
    // Validar configuración de Cloudinary
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: 'Cloudinary no está configurado' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || 'amaretto/productos'
    const maxResults = parseInt(searchParams.get('max_results') || '100')

    // Listar recursos de Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.search
        .expression(`folder:${folder}`)
        .max_results(maxResults)
        .execute()
        .then((result) => resolve(result))
        .catch((error) => reject(error))
    }) as any

    // Formatear resultados
    const images = result.resources?.map((resource: any) => ({
      public_id: resource.public_id,
      secure_url: resource.secure_url,
      url: resource.url,
      format: resource.format,
      width: resource.width,
      height: resource.height,
      bytes: resource.bytes,
      created_at: resource.created_at,
    })) || []

    return NextResponse.json({
      success: true,
      images,
      total: images.length,
    })
  } catch (error: any) {
    console.error('Error al listar imágenes de Cloudinary:', error)
    return NextResponse.json(
      { error: error.message || 'Error al listar las imágenes' },
      { status: 500 }
    )
  }
}


