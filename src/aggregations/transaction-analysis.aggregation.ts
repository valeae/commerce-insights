/**
 * Agregación para analizar transacciones por llaves públicas
 * Esta agregación acepta un array de llaves públicas y las procesa
 */
export function createTransactionAnalysisPipeline(publicKeys: string[]) {
  return [
    {
      $match: {
        publicKey: {
          $in: publicKeys
        }
      }
    },
    {
      $sort: { createdAt: 1 }
    },
    {
      $addFields: {
        transactionIdAsString: { $toString: "$_id" }
      }
    },
    {
      $group: {
        _id: "$publicKey",
        idComercio: { $first: "$commerce.clienteId" },
        comercio: { $first: "$commerce.comercio" },
        isGateway: { $first: "$commerce.gateway" },
        createdAtMasAntiguo: { $first: "$createdAt" },
        epaycoImplementationType: {
          $first: {
            $cond: [
              { $regexMatch: { input: "$correlationId", regex: "legacy" } },
              "legacy-api",
              "handler"
            ]
          }
        },
        V2: { $sum: { $cond: [{ $eq: [{ $type: "$_id" }, "objectId"] }, 1, 0] } },
        V1: { $sum: { $cond: [{ $eq: [{ $type: "$_id" }, "string"] }, 1, 0] } },
        total: { $sum: 1 },
        horaEjecucion: { $first: "$$NOW" },
        transactionIds: { $push: "$_id" },
        transactionIdsAsString: { $push: "$transactionIdAsString" }
      }
    },
    {
      $lookup: {
        from: "webcheckout",
        let: {
          txIds: "$transactionIds",
          txIdsString: "$transactionIdsAsString"
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  { $in: ["$transactionId", "$$txIds"] },
                  { $in: ["$transactionId", "$$txIdsString"] }
                ]
              }
            }
          },
          {
            $sort: { createdAt: -1 }
          },
          {
            $unwind: "$history"
          },
          {
            $addFields: {
              paymentMethodUnified: {
                $ifNull: [
                  "$history.paymentMethod",
                  "$history.type"
                ]
              }
            }
          },
          {
            $group: {
              _id: "$paymentMethodUnified",
              count: { $sum: 1 },
              exampleId: { $first: "$_id" },
              exampleCreatedAt: { $first: "$createdAt" }
            }
          },
          {
            $group: {
              _id: null,
              types: {
                $push: {
                  type: "$_id",
                  count: "$count",
                  exampleId: "$exampleId",
                  exampleCreatedAt: "$exampleCreatedAt"
                }
              },
              totalCount: { $sum: "$count" }
            }
          }
        ],
        as: "webcheckoutData"
      }
    },
    {
      $addFields: {
        webcheckoutInfo: { $arrayElemAt: ["$webcheckoutData", 0] }
      }
    },
    {
      $project: {
        _id: 0,
        publicKey: "$_id",
        comercio: 1,
        idComercio: 1,
        isGateway: 1,
        createdAtMasAntiguo: {
          $dateToString: {
            date: "$createdAtMasAntiguo",
            format: "%Y-%m-%d %H:%M:%S",
            timezone: "America/Bogota"
          }
        },
        V2: 1,
        V1: 1,
        total: 1,
        porcentajeV2: {
          $concat: [
            {
              $toString: {
                $round: [
                  {
                    $cond: [
                      { $eq: ["$total", 0] },
                      0,
                      { $multiply: [{ $divide: ["$V2", "$total"] }, 100] }
                    ]
                  },
                  1
                ]
              }
            },
            "%"
          ]
        },
        porcentajeV1: {
          $concat: [
            {
              $toString: {
                $round: [
                  {
                    $cond: [
                      { $eq: ["$total", 0] },
                      0,
                      { $multiply: [{ $divide: ["$V1", "$total"] }, 100] }
                    ]
                  },
                  1
                ]
              }
            },
            "%"
          ]
        },
        paymentMethodsStats: {
          $map: {
            input: { $ifNull: ["$webcheckoutInfo.types", []] },
            as: "method",
            in: {
              type: "$$method.type",
              example: "$$method.exampleId",
              exampleDate: {
                $dateToString: {
                  date: "$$method.exampleCreatedAt",
                  format: "%Y-%m-%d %H:%M:%S",
                  timezone: "America/Bogota"
                }
              },
              count: "$$method.count",
              percentage: {
                $concat: [
                  {
                    $toString: {
                      $round: [
                        {
                          $multiply: [
                            {
                              $divide: [
                                "$$method.count",
                                { $ifNull: ["$webcheckoutInfo.totalCount", 1] }
                              ]
                            },
                            100
                          ]
                        },
                        1
                      ]
                    }
                  },
                  "%"
                ]
              }
            }
          }
        },
        totalPaymentMethods: { $ifNull: ["$webcheckoutInfo.totalCount", 0] },
        horaEjecucion: {
          $dateToString: {
            date: "$horaEjecucion",
            format: "%Y-%m-%d %H:%M:%S",
            timezone: "America/Bogota"
          }
        }
      }
    }
  ];
}

