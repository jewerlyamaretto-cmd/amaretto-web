import { NextRequest, NextResponse } from 'next/server'
import { cloudinary } from '@/src/lib/cloudinary'

export const dynamic = 'force-dynamic'

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
        { error: 'No se recibieron archivos' },
        { status: 400 }
      )
    }

    const uploadedUrls: string[] = []

    for (const file of files) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        continue
      }

      // Validar tamaño (máximo 10MB por imagen)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        continue
      }

      try {
        // Convertir File a Buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Convertir Buffer a base64 string para Cloudinary
        const base64String = buffer.toString('base64')
        const dataURI = `data:${file.type};base64,${base64String}`

        // Generar nombre único para la imagen (solo el nombre, sin carpeta)
        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(2, 15)
        const fileName = `${timestamp}-${randomStr}`

        // Subir a Cloudinary
        // IMPORTANTE: Solo usar folder, NO incluir carpeta en public_id para evitar duplicación
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload(
            dataURI,
            {
              public_id: fileName, // Solo el nombre del archivo, sin carpeta
              folder: 'amaretto/productos', // La carpeta se especifica por separado
              resource_type: 'image',
              transformation: [
                { quality: 'auto' },
                { fetch_format: 'auto' }
              ]
            },
            (error, result) => {
              if (error) {
                console.error('Error en Cloudinary upload:', error)
                reject(error)
              } else {
                console.log('✅ Cloudinary upload exitoso')
                console.log('✅ secure_url:', result?.secure_url)
                console.log('✅ public_id:', result?.public_id)
                resolve(result)
              }
            }
          )
        }) as any

        // Guardar la URL segura (HTTPS) de Cloudinary
        if (uploadResult?.secure_url) {
          // Verificar que la URL no tenga la carpeta duplicada
          let finalUrl = uploadResult.secure_url
          
          // Si la URL tiene la carpeta duplicada, corregirla
          if (finalUrl.includes('amaretto/productos/amaretto/productos/')) {
            finalUrl = finalUrl.replace('amaretto/productos/amaretto/productos/', 'amaretto/productos/')
            console.log('⚠️ URL corregida (tenía carpeta duplicada):', finalUrl)
          }
          
          uploadedUrls.push(finalUrl)
          console.log('✅ URL final agregada:', finalUrl)
        } else {
          console.error('❌ Cloudinary no devolvió secure_url:', uploadResult)
        }
      } catch (error: any) {
        console.error('Error al subir archivo individual:', error)
        // Continuar con el siguiente archivo
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { error: 'No se pudieron subir las imágenes' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      files: uploadedUrls,
      count: uploadedUrls.length
    })
  } catch (error: any) {
    console.error('Error al subir archivos a Cloudinary:', error)
    return NextResponse.json(
      { error: error.message || 'Error al subir las imágenes a Cloudinary' },
      { status: 500 }
    )
  }
}

