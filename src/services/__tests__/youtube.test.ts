import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getUserPlaylists,
  getPlaylistVideos,
  deletePlaylistVideos,
} from '../youtube';
import {
  getUserPlaylistsApiYoutubePlaylistsGet,
  getPlaylistVideosApiYoutubePlaylistsPlaylistIdVideosGet,
  deletePlaylistVideosApiYoutubePlaylistsPlaylistIdDeletePost,
} from '@/api';
import { apiClient } from '@/configs/client-config';
import type {
  YoutubePlaylistListResponse,
  PlaylistVideoResponse,
} from '@/api';

// Mock the API functions
vi.mock('@/api', () => ({
  getUserPlaylistsApiYoutubePlaylistsGet: vi.fn(),
  getPlaylistVideosApiYoutubePlaylistsPlaylistIdVideosGet: vi.fn(),
  deletePlaylistVideosApiYoutubePlaylistsPlaylistIdDeletePost: vi.fn(),
}));

// Mock the apiClient
vi.mock('@/configs/client-config', () => ({
  apiClient: {},
}));

describe('YouTube Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserPlaylists', () => {
    it('should return playlists on successful response', async () => {
      const mockPlaylists: YoutubePlaylistListResponse = {
        etag: 'test-etag',
        items: [],
        pageInfo: {
          totalResults: 0,
          resultsPerPage: 50,
        },
      };

      vi.mocked(getUserPlaylistsApiYoutubePlaylistsGet).mockResolvedValue({
        response: { status: 200 } as Response,
        data: mockPlaylists,
      });

      const result = await getUserPlaylists();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPlaylists);
      expect(result.error).toBeUndefined();
      expect(getUserPlaylistsApiYoutubePlaylistsGet).toHaveBeenCalledWith({
        client: apiClient,
        query: undefined,
      });
    });

    it('should return playlists with options', async () => {
      const mockPlaylists: YoutubePlaylistListResponse = {
        etag: 'test-etag',
        items: [],
        pageInfo: {
          totalResults: 0,
          resultsPerPage: 50,
        },
      };

      vi.mocked(getUserPlaylistsApiYoutubePlaylistsGet).mockResolvedValue({
        response: { status: 200 } as Response,
        data: mockPlaylists,
      });

      const result = await getUserPlaylists({
        maxResults: 10,
        pageToken: 'test-token',
      });

      expect(result.success).toBe(true);
      expect(getUserPlaylistsApiYoutubePlaylistsGet).toHaveBeenCalledWith({
        client: apiClient,
        query: {
          max_results: 10,
          page_token: 'test-token',
        },
      });
    });

    it('should return error on API error', async () => {
      const mockError = {
        status: 422,
        body: { detail: 'Validation error' },
      };

      vi.mocked(getUserPlaylistsApiYoutubePlaylistsGet).mockResolvedValue({
        response: { status: 422 } as Response,
        error: mockError,
      });

      const result = await getUserPlaylists();

      expect(result.success).toBe(false);
      expect(result.error).toEqual(mockError);
      expect(result.data).toBeUndefined();
    });

    it('should return error on exception', async () => {
      const mockError = new Error('Network error');

      vi.mocked(getUserPlaylistsApiYoutubePlaylistsGet).mockRejectedValue(
        mockError
      );

      const result = await getUserPlaylists();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getPlaylistVideos', () => {
    it('should return videos on successful response', async () => {
      const mockVideos: PlaylistVideoResponse = {
        etag: 'test-etag',
        items: [],
        pageInfo: {
          totalResults: 0,
          resultsPerPage: 50,
        },
      };

      vi.mocked(
        getPlaylistVideosApiYoutubePlaylistsPlaylistIdVideosGet
      ).mockResolvedValue({
        response: { status: 200 } as Response,
        data: mockVideos,
      });

      const result = await getPlaylistVideos('playlist-id');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockVideos);
      expect(
        getPlaylistVideosApiYoutubePlaylistsPlaylistIdVideosGet
      ).toHaveBeenCalledWith({
        client: apiClient,
        path: { playlist_id: 'playlist-id' },
        query: {
          page_token: undefined,
          date_from: undefined,
          date_to: undefined,
          max_results: 50,
        },
      });
    });

    it('should return videos with date range options', async () => {
      const mockVideos: PlaylistVideoResponse = {
        etag: 'test-etag',
        items: [],
        pageInfo: {
          totalResults: 0,
          resultsPerPage: 50,
        },
      };

      const dateFrom = new Date('2024-01-01');
      const dateTo = new Date('2024-12-31');

      vi.mocked(
        getPlaylistVideosApiYoutubePlaylistsPlaylistIdVideosGet
      ).mockResolvedValue({
        response: { status: 200 } as Response,
        data: mockVideos,
      });

      const result = await getPlaylistVideos('playlist-id', {
        dateFrom,
        dateTo,
        maxResults: 25,
        pageToken: 'token',
      });

      expect(result.success).toBe(true);
      expect(
        getPlaylistVideosApiYoutubePlaylistsPlaylistIdVideosGet
      ).toHaveBeenCalledWith({
        client: apiClient,
        path: { playlist_id: 'playlist-id' },
        query: {
          page_token: 'token',
          date_from: dateFrom.toISOString(),
          date_to: dateTo.toISOString(),
          max_results: 25,
        },
      });
    });

    it('should return error on API error', async () => {
      const mockError = {
        status: 404,
        body: { detail: 'Playlist not found' },
      };

      vi.mocked(
        getPlaylistVideosApiYoutubePlaylistsPlaylistIdVideosGet
      ).mockResolvedValue({
        response: { status: 404 } as Response,
        error: mockError,
      });

      const result = await getPlaylistVideos('invalid-id');

      expect(result.success).toBe(false);
      expect(result.error).toEqual(mockError);
    });
  });

  describe('deletePlaylistVideos', () => {
    it('should return success on successful deletion', async () => {
      vi.mocked(
        deletePlaylistVideosApiYoutubePlaylistsPlaylistIdDeletePost
      ).mockResolvedValue({
        response: { status: 204 } as Response,
      });

      const result = await deletePlaylistVideos(
        'playlist-id',
        ['video-id-1', 'video-id-2'],
        false,
        false
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
      expect(
        deletePlaylistVideosApiYoutubePlaylistsPlaylistIdDeletePost
      ).toHaveBeenCalledWith({
        client: apiClient,
        path: { playlist_id: 'playlist-id' },
        body: {
          playlist_id: 'playlist-id',
          video_ids: ['video-id-1', 'video-id-2'],
          include_private_videos: false,
          include_delete_videos: false,
        },
      });
    });

    it('should return error on API error', async () => {
      const mockError = {
        status: 400,
        body: { detail: 'Invalid request' },
      };

      vi.mocked(
        deletePlaylistVideosApiYoutubePlaylistsPlaylistIdDeletePost
      ).mockResolvedValue({
        response: { status: 400 } as Response,
        error: mockError,
      });

      const result = await deletePlaylistVideos(
        'playlist-id',
        ['video-id-1'],
        false,
        false
      );

      expect(result.success).toBe(false);
      expect(result.error).toEqual(mockError);
    });
  });
});

