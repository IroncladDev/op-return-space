import { apiErr, apiOk, thenJson } from '@/server/utils';
import prisma from '@/server/prisma';
import { Result, ResultAsync } from 'neverthrow';
import { z } from 'zod';

const uploadSchema = z.object({
  data: z.string(),
});

export async function POST({ request }: { request: Request }) {
  return await thenJson(request)
    .andThen((req) =>
      Result.fromThrowable(
        () => uploadSchema.parse(req),
        () => new Error('Invalid schema'),
      )(),
    )
    .andThen((args) =>
      ResultAsync.fromPromise(
        prisma.arbitraryData.create({ data: args }),
        () => new Error('Failed to create data'),
      ),
    )
    .match(apiOk, apiErr);
}
