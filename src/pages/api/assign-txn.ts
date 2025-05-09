import { apiErr, apiOk, thenJson } from '@/server/utils';
import type { ArbitraryData } from '@prisma/client';
import { err, ok, Result, ResultAsync } from 'neverthrow';
import { z } from 'zod';
import prisma from '@/server/prisma';

const assignTxnSchema = z.object({
  txid: z.string(),
});

export async function POST({ request }: { request: Request }) {
  const requestArgs = await thenJson(request).andThen((req) =>
    Result.fromThrowable(
      () => assignTxnSchema.parse(req),
      () => new Error('Invalid schema'),
    )(),
  );

  if (requestArgs.isErr()) return apiErr(requestArgs.error);

  return await getBestArbitraryDataEntry()
    .andThen((bestEntry) =>
      ResultAsync.fromPromise(
        prisma.txnLink.create({
          data: {
            txnId: requestArgs.value.txid,
            dataId: bestEntry.id,
          },
        }),
        () => new Error('Failed to create TxnLink'),
      ),
    )
    .match(apiOk, apiErr);
}

// Sorts arbitrary data prioritizing older + less-used entries
function getBestArbitraryDataEntry(): ResultAsync<ArbitraryData, Error> {
  return ResultAsync.fromPromise(
    prisma.arbitraryData.findMany({
      orderBy: {
        createdAt: 'asc',
        txnLinks: {
          _count: 'desc',
        },
      },
    }),
    () => new Error('Expected more than one ArbitraryData'),
  ).andThen((arbitraryData) => {
    if (arbitraryData.length === 0)
      return err(new Error('No arbitrary data found'));

    return ok(arbitraryData[0]);
  });
}
