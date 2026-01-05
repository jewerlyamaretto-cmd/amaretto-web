import { MongoClient, Db } from 'mongodb'
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || ''

if (!MONGODB_URI) {
  console.warn('⚠️  No se encontró MONGODB_URI. Configura este valor en tu archivo .env.local')
}

interface MongoCache {
  client: MongoClient | null
  db: Db | null
  promise: Promise<MongoClient> | null
}

const globalWithMongo = global as typeof globalThis & {
  mongoCache?: MongoCache
}

let cached = globalWithMongo.mongoCache

if (!cached) {
  cached = globalWithMongo.mongoCache = {
    client: null,
    db: null,
    promise: null,
  }
}

/**
 * Conecta a MongoDB usando Mongoose (para modelos que usan Mongoose)
 * Implementa un patrón de caché para reutilizar la conexión en Next.js
 */
async function connectMongoose() {
  const mongoUri = process.env.MONGODB_URI || MONGODB_URI || ''
  
  if (!mongoUri || mongoUri.trim() === '') {
    throw new Error('MONGODB_URI no está configurado')
  }

  // Si ya está conectado, retornar
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  // Si está conectando, esperar
  if (mongoose.connection.readyState === 2) {
    await new Promise((resolve) => {
      mongoose.connection.once('connected', resolve)
    })
    return mongoose.connection
  }

  // Conectar
  try {
    await mongoose.connect(mongoUri, {
      bufferCommands: false,
    })
    console.log('✅ Mongoose conectado a MongoDB')
    return mongoose.connection
  } catch (error: any) {
    console.error('❌ Error al conectar Mongoose:', error.message)
    throw error
  }
}

/**
 * Conecta a MongoDB usando el driver oficial de MongoDB
 * Implementa un patrón de caché para reutilizar la conexión en Next.js
 * También conecta Mongoose si es necesario para compatibilidad con modelos existentes
 * @returns Promise<MongoClient> - Cliente de MongoDB conectado
 */
export async function connectToDatabase(): Promise<MongoClient> {
  // Validar que MONGODB_URI esté configurado
  const mongoUri = process.env.MONGODB_URI || MONGODB_URI || ''
  
  if (!mongoUri || mongoUri.trim() === '') {
    console.error('❌ MONGODB_URI no encontrado en process.env')
    throw new Error(
      'MONGODB_URI no está configurado. Por favor, agrega tu cadena de conexión de MongoDB en el archivo .env.local y reinicia el servidor (npm run dev)'
    )
  }

  // Validar formato de la URI
  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    throw new Error(
      'Formato de MONGODB_URI inválido. Debe comenzar con "mongodb://" o "mongodb+srv://"'
    )
  }

  // Conectar Mongoose primero (necesario para los modelos existentes)
  await connectMongoose()

  if (!cached) {
    cached = globalWithMongo.mongoCache = {
      client: null,
      db: null,
      promise: null,
    }
  }

  // Si ya hay una conexión establecida, retornarla
  if (cached.client) {
    return cached.client
  }

  // Si hay una promesa de conexión en curso, esperarla
  if (cached.promise) {
    return await cached.promise
  }

  // Crear nueva conexión con el driver oficial
  cached.promise = MongoClient.connect(mongoUri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }).then((client) => {
    cached!.client = client
    cached!.promise = null
    console.log('✅ Driver oficial de MongoDB conectado')
    return client
  }).catch((error) => {
    cached!.promise = null
    console.error('❌ Error al conectar con el driver oficial:', error.message)
    throw error
  })

  return await cached.promise
}

/**
 * Obtiene la base de datos de MongoDB
 * @param dbName - Nombre de la base de datos (opcional, se extrae de la URI si no se proporciona)
 * @returns Promise<Db> - Instancia de la base de datos
 */
export async function getDatabase(dbName?: string): Promise<Db> {
  const client = await connectToDatabase()
  
  if (cached?.db && !dbName) {
    return cached.db
  }

  // Extraer el nombre de la base de datos de la URI si no se proporciona
  let databaseName = dbName
  if (!databaseName) {
    const mongoUri = process.env.MONGODB_URI || MONGODB_URI || ''
    const match = mongoUri.match(/\/([^?]+)/)
    if (match && match[1]) {
      databaseName = match[1]
    } else {
      // Nombre por defecto si no se encuentra en la URI
      databaseName = 'amaretto'
    }
  }

  const db = client.db(databaseName)
  
  if (!cached?.db && !dbName) {
    cached!.db = db
  }

  return db
}

/**
 * Verifica la conexión a MongoDB
 * @returns Promise<boolean> - true si la conexión es exitosa, false en caso contrario
 */
export async function verifyConnection(): Promise<boolean> {
  try {
    const client = await connectToDatabase()
    
    // Realizar una operación simple para verificar la conexión
    await client.db().admin().ping()
    
    console.log('✅ Verificación de conexión exitosa')
    return true
  } catch (error) {
    console.error('❌ Error al verificar la conexión:', error instanceof Error ? error.message : 'Error desconocido')
    return false
  }
}

/**
 * Cierra la conexión a MongoDB
 * Útil para limpiar recursos en scripts o durante el cierre de la aplicación
 */
export async function closeConnection(): Promise<void> {
  // Cerrar conexión del driver oficial
  if (cached?.client) {
    await cached.client.close()
    cached.client = null
    cached.db = null
  }
  
  // Cerrar conexión de Mongoose
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close()
  }
  
  console.log('🔌 Conexiones a MongoDB cerradas')
}
