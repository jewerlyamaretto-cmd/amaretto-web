import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/src/lib/db'
import { Settings } from '@/src/models/Settings'

export async function GET() {
  // Valores por defecto actualizados
  const defaultSettings = {
    phone: '+52 614 192 0272',
    email: 'jewerlyamaretto@gmail.com',
    address: 'México',
    instagram: 'https://www.instagram.com/amarettojoyeria',
    facebook: 'https://www.facebook.com/share/1DMdpx8wrg/',
    whatsapp: '526141920272',
    aboutUs: `Nuestra marca nació en 2025 con una idea clara: ofrecer joyería de acero inoxidable que combine diseño, calidad y estilo para el día a día. Creemos que la joyería no solo es un accesorio, sino una forma de expresión personal, por eso cuidamos cada detalle en la selección de nuestras piezas.

Nos inspira crear una experiencia cercana, moderna y confiable para quienes buscan joyas versátiles, duraderas y atemporales. Apostamos por materiales resistentes, diseños actuales y procesos responsables, siempre pensando en ofrecer productos que puedan acompañarte en cualquier momento.`,
    mission: `Nuestra misión es ofrecer joyería de acero inoxidable de alta calidad, con diseños modernos y accesibles, que se adapten a diferentes estilos y ocasiones. Buscamos brindar una experiencia de compra confiable y agradable, manteniendo un compromiso con prácticas responsables y un enfoque consciente hacia el cuidado del entorno.`,
    vision: `Nuestra visión es consolidarnos como una marca de joyería reconocida por su estilo, calidad y responsabilidad, convirtiéndonos en una referencia para quienes buscan piezas duraderas, elegantes y alineadas con un consumo más consciente. Aspiramos a seguir creciendo, innovando y conectando con nuestra comunidad.`,
    businessHours: 'Lunes a Viernes: 9:00 AM - 6:00 PM',
    shippingInfo: 'Envíos a todo México',
    returnPolicy: `Queremos que estés completamente satisfecho con tu compra. Si por alguna razón no estás conforme con tu pedido, puedes solicitar una devolución dentro de los primeros 7 días naturales posteriores a la recepción del producto.

Las piezas deben devolverse sin uso, en perfectas condiciones y con su empaque original. Por razones de higiene, no se aceptan devoluciones en aretes si estos han sido usados.

Para iniciar el proceso de devolución, contáctanos a través de nuestros medios oficiales y te indicaremos los pasos a seguir. Una vez recibido y revisado el producto, se realizará el cambio o reembolso correspondiente según el caso.`,
  }

  try {
    await connectToDatabase()
  } catch (error: any) {
    console.error('Error de conexión a MongoDB:', error)
    // Devolver valores por defecto actualizados si no hay conexión
    return NextResponse.json(defaultSettings)
  }

  try {
    let settings = await Settings.findOne()
    
    if (!settings) {
      // Crear settings con valores por defecto actualizados si no existen
      settings = await Settings.create({
        aboutUs: defaultSettings.aboutUs,
        mission: defaultSettings.mission,
        vision: defaultSettings.vision,
        returnPolicy: defaultSettings.returnPolicy,
      })
    } else {
      // Si existe pero está vacío, actualizar con los valores por defecto
      const needsUpdate = !settings.aboutUs || !settings.mission || !settings.vision || !settings.returnPolicy
      if (needsUpdate) {
        if (!settings.aboutUs) settings.aboutUs = defaultSettings.aboutUs
        if (!settings.mission) settings.mission = defaultSettings.mission
        if (!settings.vision) settings.vision = defaultSettings.vision
        if (!settings.returnPolicy) settings.returnPolicy = defaultSettings.returnPolicy
        await settings.save()
      }
    }
    
    return NextResponse.json(settings)
  } catch (error: any) {
    console.error('Error al obtener settings:', error)
    // Si hay error, devolver valores por defecto
    return NextResponse.json(defaultSettings)
  }
}

