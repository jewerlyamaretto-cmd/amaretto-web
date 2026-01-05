import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISettings extends Document {
  // Información de contacto
  phone: string
  email: string
  address: string
  
  // Redes sociales
  instagram: string
  facebook: string
  whatsapp: string
  
  // Contenido
  aboutUs: string
  mission: string
  vision: string
  
  // Información adicional
  businessHours: string
  shippingInfo: string
  returnPolicy: string
  
  updatedAt: Date
}

const SettingsSchema = new Schema<ISettings>(
  {
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
  },
  {
    timestamps: true,
  }
)

export const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema)

