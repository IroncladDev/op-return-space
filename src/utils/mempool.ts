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

export const mempoolTxnVinSchema = z.object({
  txid: z.string(),
  vout: z.number(),
  prevout: z.object({
    scriptpubkey: z.string(),
    scriptpubkey_asm: z.string(),
    scriptpubkey_type: z.string(),
    scriptpubkey_address: z.string(),
    value: z.number(),
  }),
  scriptsig: z.string(),
  scriptsig_asm: z.string(),
  witness: z.array(z.string()),
  is_coinbase: z.boolean(),
  sequence: z.number(),
});

export type MempoolTxnVin = z.infer<typeof mempoolTxnVinSchema>;

export const mempoolTxnVoutSchema = z.object({
  scriptpubkey: z.string(),
  scriptpubkey_asm: z.string(),
  scriptpubkey_type: z.string(),
  scriptpubkey_address: z.string(),
  value: z.number(),
});

export type MempoolTxnVout = z.infer<typeof mempoolTxnVoutSchema>;

export const mempoolApiTxnSchema = z
  .object({
    txid: z.string(),
    version: z.number(),
    locktime: z.number(),
    size: z.number(),
    weight: z.number(),
    fee: z.number(),
    vin: z.array(mempoolTxnVinSchema),
    vout: z.array(mempoolTxnVoutSchema),
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

export function calculateTxAmounts(txn: MempoolApiTxn) {
  const input = txn.vin.reduce((sum, input) => sum + input.prevout.value, 0);
  const output = txn.vout.reduce((sum, output) => sum + output.value, 0);

  return {
    output,
    input,
    fee: input - output,
  };
}

export function createFormattedOutputs(
  txn: MempoolApiTxn,
): Array<[string, string, string]> {
  const startSymbol = '┳';
  const [ml, mm, mr] = ['┫', '╋', '┣'];
  const [el, em, er] = ['┛', '┻', '┗'];

  if (txn.vin.length > txn.vout.length) {
    return txn.vin.map((input, i) => {
      const inAddress = input.prevout.scriptpubkey_address;
      const outAddress = txn.vout[i]?.scriptpubkey_address;

      let symbol = mm;

      if (i === 0) {
        symbol = startSymbol;
      } else if (i === txn.vin.length - 1) {
        symbol = em;

        if (inAddress && !outAddress) {
          symbol = el;
        }
      } else {
        symbol = mm;

        if (inAddress && !outAddress) {
          symbol = ml;
        }
      }

      if (txn.vout.length === 1 && txn.vin.length === 1) {
        symbol = '-';
      }

      return [inAddress, symbol, outAddress];
    });
  }

  return txn.vout.map((input, i) => {
    const inAddress = txn.vin[i]?.prevout.scriptpubkey_address ?? '';
    const outAddress = input.scriptpubkey_address ?? '';

    let symbol = mm;

    if (i === 0) {
      symbol = startSymbol;
    } else if (i === txn.vout.length - 1) {
      symbol = em;

      if (!inAddress && outAddress) {
        symbol = er;
      }
    } else {
      symbol = mm;

      if (!inAddress && outAddress) {
        symbol = mr;
      }
    }

    if (txn.vout.length === 1 && txn.vin.length === 1) {
      symbol = '-';
    }

    return [inAddress, symbol, outAddress];
  });
}
