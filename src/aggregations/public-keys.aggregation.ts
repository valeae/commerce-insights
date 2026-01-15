/**
 * Agregación para extraer todas las llaves públicas únicas de la colección transaction
 */
export const extractPublicKeysPipeline = [
  {
    $match: {
      $and: [
        { publicKey: { $exists: true } },
        { publicKey: { $ne: null } },
        { publicKey: { $ne: '' } }
      ]
    }
  },
  {
    $group: {
      _id: '$publicKey'
    }
  },
  {
    $project: {
      _id: 0,
      publicKey: '$_id'
    }
  }
];

