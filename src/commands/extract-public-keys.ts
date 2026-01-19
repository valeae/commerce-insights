import { connectDatabase, disconnectDatabase } from '../db';
import { executeBatchAggregation } from '../services/aggregation.service';
import { getBatchConfig } from '../config/batch.config';
import { extractPublicKeysPipeline } from '../aggregations/public-keys.aggregation';
import fs from 'fs/promises';
import path from 'path';

async function main() {
  try {
    await connectDatabase();
    const config = getBatchConfig();
    
    // Configurar sin límite de lotes para extraer todas las llaves
    const configWithoutLimit = {
      ...config,
      maxBatches: undefined // Sin límite de lotes
    };

    const result = await executeBatchAggregation({
      collectionName: 'transaction',
      pipeline: extractPublicKeysPipeline,
      config: configWithoutLimit,
      aggregationName: 'extract_public_keys',
      batchStrategy: 'post-aggregation'
    });

    // Extraer solo las llaves públicas como array de strings
    const publicKeys: string[] = result.results.map((item: any) => item.publicKey);

    // Obtener directorio de salida (siempre tiene valor por defecto)
    const outputDir = config.outputDirectory || 'results';

    // Crear directorio si no existe (se crea automáticamente)
    await fs.mkdir(outputDir, { recursive: true });

    // Generar nombre de archivo con timestamp
    const date = new Date();
    const dateStr = date.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `public-keys_${dateStr}.json`;
    const filepath = path.join(outputDir, filename);

    // Guardar array simple de strings
    await fs.writeFile(
      filepath,
      JSON.stringify(publicKeys, null, 2),
      'utf-8'
    );

    console.log(`\n✓ ${publicKeys.length} llaves públicas extraídas`);
    console.log(`✓ Archivo guardado en: ${filepath}`);
  } catch (error) {
    console.error('Error:', (error as Error).message);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

main();

