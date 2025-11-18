import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVideoSelection } from '../useVideoSelection';
import type { PlaylistItemVideoOutput } from '@/api';
import {
  PRIVATE_VIDEO_TITLE,
  PRIVATE_VIDEO_DESCRIPTION,
  DELETED_VIDEO_TITLE,
  DELETED_VIDEO_DESCRIPTION,
} from '@/constants';

// Mock the store
vi.mock('@/stores/youtube', () => {
  let mockState = {
    videoSelection: {
      includedOutsideRanges: [],
      dateRanges: {},
      excludedFromRanges: [],
    },
    shouldRemovePrivateVideos: false,
    shouldRemoveDeletedVideos: false,
    playlistVideos: {
      videos: {
        items: [],
      },
    },
  };

  const mockActions = {
    addIncludedVideoOutsideDateRange: vi.fn((id: string) => {
      mockState.videoSelection.includedOutsideRanges.push(id);
    }),
    addExcludedVideoInsideDateRange: vi.fn((id: string) => {
      mockState.videoSelection.excludedFromRanges.push(id);
    }),
    removeExcludedVideoInsideDateRange: vi.fn((id: string) => {
      mockState.videoSelection.excludedFromRanges =
        mockState.videoSelection.excludedFromRanges.filter(
          (vid: string) => vid !== id
        );
    }),
    removeIncludedVideoOutsideDateRange: vi.fn((id: string) => {
      mockState.videoSelection.includedOutsideRanges =
        mockState.videoSelection.includedOutsideRanges.filter(
          (vid: string) => vid !== id
        );
    }),
    addDateRange: vi.fn(),
    removeDateRange: vi.fn(),
    clearAllSelections: vi.fn(() => {
      mockState.videoSelection = {
        includedOutsideRanges: [],
        dateRanges: {},
        excludedFromRanges: [],
      };
    }),
    setShouldRemovePrivateVideos: vi.fn((value: boolean) => {
      mockState.shouldRemovePrivateVideos = value;
    }),
    setShouldRemoveDeletedVideos: vi.fn((value: boolean) => {
      mockState.shouldRemoveDeletedVideos = value;
    }),
    deleteVideos: vi.fn(),
  };

  return {
    useIncludedOutsideRanges: () =>
      mockState.videoSelection.includedOutsideRanges,
    useDateRangesSelection: () => mockState.videoSelection.dateRanges,
    useExcludedFromRanges: () =>
      mockState.videoSelection.excludedFromRanges,
    useShouldRemovePrivateVideos: () => mockState.shouldRemovePrivateVideos,
    useShouldRemoveDeletedVideos: () => mockState.shouldRemoveDeletedVideos,
    useVideos: () => mockState.playlistVideos.videos,
    useYoutubeActions: () => mockActions,
  };
});

// Mock constants
vi.mock('@/constants', () => ({
  PRIVATE_VIDEO_TITLE: 'Private video',
  PRIVATE_VIDEO_DESCRIPTION: 'This video is private.',
  DELETED_VIDEO_TITLE: 'Deleted video',
  DELETED_VIDEO_DESCRIPTION: 'This video is unavailable.',
}));

describe('useVideoSelection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty selection initially', () => {
    const { result } = renderHook(() => useVideoSelection());

    expect(result.current.selectedVideoIds).toEqual([]);
    expect(result.current.selectedVideosCount).toBe(0);
    expect(result.current.hasSelectedVideos).toBe(false);
  });

  it('should track manually selected videos', () => {
    const { result } = renderHook(() => useVideoSelection());

    act(() => {
      result.current.toggleVideoSelection('video-1');
    });

    expect(result.current.selectedVideoIds).toContain('video-1');
    expect(result.current.selectedVideosCount).toBe(1);
    expect(result.current.hasSelectedVideos).toBe(true);
  });

  it('should toggle video selection', () => {
    const { result } = renderHook(() => useVideoSelection());

    act(() => {
      result.current.toggleVideoSelection('video-1');
    });

    expect(result.current.isVideoSelected({ id: 'video-1' } as PlaylistItemVideoOutput)).toBe(
      true
    );

    act(() => {
      result.current.toggleVideoSelection('video-1');
    });

    expect(result.current.isVideoSelected({ id: 'video-1' } as PlaylistItemVideoOutput)).toBe(
      false
    );
  });

  it('should clear all selections', () => {
    const { result } = renderHook(() => useVideoSelection());

    act(() => {
      result.current.toggleVideoSelection('video-1');
      result.current.toggleVideoSelection('video-2');
    });

    expect(result.current.selectedVideosCount).toBe(2);

    act(() => {
      result.current.clearSelectedVideos();
    });

    expect(result.current.selectedVideosCount).toBe(0);
  });
});

