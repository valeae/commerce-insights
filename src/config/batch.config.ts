export interface BatchConfig {
  batchSize: number;
  processingDelay: number; // en milisegundos entre lotes
  maxBatches?: number; // undefined = sin límite
  outputDirectory?: string; // directorio para guardar resultados
}

const defaultBatchConfig: BatchConfig = {
  batchSize: 1000,
  processingDelay: 500,
  maxBatches: undefined,
  outputDirectory: 'results'
};

/**
 * Obtiene la configuración de lotes desde variables de entorno o valores por defecto
 * 
 * Variables de entorno disponibles:
 * - BATCH_SIZE: Tamaño de cada lote (default: 1000)
 * - BATCH_DELAY: Delay en ms entre lotes (default: 500)
 * - MAX_BATCHES: Número máximo de lotes a procesar (default: sin límite)
 * - OUTPUT_DIRECTORY: Directorio para guardar resultados JSON (default: 'results')
 */
export function getBatchConfig(): BatchConfig {
  return {
    batchSize: parseInt(process.env.BATCH_SIZE || '1000', 10),
    processingDelay: parseInt(process.env.BATCH_DELAY || '500', 10),
    maxBatches: process.env.MAX_BATCHES 
      ? parseInt(process.env.MAX_BATCHES, 10) 
      : undefined,
    outputDirectory: process.env.OUTPUT_DIRECTORY || 'results'
  };
}

/**
 * Valida que la configuración sea correcta
 */
export function validateBatchConfig(config: BatchConfig): void {
  if (config.batchSize <= 0) {
    throw new Error('BATCH_SIZE debe ser mayor que 0');
  }
  if (config.processingDelay < 0) {
    throw new Error('BATCH_DELAY no puede ser negativo');
  }
  if (config.maxBatches !== undefined && config.maxBatches <= 0) {
    throw new Error('MAX_BATCHES debe ser mayor que 0 si está definido');
  }
}

export default defaultBatchConfig;
