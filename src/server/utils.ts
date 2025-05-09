import type { Result } from 'neverthrow';

export const apiResult = <T>(
  result: Result<T, Error>,
) => result.match(apiOk, apiErr);

export const apiOk = <T>(data: T) => Response.json({ success: true as const, data });
export const apiErr = (err: Error) => Response.json({
  success: false as const,
  message: err.message,
});
