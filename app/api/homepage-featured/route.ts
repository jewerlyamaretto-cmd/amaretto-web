import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/src/lib/db'
import { HomepageFeatured } from '@/src/models/HomepageFeatured'
import { HomepageFeaturedDTO } from '@/src/types/homepage-featured'

export const dynamic = 'force-dynamic'

// GET - Obtener productos destacados
export async function GET() {
  try {
    await connectToDatabase()

    const featured = await HomepageFeatured.findOne().lean()

    if (!featured) {
      // Crear registro vacío si no existe
      const newFeatured = await HomepageFeatured.create({})
      return NextResponse.json({
        ringsProductId: newFeatured.ringsProductId || null,
        earringsProductId: newFeatured.earringsProductId || null,
        necklacesProductId: newFeatured.necklacesProductId || null,
        braceletsProductId: newFeatured.braceletsProductId || null,
      })
    }

    return NextResponse.json({
      ringsProductId: featured.ringsProductId || null,
      earringsProductId: featured.earringsProductId || null,
      necklacesProductId: featured.necklacesProductId || null,
      braceletsProductId: featured.braceletsProductId || null,
    })
  } catch (error) {
    console.error('Error al obtener productos destacados:', error)
    return NextResponse.json(
      { error: 'Error al obtener productos destacados' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar productos destacados
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase()

    const body: HomepageFeaturedDTO = await request.json()

    // Actualizar o crear
    const featured = await HomepageFeatured.findOneAndUpdate(
      {},
      {
        ringsProductId: body.ringsProductId || null,
        earringsProductId: body.earringsProductId || null,
        necklacesProductId: body.necklacesProductId || null,
        braceletsProductId: body.braceletsProductId || null,
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({
      success: true,
      data: {
        ringsProductId: featured.ringsProductId || null,
        earringsProductId: featured.earringsProductId || null,
        necklacesProductId: featured.necklacesProductId || null,
        braceletsProductId: featured.braceletsProductId || null,
      },
    })
  } catch (error) {
    console.error('Error al actualizar productos destacados:', error)
    return NextResponse.json(
      { error: 'Error al actualizar productos destacados' },
      { status: 500 }
    )
  }
}

