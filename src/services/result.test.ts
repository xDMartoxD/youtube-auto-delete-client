import { describe, expect, it } from 'vitest';
import { toServiceResult } from './result';

describe('toServiceResult', () => {
  it('returns data on success', async () => {
    const result = await toServiceResult(Promise.resolve({ data: 42 }));

    expect(result).toEqual({ data: 42, success: true });
  });

  it('returns the API error', async () => {
    const error = { detail: 'nope' };

    const result = await toServiceResult(Promise.resolve({ error }));

    expect(result).toEqual({ error, success: false });
  });

  it('turns a thrown error into a failed result', async () => {
    const error = new Error('network');

    const result = await toServiceResult(Promise.reject(error));

    expect(result).toEqual({ error, success: false });
  });
});
