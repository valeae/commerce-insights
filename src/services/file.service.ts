import fs from 'fs/promises';
import path from 'path';

export interface AggregationResult {
  name: string;
  timestamp: string;
  totalDocuments: number;
  batchesProcessed: number;
  results: any[];
  config?: {
    batchSize: number;
    processingDelay: number;
    maxBatches?: number;
    strategy?: string;
  };
  metadata?: {
    executionTime?: number;
    averageResultsPerBatch?: number;
  };
}

/**
 * Guarda los resultados de una agregación en un archivo JSON
 * @param result Resultado de la agregación
 * @param directory Directorio donde guardar el archivo (default: 'results')
 * @returns Ruta del archivo guardado
 */
export async function saveResultsToJson(
  result: AggregationResult,
  directory: string = 'results'
): Promise<string> {
  try {
    // Crear directorio si no existe
    await fs.mkdir(directory, { recursive: true });

    // Generar nombre de archivo con timestamp legible
    const date = new Date();
    const dateStr = date.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `${result.name}_${dateStr}.json`;
    const filepath = path.join(directory, filename);

    // Preparar datos para guardar
    const dataToSave = {
      ...result,
      summary: {
        totalResults: result.results.length,
        batchesProcessed: result.batchesProcessed,
        totalDocuments: result.totalDocuments,
        averageResultsPerBatch: result.batchesProcessed > 0 
          ? Math.round(result.results.length / result.batchesProcessed) 
          : 0
      }
    };

    // Escribir archivo JSON con formato legible
    await fs.writeFile(
      filepath, 
      JSON.stringify(dataToSave, null, 2), 
      'utf-8'
    );

    // Calcular tamaño del archivo
    const stats = await fs.stat(filepath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`✓ Resultados guardados en: ${filepath}`);
    console.log(`  Tamaño del archivo: ${fileSizeMB} MB`);
    console.log(`  Total de resultados: ${result.results.length}`);
    
    return filepath;
  } catch (error) {
    console.error('Error al guardar resultados:', (error as Error).message);
    throw error;
  }
}

export async function loadResultsFromJson(filepath: string): Promise<AggregationResult> {
  try {
    const data = await fs.readFile(filepath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al cargar resultados:', (error as Error).message);
    throw error;
  }
}
