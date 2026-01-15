/**
 * Agregación sencilla: Contar documentos totales
 * Esta agregación es simple y funciona bien con la estrategia pre-aggregation
 */
export const simpleCountPipeline = [
  {
    $count: 'total'
  }
];

/**
 * Agregación sencilla: Obtener todos los documentos con campos específicos
 * Útil para extraer datos en lotes
 */
export const simpleDocumentExtractionPipeline = [
  {
    $project: {
      _id: 1,
      createdAt: 1,
      updatedAt: 1
    }
  },
  {
    $limit: 10000 // Límite de seguridad
  }
];
