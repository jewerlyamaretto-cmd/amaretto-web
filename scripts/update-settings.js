/**
 * Script para actualizar los settings de la aplicación
 * Ejecutar con: node scripts/update-settings.js
 */

require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI no está configurado en .env.local')
  process.exit(1)
}

const SettingsSchema = new mongoose.Schema({
  phone: { type: String, default: '+52 614 192 0272' },
  email: { type: String, default: 'jewerlyamaretto@gmail.com' },
  address: { type: String, default: 'México' },
  instagram: { type: String, default: 'https://www.instagram.com/amarettojoyeria' },
  facebook: { type: String, default: 'https://www.facebook.com/share/1DMdpx8wrg/' },
  whatsapp: { type: String, default: '526141920272' },
  aboutUs: { type: String, default: '' },
  mission: { type: String, default: '' },
  vision: { type: String, default: '' },
  businessHours: { type: String, default: 'Lunes a Viernes: 9:00 AM - 6:00 PM' },
  shippingInfo: { type: String, default: 'Envíos a todo México' },
  returnPolicy: { type: String, default: '' },
}, {
  timestamps: true,
})

const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema)

const newSettings = {
  aboutUs: `Nuestra marca nació en 2025 con una idea clara: ofrecer joyería de acero inoxidable que combine diseño, calidad y estilo para el día a día. Creemos que la joyería no solo es un accesorio, sino una forma de expresión personal, por eso cuidamos cada detalle en la selección de nuestras piezas.

Nos inspira crear una experiencia cercana, moderna y confiable para quienes buscan joyas versátiles, duraderas y atemporales. Apostamos por materiales resistentes, diseños actuales y procesos responsables, siempre pensando en ofrecer productos que puedan acompañarte en cualquier momento.`,

  mission: `Nuestra misión es ofrecer joyería de acero inoxidable de alta calidad, con diseños modernos y accesibles, que se adapten a diferentes estilos y ocasiones. Buscamos brindar una experiencia de compra confiable y agradable, manteniendo un compromiso con prácticas responsables y un enfoque consciente hacia el cuidado del entorno.`,

  vision: `Nuestra visión es consolidarnos como una marca de joyería reconocida por su estilo, calidad y responsabilidad, convirtiéndonos en una referencia para quienes buscan piezas duraderas, elegantes y alineadas con un consumo más consciente. Aspiramos a seguir creciendo, innovando y conectando con nuestra comunidad.`,

  returnPolicy: `Queremos que estés completamente satisfecho con tu compra. Si por alguna razón no estás conforme con tu pedido, puedes solicitar una devolución dentro de los primeros 7 días naturales posteriores a la recepción del producto.

Las piezas deben devolverse sin uso, en perfectas condiciones y con su empaque original. Por razones de higiene, no se aceptan devoluciones en aretes si estos han sido usados.

Para iniciar el proceso de devolución, contáctanos a través de nuestros medios oficiales y te indicaremos los pasos a seguir. Una vez recibido y revisado el producto, se realizará el cambio o reembolso correspondiente según el caso.`,
}

async function updateSettings() {
  try {
    console.log('🔄 Conectando a MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Conectado a MongoDB')

    let settings = await Settings.findOne()
    
    if (!settings) {
      console.log('📝 Creando nuevo documento de settings...')
      settings = await Settings.create(newSettings)
      console.log('✅ Settings creados exitosamente')
    } else {
      console.log('📝 Actualizando settings existentes...')
      Object.assign(settings, newSettings)
      await settings.save()
      console.log('✅ Settings actualizados exitosamente')
    }

    console.log('\n📋 Contenido actualizado:')
    console.log('- aboutUs:', settings.aboutUs.substring(0, 50) + '...')
    console.log('- mission:', settings.mission.substring(0, 50) + '...')
    console.log('- vision:', settings.vision.substring(0, 50) + '...')
    console.log('- returnPolicy:', settings.returnPolicy.substring(0, 50) + '...')

    await mongoose.disconnect()
    console.log('\n✅ Proceso completado exitosamente')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

updateSettings()

