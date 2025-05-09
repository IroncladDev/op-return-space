import { z } from 'zod';

export const mempoolBlockSchema = z
  .object({
    timestamp: z.number(),
    height: z.number(),
    version: z.number(),
    tx_count: z.number(),
    size: z.number(),
    extras: z
      .object({
        medianFee: z.number(),
        feeRange: z.array(z.number()),
        reward: z.number(),
        totalFees: z.number(),
        avgFee: z.number(),
        avgFeeRate: z.number(),
      })
      .passthrough(),
  })
  .passthrough();

export type MempoolBlock = z.infer<typeof mempoolBlockSchema>;

export const mempoolRecentTransactionSchema = z.object({
  txid: z.string(),
  fee: z.number(),
  vsize: z.number(),
  value: z.number(),
});

export type MempoolRecentTransaction = z.infer<
  typeof mempoolRecentTransactionSchema
>;

export const mempoolTxnRelativeSchema = z.object({
  txid: z.string(),
  fee: z.number(),
  weight: z.number(),
});

export const mempoolTxnSchema = z.object({
  position: z.object({
    block: z.number(),
    vsize: z.number(),
  }),
  cpfp: z.object({
    ancestors: z.array(mempoolTxnRelativeSchema),
    descendants: z.array(mempoolTxnRelativeSchema),
    bestDescendant: z.nullable(mempoolTxnRelativeSchema),
    effectiveFeePerVsize: z.number(),
    sigops: z.number(),
    adjustedVsize: z.number(),
  }),
});

export const mempoolTxnWsSubscriptionSchema = z.object({
  txPosition: mempoolTxnSchema.extend({
    txid: z.tuple([z.string()]),
  }),
});

export const mempoolApiTxnSchema = z
  .object({
    txid: z.string(),
    version: z.number(),
    locktime: z.number(),
    size: z.number(),
    weight: z.number(),
    fee: z.number(),
    status: z
      .object({
        confirmed: z.boolean(),
        block_height: z.number().nullish(),
        block_time: z.number().nullish(),
      })
      .passthrough(),
  })
  .passthrough();

export type MempoolApiTxn = z.infer<typeof mempoolApiTxnSchema>;
