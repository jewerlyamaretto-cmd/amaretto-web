import { NextRequest, NextResponse } from 'next/server'
import { cloudinary } from '@/src/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    // Validar configuración de Cloudinary
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: 'Cloudinary no está configurado. Por favor, configura las variables de entorno CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No se proporcionaron archivos' },
        { status: 400 }
      )
    }

    if (files.length > 5) {
      return NextResponse.json(
        { error: 'Máximo 5 imágenes permitidas' },
        { status: 400 }
      )
    }

    const uploadedFiles: string[] = []

    for (const file of files) {
      // Validar tipo de archivo - aceptar cualquier formato de imagen
      const validImageTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'image/svg+xml', 'image/bmp', 'image/tiff', 'image/ico', 'image/heic',
        'image/heif', 'image/avif'
      ]
      
      // Verificar extensión del archivo como respaldo
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || ''
      const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico', 'heic', 'heif', 'avif']
      
      if (!file.type.startsWith('image/') && !validExtensions.includes(fileExtension)) {
        return NextResponse.json(
          { error: `El archivo ${file.name} no es una imagen válida. Formatos soportados: JPG, PNG, GIF, WEBP, SVG, BMP, TIFF, ICO, HEIC, HEIF, AVIF` },
          { status: 400 }
        )
      }

      // Validar tamaño (máximo 20MB por imagen - Cloudinary permite más)
      if (file.size > 20 * 1024 * 1024) {
        return NextResponse.json(
          { error: `La imagen ${file.name} es demasiado grande. Máximo 20MB` },
          { status: 400 }
        )
      }

      // Convertir File a Buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Convertir Buffer a base64 string para Cloudinary
      const base64String = buffer.toString('base64')
      const dataURI = `data:${file.type};base64,${base64String}`

      // Generar nombre único para la carpeta en Cloudinary
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 15)
      const publicId = `amaretto/productos/${timestamp}-${randomStr}`

      // Subir a Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          dataURI,
          {
            public_id: publicId,
            folder: 'amaretto/productos',
            resource_type: 'image',
            transformation: [
              { quality: 'auto' },
              { fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
      }) as any

      // Guardar la URL segura (HTTPS) de Cloudinary
      uploadedFiles.push(uploadResult.secure_url)
    }

    // Generar URLs completas para cada archivo (ya son URLs completas de Cloudinary)
    const filesWithUrls = uploadedFiles.map((url) => ({
      path: url,
      url: url,
    }))

    return NextResponse.json({ 
      success: true, 
      files: uploadedFiles, // URLs completas de Cloudinary
      filesWithUrls: filesWithUrls,
      message: `${uploadedFiles.length} imagen(es) subida(s) exitosamente`
    })
  } catch (error: any) {
    console.error('Error al subir archivos a Cloudinary:', error)
    return NextResponse.json(
      { error: error.message || 'Error al subir las imágenes a Cloudinary' },
      { status: 500 }
    )
  }
}

