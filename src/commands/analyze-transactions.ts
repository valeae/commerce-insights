import { connectDatabase, disconnectDatabase } from '../db';
import { getBatchConfig } from '../config/batch.config';
import { createTransactionAnalysisPipeline } from '../aggregations/transaction-analysis.aggregation';
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';

/**
 * Divide un array en lotes de tamaño especificado
 */
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

async function main() {
  try {
    await connectDatabase();
    const config = getBatchConfig();
    const db = mongoose.connection;
    const collection = db.collection('transaction');

    // Obtener directorio de salida
    const outputDir = config.outputDirectory || 'results';
    await fs.mkdir(outputDir, { recursive: true });

    // Cargar llaves públicas desde el último archivo generado
    const resultsDir = outputDir;
    const files = await fs.readdir(resultsDir);
    const publicKeysFiles = files
      .filter(f => f.startsWith('public-keys_') && f.endsWith('.json'))
      .sort()
      .reverse();

    if (publicKeysFiles.length === 0) {
      console.error('No se encontró archivo de llaves públicas. Ejecuta primero: npm run extract-keys');
      process.exit(1);
    }

    const latestFile = path.join(resultsDir, publicKeysFiles[0]);
    console.log(`📂 Cargando llaves públicas desde: ${latestFile}`);
    
    const fileContent = await fs.readFile(latestFile, 'utf-8');
    const publicKeys: string[] = JSON.parse(fileContent);
    
    console.log(`✓ ${publicKeys.length} llaves públicas cargadas\n`);

    // Dividir en lotes de 10
    const batchSize = 10;
    const batches = chunkArray(publicKeys, batchSize);
    
    console.log(`📊 Procesando ${batches.length} lotes de ${batchSize} llaves públicas cada uno\n`);

    const allResults: any[] = [];
    const processedKeys = new Set<string>();
    const missingKeys: string[] = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const batchNumber = i + 1;
      
      console.log(`\n🔹 Procesando lote ${batchNumber}/${batches.length} (${batch.length} llaves públicas)...`);
      console.log(`   Llaves del lote: ${batch.join(', ')}`);
      
      try {
        // Crear pipeline con las llaves del lote
        const pipeline = createTransactionAnalysisPipeline(batch);
        
        // Ejecutar agregación con allowDiskUse
        const results = await collection.aggregate(pipeline, { allowDiskUse: true }).toArray();
        
        // Registrar qué llaves se procesaron
        results.forEach((result: any) => {
          if (result.publicKey) {
            processedKeys.add(result.publicKey);
          }
        });
        
        // Identificar llaves que no tuvieron resultados
        batch.forEach(key => {
          if (!processedKeys.has(key)) {
            missingKeys.push(key);
          }
        });
        
        allResults.push(...results);
        
        console.log(`   ✓ ${results.length} resultados obtenidos del lote ${batchNumber}`);
        if (results.length < batch.length) {
          const foundKeys = results.map((r: any) => r.publicKey).filter(Boolean);
          const notFoundKeys = batch.filter(k => !foundKeys.includes(k));
          console.log(`   ⚠ Llaves sin resultados en este lote: ${notFoundKeys.join(', ')}`);
        }
        
        // Delay entre lotes
        if (i < batches.length - 1 && config.processingDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, config.processingDelay));
        }
      } catch (error) {
        console.error(`   ✗ Error en lote ${batchNumber}:`, (error as Error).message);
        throw error;
      }
    }

    // Guardar resultados
    const date = new Date();
    const dateStr = date.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `transaction-analysis_${dateStr}.json`;
    const filepath = path.join(outputDir, filename);

    await fs.writeFile(
      filepath,
      JSON.stringify(allResults, null, 2),
      'utf-8'
    );

    console.log(`\n✓ Análisis completado`);
    console.log(`✓ Total de llaves públicas procesadas: ${processedKeys.size} de ${publicKeys.length}`);
    console.log(`✓ Total de resultados: ${allResults.length}`);
    
    if (missingKeys.length > 0) {
      console.log(`\n⚠ Llaves públicas sin resultados (${missingKeys.length}):`);
      missingKeys.forEach(key => console.log(`   - ${key}`));
      console.log(`\n   Nota: Estas llaves pueden no tener transacciones en la base de datos`);
    }
    
    console.log(`\n✓ Archivo guardado en: ${filepath}`);
  } catch (error) {
    console.error('\n✗ Error:', (error as Error).message);
    console.error((error as Error).stack);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

main();

