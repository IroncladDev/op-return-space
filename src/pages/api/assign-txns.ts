import { apiErr, apiOk, populateTxnsWithData } from '@/server/utils';
import { thenJson, throughSchema } from '@/utils/neverthrow';
import { z } from 'zod';

const assignTxnSchema = z.object({
  txIds: z.array(z.string()),
});

export async function POST({ request }: { request: Request }) {
  return await thenJson(request)
    .andThen(throughSchema(assignTxnSchema))
    .andThen((requestArgs) => populateTxnsWithData(requestArgs.txIds))
    .match(ok => apiOk(ok.filter(x => x !== null)), apiErr);
}
