import type { ZodSchema, z } from 'zod';
import { Result, ResultAsync } from 'neverthrow';

export const getJson = (url: string | URL) =>
  ResultAsync.fromPromise(
    fetch(url),
    () => new Error(`Failed to fetch from url ${url}`),
  ).andThen(thenJson);

export const thenJson = <T extends Request | Response>(re: T) =>
  ResultAsync.fromPromise(
    re.json(),
    () => new Error('Failed to parse json from Response'),
  );

export const throughSchema = <T extends ZodSchema>(schema: T) =>
  Result.fromThrowable(
    schema.parse,
    (e) => new Error(`Zod validation failed: ${e}`),
  ) as () => Result<z.infer<T>, Error>;
