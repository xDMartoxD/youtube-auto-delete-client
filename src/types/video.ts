// Shared types for video-related functionality
import type { PlaylistItemVideoOutput } from '@/api';

export type VideoThumbnailSize = 'default' | 'medium' | 'high' | 'maxres';

export interface VideoCardProps {
  video: PlaylistItemVideoOutput;
  isSelected: boolean;
  onSelect: (video: PlaylistItemVideoOutput) => void;
}

/**
 * Get the best available thumbnail URL for a video
 */
export function getVideoThumbnailUrl(
  video: PlaylistItemVideoOutput,
  preferredSize: VideoThumbnailSize = 'maxres'
): string | undefined {
  const thumbnails = video.snippet?.thumbnails;
  if (!thumbnails) return undefined;

  const sizeOrder: VideoThumbnailSize[] = [
    'maxres',
    'high',
    'medium',
    'default',
  ];
  const startIndex = sizeOrder.indexOf(preferredSize);

  for (let i = startIndex; i < sizeOrder.length; i++) {
    const size = sizeOrder[i];
    const url = thumbnails[size]?.url;
    if (url) return url;
  }

  return undefined;
}
