/**
 * Shared result type for the service layer.
 * Services never throw: they return either `data` or `error`.
 */
export interface ServiceResult<T, E = unknown> {
  data?: T;
  error?: E;
  success: boolean;
}

/**
 * Converts a generated SDK call into a ServiceResult.
 */
export async function toServiceResult<T, E>(
  request: Promise<{ data?: T; error?: E }>
): Promise<ServiceResult<T, E>> {
  try {
    const { data, error } = await request;
    if (error !== undefined) {
      return { error, success: false };
    }
    return { data, success: true };
  } catch (error) {
    return { error: error as E, success: false };
  }
}
