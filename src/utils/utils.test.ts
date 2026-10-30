import { describe, expect, it } from 'vitest';
import { formatDuration, formatTotalDuration, pluralize } from './format';
import { getErrorMessage } from './error-handler';

describe('format', () => {
  it('formats track durations', () => {
    expect(formatDuration(215000)).toBe('3:35');
    expect(formatDuration(null)).toBe('');
  });

  it('formats playlist durations', () => {
    expect(formatTotalDuration(7_380_000)).toBe('2 h 3 min');
    expect(formatTotalDuration(600_000)).toBe('10 min');
  });

  it('pluralizes', () => {
    expect(pluralize(1, 'track')).toBe('1 track');
    expect(pluralize(3, 'track')).toBe('3 tracks');
  });
});

describe('getErrorMessage', () => {
  it('prefers the user-facing API message', () => {
    expect(getErrorMessage({ detail: 'internal', user_message: 'Nice' })).toBe(
      'Nice'
    );
  });

  it('reads validation errors', () => {
    expect(getErrorMessage({ detail: [{ msg: 'Field required' }] })).toBe(
      'Field required'
    );
  });
});
