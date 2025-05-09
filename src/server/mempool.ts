import { Result, type ResultAsync } from 'neverthrow';
import { getJson } from './utils';
import { z } from 'zod';

const mempoolBlockSchema = z
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

const mempoolBlocksSchema = z.array(mempoolBlockSchema);

export type MempoolBlocks = z.infer<typeof mempoolBlocksSchema>;

export const getMempoolBlocks = (): ResultAsync<MempoolBlocks, Error> =>
  getJson('https://mempool.space/api/v1/blocks/').andThen((json) =>
    Result.fromThrowable(
      () => mempoolBlocksSchema.parse(json),
      () => new Error('Invalid schema for mempool blocks'),
    )(),
  );
