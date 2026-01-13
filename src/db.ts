import mongoose from 'mongoose';
import config from './config';

export async function connectDatabase(): Promise<typeof mongoose> {
  try {
    console.log('Conectando a MongoDB...');
    
    await mongoose.connect(config.mongoUri);
    
    console.log('✓ Conexión exitosa a MongoDB');
    return mongoose;
  } catch (error) {
    console.error('✗ Error de conexión:', (error as Error).message);
    throw error;
  }
}

export async function getTransactionCount(): Promise<number | null> {
  try {
    const db = mongoose.connection;
    const collection = db.collection('transaction');
    const count = await collection.countDocuments();
    return count;
  } catch (error) {
    console.error('Error al contar registros:', (error as Error).message);
    return null;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('✓ Desconexión de MongoDB completada');
  } catch (error) {
    console.error('Error al desconectar:', (error as Error).message);
  }
}
