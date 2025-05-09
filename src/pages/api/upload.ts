import { apiErr, apiOk } from '@/server/utils';
import prisma from '@/server/prisma';
import { ResultAsync } from 'neverthrow';
import { z } from 'zod';
import { thenJson, throughSchema } from '@/utils/neverthrow';

const uploadSchema = z.object({
  data: z.string(),
});

export async function POST({ request }: { request: Request }) {
  return await thenJson(request)
    .andThen(throughSchema(uploadSchema))
    .andThen((args) =>
      ResultAsync.fromPromise(
        prisma.arbitraryData.create({ data: args }),
        () => new Error('Failed to create data'),
      ),
    )
    .match(apiOk, apiErr);
}
