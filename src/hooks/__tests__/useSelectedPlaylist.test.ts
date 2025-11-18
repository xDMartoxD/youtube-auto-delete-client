import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSelectedPlaylist } from '../useSelectedPlaylist';

// Mock the store
const mockSetSelectedPlaylistId = vi.fn();

vi.mock('@/stores/youtube', () => ({
  useSelectedPlaylistId: vi.fn(() => null),
  useYoutubeActions: vi.fn(() => ({
    setSelectedPlaylistId: mockSetSelectedPlaylistId,
  })),
}));

describe('useSelectedPlaylist', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return selectedPlaylistId and setSelectedPlaylistId', () => {
    const { result } = renderHook(() => useSelectedPlaylist());

    expect(result.current.selectedPlaylistId).toBeNull();
    expect(result.current.setSelectedPlaylistId).toBeDefined();
  });

  it('should call setSelectedPlaylistId when action is invoked', () => {
    const { result } = renderHook(() => useSelectedPlaylist());

    act(() => {
      result.current.setSelectedPlaylistId('playlist-id-123');
    });

    expect(mockSetSelectedPlaylistId).toHaveBeenCalledWith('playlist-id-123');
  });
});

