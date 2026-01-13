import { connectDatabase, getTransactionCount, disconnectDatabase } from './db';

async function main(): Promise<void> {
  console.log('='.repeat(50));
  console.log('Commerce Insights - Data Collection System');
  console.log('='.repeat(50));
  console.log();
  
  try {
    // Conectar a la base de datos
    await connectDatabase();
    console.log();
    
    // Obtener cantidad de registros en transaction
    console.log('Obteniendo información de la colección "transaction"...');
    const count = await getTransactionCount();
    
    if (count !== null) {
      console.log(`\n✓ Registros en la colección "transaction": ${count.toLocaleString()}`);
    } else {
      console.log('\nNo se pudo obtener la cantidad de registros.');
    }
    
    console.log();
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('Error en la ejecución:', (error as Error).message);
  } finally {
    // Desconectar de la base de datos
    await disconnectDatabase();
  }
}

main();
