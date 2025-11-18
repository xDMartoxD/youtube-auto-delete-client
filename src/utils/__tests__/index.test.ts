import { describe, it, expect } from 'vitest';
import { formatDate, createDateRange } from '../index';
import type {
  PlaylistVideoResponse,
  GetPlaylistVideosApiYoutubePlaylistsPlaylistIdVideosGetError,
} from '@/api';

describe('Utils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-03-15');
      const formatted = formatDate(date);
      expect(formatted).toBe('March 15, 2024');
    });

    it('should handle different dates', () => {
      const date = new Date('2024-12-31');
      const formatted = formatDate(date);
      expect(formatted).toBe('December 31, 2024');
    });

    it('should return empty string for null date', () => {
      expect(formatDate(null)).toBe('');
    });

    it('should capitalize first letter of month', () => {
      const date = new Date('2024-01-01');
      const formatted = formatDate(date);
      expect(formatted).toBe('January 1, 2024');
    });
  });

  describe('createDateRange', () => {
    it('should create date range with all fields', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-12-31');
      const videos: PlaylistVideoResponse = {
        etag: 'test-etag',
        items: [],
        pageInfo: {
          totalResults: 0,
          resultsPerPage: 50,
        },
      };
      const error: GetPlaylistVideosApiYoutubePlaylistsPlaylistIdVideosGetError =
        null;

      const dateRange = createDateRange(start, end, videos, false, error);

      expect(dateRange).toEqual({
        start,
        end,
        videos,
        isLoading: false,
        error,
      });
    });

    it('should create date range with null values', () => {
      const dateRange = createDateRange(null, null, null, true, null);

      expect(dateRange).toEqual({
        start: null,
        end: null,
        videos: null,
        isLoading: true,
        error: null,
      });
    });

    it('should create date range with loading state', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-31');
      const dateRange = createDateRange(start, end, null, true, null);

      expect(dateRange.isLoading).toBe(true);
      expect(dateRange.start).toBe(start);
      expect(dateRange.end).toBe(end);
    });

    it('should create date range with error', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-31');
      const error: GetPlaylistVideosApiYoutubePlaylistsPlaylistIdVideosGetError =
        {
          status: 404,
          body: { detail: 'Not found' },
        };

      const dateRange = createDateRange(start, end, null, false, error);

      expect(dateRange.error).toEqual(error);
      expect(dateRange.isLoading).toBe(false);
    });
  });
});

