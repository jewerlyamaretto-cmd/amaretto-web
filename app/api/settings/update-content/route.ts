import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/src/lib/db'
import { Settings } from '@/src/models/Settings'

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
  } catch (error: any) {
    console.error('Error de conexión a MongoDB:', error)
    return NextResponse.json(
      { 
        error: 'Error de conexión a MongoDB. Verifica que MONGODB_URI esté configurado en .env.local y que el servidor esté reiniciado.',
        details: error.message
      },
      { status: 500 }
    )
  }

  try {
    const newSettings = {
      aboutUs: `Nuestra marca nació en 2025 con una idea clara: ofrecer joyería de acero inoxidable que combine diseño, calidad y estilo para el día a día. Creemos que la joyería no solo es un accesorio, sino una forma de expresión personal, por eso cuidamos cada detalle en la selección de nuestras piezas.

Nos inspira crear una experiencia cercana, moderna y confiable para quienes buscan joyas versátiles, duraderas y atemporales. Apostamos por materiales resistentes, diseños actuales y procesos responsables, siempre pensando en ofrecer productos que puedan acompañarte en cualquier momento.`,

      mission: `Nuestra misión es ofrecer joyería de acero inoxidable de alta calidad, con diseños modernos y accesibles, que se adapten a diferentes estilos y ocasiones. Buscamos brindar una experiencia de compra confiable y agradable, manteniendo un compromiso con prácticas responsables y un enfoque consciente hacia el cuidado del entorno.`,

      vision: `Nuestra visión es consolidarnos como una marca de joyería reconocida por su estilo, calidad y responsabilidad, convirtiéndonos en una referencia para quienes buscan piezas duraderas, elegantes y alineadas con un consumo más consciente. Aspiramos a seguir creciendo, innovando y conectando con nuestra comunidad.`,

      returnPolicy: `Queremos que estés completamente satisfecho con tu compra. Si por alguna razón no estás conforme con tu pedido, puedes solicitar una devolución dentro de los primeros 7 días naturales posteriores a la recepción del producto.

Las piezas deben devolverse sin uso, en perfectas condiciones y con su empaque original. Por razones de higiene, no se aceptan devoluciones en aretes si estos han sido usados.

Para iniciar el proceso de devolución, contáctanos a través de nuestros medios oficiales y te indicaremos los pasos a seguir. Una vez recibido y revisado el producto, se realizará el cambio o reembolso correspondiente según el caso.`,
    }

    let settings = await Settings.findOne()
    
    if (!settings) {
      settings = await Settings.create(newSettings)
    } else {
      Object.assign(settings, newSettings)
      await settings.save()
    }

    return NextResponse.json({ 
      success: true,
      message: 'Contenido actualizado exitosamente',
      settings: {
        aboutUs: settings.aboutUs.substring(0, 50) + '...',
        mission: settings.mission.substring(0, 50) + '...',
        vision: settings.vision.substring(0, 50) + '...',
        returnPolicy: settings.returnPolicy.substring(0, 50) + '...',
      }
    })
  } catch (error: any) {
    console.error('Error al actualizar settings:', error)
    return NextResponse.json(
      { 
        error: 'Error al actualizar el contenido',
        details: error.message
      },
      { status: 500 }
    )
  }
}


