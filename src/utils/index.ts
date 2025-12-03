import type {
  PlaylistVideoResponse,
  GetPlaylistVideosV1YoutubePlaylistsPlaylistIdVideosGetError,
} from '@/api';

const formatDate = (date: Date | null): string => {
  if (!date) return '';
  const day = date.getDate();
  const monthName = date.toLocaleDateString('en-US', { month: 'long' });
  const year = date.getFullYear();
  return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${day}, ${year}`;
};

/**
 * Creates a date range object with loading state
 */
export interface DateRangeState {
  start: Date | null;
  end: Date | null;
  videos: PlaylistVideoResponse | null;
  isLoading: boolean;
  error: GetPlaylistVideosV1YoutubePlaylistsPlaylistIdVideosGetError | null;
}

const createDateRange = (
  start: Date | null,
  end: Date | null,
  videos: PlaylistVideoResponse | null,
  isLoading: boolean,
  error: GetPlaylistVideosV1YoutubePlaylistsPlaylistIdVideosGetError | null
): DateRangeState => ({
  start,
  end,
  videos,
  isLoading,
  error,
});

export { formatDate, createDateRange };
export * from './error-handler';
