import mongoose from 'mongoose';
import { BatchConfig } from '../config/batch.config';
import { AggregationResult } from './file.service';

export interface BatchAggregationOptions {
  collectionName: string;
  pipeline: any[];
  config: BatchConfig;
  aggregationName: string;
  batchStrategy?: 'pre-aggregation' | 'post-aggregation';
}

/**
 * Ejecuta una agregación en MongoDB procesando los datos por lotes.
 * 
 * Estrategias:
 * - 'pre-aggregation': Procesa documentos en lotes antes de la agregación (útil para agregaciones simples)
 * - 'post-aggregation': Ejecuta la agregación completa y luego procesa resultados por lotes (útil para agregaciones complejas)
 */
export async function executeBatchAggregation(
  options: BatchAggregationOptions
): Promise<AggregationResult> {
  const { 
    collectionName, 
    pipeline, 
    config, 
    aggregationName,
    batchStrategy = 'pre-aggregation'
  } = options;
  
  const db = mongoose.connection;
  const collection = db.collection(collectionName);

  const allResults: any[] = [];
  let batchesProcessed = 0;

  try {
    console.log(`\n📊 Ejecutando agregación: ${aggregationName}`);
    console.log(`   Estrategia: ${batchStrategy}`);
    console.log(`   Tamaño de lote: ${config.batchSize}`);
    console.log(`   Delay entre lotes: ${config.processingDelay}ms\n`);

    // Contar documentos totales
    const totalDocuments = await collection.countDocuments();
    console.log(`   Total de documentos: ${totalDocuments}`);

    if (batchStrategy === 'pre-aggregation') {
      // Estrategia: Procesar documentos en lotes antes de agregar
      const totalBatches = Math.ceil(totalDocuments / config.batchSize);
      const maxBatches = config.maxBatches || totalBatches;
      const batchesToProcess = Math.min(totalBatches, maxBatches);

      console.log(`   Lotes a procesar: ${batchesToProcess} de ${totalBatches}\n`);

      for (let i = 0; i < batchesToProcess; i++) {
        const skip = i * config.batchSize;
        
        // Crear pipeline con $match para filtrar el lote, luego agregar
        const batchPipeline = [
          { $skip: skip },
          { $limit: config.batchSize },
          ...pipeline
        ];

        try {
          const batchResults = await collection.aggregate(batchPipeline).toArray();
          allResults.push(...batchResults);
          batchesProcessed++;

          console.log(`   ✓ Lote ${i + 1}/${batchesToProcess}: ${batchResults.length} resultados obtenidos`);

          // Delay entre lotes
          if (i < batchesToProcess - 1 && config.processingDelay > 0) {
            await new Promise(resolve => setTimeout(resolve, config.processingDelay));
          }
        } catch (error) {
          console.error(`   ✗ Error en lote ${i + 1}:`, (error as Error).message);
          throw error;
        }
      }
    } else {
      // Estrategia: Ejecutar agregación completa y procesar resultados por lotes
      console.log(`   Ejecutando agregación completa...\n`);
      
      const allAggregationResults = await collection.aggregate(pipeline).toArray();
      const totalResults = allAggregationResults.length;
      const totalBatches = Math.ceil(totalResults / config.batchSize);
      const batchesToProcess = config.maxBatches 
        ? Math.min(totalBatches, config.maxBatches) 
        : totalBatches;

      console.log(`   Total de resultados de agregación: ${totalResults}`);
      console.log(`   Procesando ${batchesToProcess} lotes de resultados\n`);

      for (let i = 0; i < batchesToProcess; i++) {
        const start = i * config.batchSize;
        const end = start + config.batchSize;
        const batchResults = allAggregationResults.slice(start, end);
        
        allResults.push(...batchResults);
        batchesProcessed++;

        console.log(`   ✓ Lote ${i + 1}/${batchesToProcess}: ${batchResults.length} resultados procesados`);

        // Delay entre lotes
        if (i < batchesToProcess - 1 && config.processingDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, config.processingDelay));
        }
      }
    }

    console.log(`\n✓ Agregación completada`);
    console.log(`   Total de resultados: ${allResults.length}`);
    console.log(`   Lotes procesados: ${batchesProcessed}\n`);

    return {
      name: aggregationName,
      timestamp: new Date().toISOString(),
      totalDocuments,
      batchesProcessed,
      results: allResults,
      config: {
        batchSize: config.batchSize,
        processingDelay: config.processingDelay,
        maxBatches: config.maxBatches,
        strategy: batchStrategy
      }
    };
  } catch (error) {
    console.error('Error en agregación por lotes:', (error as Error).message);
    throw error;
  }
}

export async function getCollectionStats(collectionName: string): Promise<any> {
  try {
    const db = mongoose.connection;
    const collection = db.collection(collectionName);
    
    const count = await collection.countDocuments();
    const stats = await db.db?.stats();

    return {
      collection: collectionName,
      documentCount: count,
      dbStats: stats
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', (error as Error).message);
    throw error;
  }
}
