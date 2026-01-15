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

/**
 * Agregación de ejemplo: Contar transacciones por estado
 * Esta agregación agrupa datos, funciona mejor con post-aggregation
 */
export const transactionsByStatusPipeline = [
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 },
      totalAmount: { $sum: '$amount' }
    }
  },
  {
    $sort: { count: -1 }
  },
  {
    $project: {
      status: '$_id',
      _id: 0,
      count: 1,
      totalAmount: 1
    }
  }
];

// Agregación de ejemplo: Transacciones por día
export const transactionsByDatePipeline = [
  {
    $group: {
      _id: {
        $dateToString: {
          format: '%Y-%m-%d',
          date: '$createdAt'
        }
      },
      count: { $sum: 1 },
      totalAmount: { $sum: '$amount' }
    }
  },
  {
    $sort: { _id: -1 }
  },
  {
    $limit: 30
  }
];

// Agregación de ejemplo: Top 10 comercios por transacciones
export const topMerchantsPipeline = [
  {
    $group: {
      _id: '$merchantId',
      transactionCount: { $sum: 1 },
      totalAmount: { $sum: '$amount' },
      avgAmount: { $avg: '$amount' }
    }
  },
  {
    $sort: { transactionCount: -1 }
  },
  {
    $limit: 10
  }
];
