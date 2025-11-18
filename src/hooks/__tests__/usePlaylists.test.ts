import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePlaylists } from '../usePlaylists';

// Mock the store
const mockGetUserPlaylists = vi.fn();

vi.mock('@/stores/youtube', () => ({
  usePlaylists: vi.fn(() => ({
    etag: 'test-etag',
    items: [],
    pageInfo: { totalResults: 0, resultsPerPage: 50 },
  })),
  useIsLoadingPlaylists: vi.fn(() => false),
  usePlaylistsError: vi.fn(() => null),
  useYoutubeActions: vi.fn(() => ({
    getUserPlaylists: mockGetUserPlaylists,
  })),
}));

describe('usePlaylists', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return playlists, loading state, error, and action', () => {
    const { result } = renderHook(() => usePlaylists());

    expect(result.current.playlists).toBeDefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.getUserPlaylists).toBeDefined();
  });

  it('should call getUserPlaylists when action is invoked', () => {
    const { result } = renderHook(() => usePlaylists());

    result.current.getUserPlaylists();

    expect(mockGetUserPlaylists).toHaveBeenCalled();
  });
});

