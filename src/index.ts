import { connectDatabase, disconnectDatabase } from './db';
import { executeBatchAggregation } from './services/aggregation.service';
import { saveResultsToJson } from './services/file.service';
import { getBatchConfig } from './config/batch.config';
import { 
  simpleDocumentExtractionPipeline,
} from './aggregations/sample.aggregation';

async function main(): Promise<void> {
  const startTime = Date.now();
  
  console.log('='.repeat(50));
  console.log('Commerce Insights - Batch Aggregation System');
  console.log('='.repeat(50));

  try {
    // Conectar a la base de datos
    await connectDatabase();
    console.log();

    // Obtener configuración de lotes
    const batchConfig = getBatchConfig();
    console.log('Configuración de lotes:');
    console.log(`  - Tamaño de lote: ${batchConfig.batchSize}`);
    console.log(`  - Delay entre lotes: ${batchConfig.processingDelay}ms`);
    console.log(`  - Máximo de lotes: ${batchConfig.maxBatches || 'Sin límite'}`);
    console.log();

    // Ejecutar agregación sencilla de ejemplo
    console.log('🔹 Ejecutando agregación sencilla de ejemplo...\n');
    const simpleResult = await executeBatchAggregation({
      collectionName: 'transaction',
      pipeline: simpleDocumentExtractionPipeline,
      config: batchConfig,
      aggregationName: 'simple_document_extraction',
      batchStrategy: 'pre-aggregation'
    });

    // Guardar resultados en JSON
    await saveResultsToJson(simpleResult, batchConfig.outputDirectory);
    console.log();

    // Ejemplo de agregación más compleja (comentada por defecto)
    // Descomentar si quieres ejecutar también esta agregación
    /*
    console.log('🔹 Ejecutando agregación por estado...\n');
    const statusResult = await executeBatchAggregation({
      collectionName: 'transaction',
      pipeline: transactionsByStatusPipeline,
      config: batchConfig,
      aggregationName: 'transactions_by_status',
      batchStrategy: 'post-aggregation'
    });

    await saveResultsToJson(statusResult);
    console.log();
    */

    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('='.repeat(50));
    console.log(`✓ Proceso completado en ${executionTime} segundos`);
    console.log('='.repeat(50));
  } catch (error) {
    console.error('\n✗ Error en la ejecución:', (error as Error).message);
    console.error((error as Error).stack);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

main();
