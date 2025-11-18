import type { PlaylistItemVideoOutput } from '@/api';
import {
  PRIVATE_VIDEO_TITLE,
  PRIVATE_VIDEO_DESCRIPTION,
  DELETED_VIDEO_TITLE,
  DELETED_VIDEO_DESCRIPTION,
} from '@/constants';

/**
 * Checks if a video is a private video
 */
export function isPrivateVideo(video: PlaylistItemVideoOutput): boolean {
  return (
    video.snippet?.title === PRIVATE_VIDEO_TITLE &&
    video.snippet?.description === PRIVATE_VIDEO_DESCRIPTION
  );
}

/**
 * Checks if a video is a deleted video
 */
export function isDeletedVideo(video: PlaylistItemVideoOutput): boolean {
  return (
    video.snippet?.title === DELETED_VIDEO_TITLE &&
    video.snippet?.description === DELETED_VIDEO_DESCRIPTION
  );
}

/**
 * Options for filtering videos by type
 */
export interface FilterVideosByTypeOptions {
  includePrivate?: boolean;
  includeDeleted?: boolean;
  excludeVideoIds?: string[];
}

/**
 * Filters videos based on type and options
 */
export function filterVideosByType(
  videos: PlaylistItemVideoOutput[],
  options: FilterVideosByTypeOptions = {}
): PlaylistItemVideoOutput[] {
  const { includePrivate = true, includeDeleted = true, excludeVideoIds = [] } =
    options;
  const excludeSet = new Set(excludeVideoIds);

  return videos.filter((video) => {
    // Exclude specific video IDs
    if (excludeSet.has(video.id)) {
      return false;
    }

    // Filter private videos
    if (!includePrivate && isPrivateVideo(video)) {
      return false;
    }

    // Filter deleted videos
    if (!includeDeleted && isDeletedVideo(video)) {
      return false;
    }

    return true;
  });
}

