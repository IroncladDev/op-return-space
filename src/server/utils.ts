import { ResultAsync } from 'neverthrow';
import prisma from './prisma';
import type { ArbitraryData, TxnLink } from '@prisma/client';
import { getJson, throughSchema } from '@/utils/neverthrow';
import { z } from 'zod';
import type { MempoolApiTxn, MempoolBlock } from '@/utils/mempool';
import {
  mempoolApiTxnSchema,
  mempoolBlockSchema,
  mempoolRecentTransactionSchema,
} from '@/utils/mempool';

export const apiOk = <T>(data: T) =>
  Response.json({ success: true as const, data });
export const apiErr = (err: Error) =>
  Response.json({
    success: false as const,
    message: err.message,
  });

export function getNextArbitraryDataEntries(): ResultAsync<
  ArbitraryData[],
  Error
> {
  return ResultAsync.fromPromise(
    prisma.arbitraryData.findMany({
      orderBy: [
        {
          txnLinks: {
            _count: 'desc',
          },
        },
        {
          createdAt: 'desc',
        },
      ],
      include: {
        txnLinks: true,
      },
    }),
    (err) => new Error(`Error fetching arbitrary data entries: ${err}`),
  );
}

export type TxnLinkWithData = TxnLink & { data: ArbitraryData };
export type PopulatedTxnData = {
  txnLink: TxnLinkWithData;
  apiTxn: MempoolApiTxn;
};

export const populateTxnsWithData = (
  txns: Array<string>,
): ResultAsync<Array<PopulatedTxnData | null>, Error> =>
  getNextArbitraryDataEntries()
    .andThen((nextDataEntries) =>
      ResultAsync.fromPromise(
        Promise.all(
          txns.map((txnId, i) =>
            prisma.txnLink.upsert({
              where: { txnId },
              update: {},
              create: {
                txnId,
                dataId:
                  i < nextDataEntries.length
                    ? nextDataEntries[i].id
                    : nextDataEntries[
                        Math.floor(Math.random() * nextDataEntries.length)
                      ].id,
              },
              include: {
                data: true,
              },
            }),
          ),
        ),
        (e) => new Error(`Failed to upsert TxnLinks: ${e}`),
      ),
    )
    .andThen((txnLinks) => {
      return ResultAsync.fromPromise(
        Promise.all(
          txnLinks.map((txnLink) =>
            getJson(`https://mempool.space/api/tx/${txnLink.txnId}`)
              .andThen(throughSchema(mempoolApiTxnSchema))
              .map((apiTxn) => ({
                txnLink,
                apiTxn,
              }))
              .unwrapOr(null),
          ),
        ),
        (e) => new Error(`Failed to fetch txn data: ${e}`),
      );
    });

export const getAndPopulateTransactions = () =>
  getJson('https://mempool.space/api/mempool/recent')
    .andThen(throughSchema(z.array(mempoolRecentTransactionSchema)))
    .andThen((txns) => populateTxnsWithData(txns.map((txn) => txn.txid)));

export const getMempoolBlocks = (): ResultAsync<Array<MempoolBlock>, Error> =>
  getJson('https://mempool.space/api/v1/blocks/').andThen(
    throughSchema(z.array(mempoolBlockSchema)),
  );