export async function PUT(request: NextRequest) {
  // Verificar primero si MONGODB_URI está configurado
  const mongoUri = process.env.MONGODB_URI
  
  if (!mongoUri || mongoUri.trim() === '') {
    console.error('❌ MONGODB_URI no está configurado en process.env')
    return NextResponse.json(
      { 
        error: 'MONGODB_URI no está configurado. El servidor no está leyendo las variables de entorno. Por favor:\n\n1. Verifica que el archivo .env.local esté en la raíz del proyecto\n2. Reinicia el servidor completamente (detén con Ctrl+C y vuelve a iniciar con npm run dev)\n3. Asegúrate de que MONGODB_URI esté en el archivo .env.local'
      },
      { status: 500 }
    )
  }

  try {
    await connectToDatabase()
  } catch (error: any) {
    console.error('❌ Error de conexión a MongoDB:', error)
    console.error('MONGODB_URI configurado:', mongoUri ? `Sí (${mongoUri.substring(0, 30)}...)` : 'No')
    
    const errorMessage = error.message || 'Error de conexión a la base de datos'
    
    // Mensaje más descriptivo
    let userMessage = 'Error de conexión a la base de datos. '
    
    if (errorMessage.includes('MONGODB_URI no está configurado')) {
      userMessage = 'MONGODB_URI no está configurado. Por favor, agrega tu cadena de conexión de MongoDB en el archivo .env.local y reinicia el servidor (npm run dev).'
    } else if (errorMessage.includes('Formato de MONGODB_URI inválido')) {
      userMessage = 'El formato de MONGODB_URI es incorrecto. Debe comenzar con "mongodb://" o "mongodb+srv://"'
    } else if (errorMessage.includes('authentication failed') || errorMessage.includes('bad auth')) {
      userMessage = 'Error de autenticación con MongoDB. Las credenciales (usuario/contraseña) en tu MONGODB_URI son incorrectas. Por favor:\n\n1. Ve a MongoDB Atlas (https://cloud.mongodb.com)\n2. Verifica el usuario y contraseña de tu base de datos\n3. Si la contraseña cambió, actualiza MONGODB_URI en .env.local\n4. Reinicia el servidor (npm run dev)'
    } else if (errorMessage.includes('timeout') || errorMessage.includes('ECONNREFUSED')) {
      userMessage = 'No se pudo conectar a MongoDB. Verifica que:\n1. Tu cluster esté activo en MongoDB Atlas\n2. Tu IP esté en la lista blanca de MongoDB Atlas\n3. Las credenciales sean correctas'
    } else {
      userMessage = `Error de conexión: ${errorMessage}`
    }
    
    return NextResponse.json(
      { error: userMessage },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()
    
    // Validar que el body tenga datos
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      )
    }
    
    let settings = await Settings.findOne()
    
    if (!settings) {
      // Crear si no existe
      try {
        settings = await Settings.create(body)
      } catch (createError: any) {
        console.error('Error al crear settings:', createError)
        return NextResponse.json(
          { 
            error: `Error al crear la configuración: ${createError.message || 'Error desconocido'}` 
          },
          { status: 500 }
        )
      }
    }
    
    // Verificar que settings existe antes de actualizar
    if (settings) {
      // Actualizar solo los campos que vienen en el body
      Object.keys(body).forEach((key) => {
        if (body[key] !== undefined) {
          ;(settings as any)[key] = body[key]
        }
      })
      
      try {
        await settings.save()
      } catch (saveError: any) {
        console.error('Error al guardar settings:', saveError)
        
        // Mensaje de error más descriptivo
        let errorMessage = 'Error al guardar la configuración'
        if (saveError.errors) {
          const validationErrors = Object.values(saveError.errors)
            .map((err: any) => `${err.path}: ${err.message}`)
            .join(', ')
          errorMessage = `Error de validación: ${validationErrors}`
        } else if (saveError.message) {
          errorMessage = saveError.message
        }
        
        return NextResponse.json(
          { error: errorMessage },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(settings)
  } catch (error: any) {
    console.error('Error al actualizar settings:', error)
    console.error('Stack:', error.stack)
    
    return NextResponse.json(
      { 
        error: error.message || 'Error al actualizar la configuración',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

