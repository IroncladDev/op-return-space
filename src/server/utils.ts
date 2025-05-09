import { ResultAsync, type Result } from 'neverthrow';

export const apiResult = <T>(result: Result<T, Error>) =>
  result.match(apiOk, apiErr);

export const apiOk = <T>(data: T) =>
  Response.json({ success: true as const, data });
export const apiErr = (err: Error) =>
  Response.json({
    success: false as const,
    message: err.message,
  });

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
