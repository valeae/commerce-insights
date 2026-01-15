import { connectDatabase, disconnectDatabase } from '../db';
import { executeBatchAggregation } from '../services/aggregation.service';
import { saveResultsToJson } from '../services/file.service';
import { getBatchConfig } from '../config/batch.config';
import { extractPublicKeysPipeline } from '../aggregations/public-keys.aggregation';

async function main() {
  try {
    await connectDatabase();
    const config = getBatchConfig();
    
    const result = await executeBatchAggregation({
      collectionName: 'transaction',
      pipeline: extractPublicKeysPipeline,
      config,
      aggregationName: 'extract_public_keys',
      batchStrategy: 'post-aggregation'
    });

    await saveResultsToJson(result, config.outputDirectory);
    console.log(`\n✓ ${result.results.length} llaves públicas extraídas`);
  } catch (error) {
    console.error('Error:', (error as Error).message);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

main();

