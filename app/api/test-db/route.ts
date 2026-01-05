import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase, verifyConnection, getDatabase } from '@/src/lib/db'

export async function GET() {
  const diagnostics: any = {
    mongoUriConfigured: !!process.env.MONGODB_URI,
    mongoUriLength: process.env.MONGODB_URI?.length || 0,
    mongoUriStartsWith: process.env.MONGODB_URI?.substring(0, 20) || 'N/A',
    connectionTest: 'pending',
    verificationTest: 'pending',
    databaseInfo: null,
    error: null,
  }

  try {
    // Conectar a la base de datos
    const client = await connectToDatabase()
    diagnostics.connectionTest = 'success'
    
    // Verificar la conexión
    const isConnected = await verifyConnection()
    diagnostics.verificationTest = isConnected ? 'success' : 'failed'
    
    // Obtener información de la base de datos
    const db = await getDatabase()
    const adminDb = client.db().admin()
    const serverStatus = await adminDb.serverStatus()
    const dbStats = await db.stats()
    
    diagnostics.databaseInfo = {
      databaseName: db.databaseName,
      collections: (await db.listCollections().toArray()).map((col: any) => col.name),
      serverVersion: serverStatus.version,
      uptime: serverStatus.uptime,
      dataSize: dbStats.dataSize,
      storageSize: dbStats.storageSize,
    }
    
    return NextResponse.json({
      success: true,
      message: 'Conexión a MongoDB exitosa y verificada',
      diagnostics,
    })
  } catch (error: any) {
    diagnostics.connectionTest = 'failed'
    diagnostics.verificationTest = 'failed'
    diagnostics.error = error.message
    return NextResponse.json(
      {
        success: false,
        message: 'Error al conectar a MongoDB',
        diagnostics,
        error: error.message,
      },
      { status: 500 }
    )
  }
}


