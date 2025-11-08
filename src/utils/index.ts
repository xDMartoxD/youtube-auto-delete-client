import type {
  PlaylistVideoResponse,
  GetPlaylistVideosApiYoutubePlaylistsPlaylistIdVideosGetError,
} from '@/api';

const formatDate = (date: Date | null): string => {
  if (!date) return '';
  const monthName = date.toLocaleDateString('es-ES', { month: 'long' });
  const year = date.getFullYear();
  return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
};

/**
 * Crea un objeto de rango de fecha con estado de carga
 */
export interface DateRangeState {
  start: Date | null;
  end: Date | null;
  videos: PlaylistVideoResponse | null;
  isLoading: boolean;
  error: GetPlaylistVideosApiYoutubePlaylistsPlaylistIdVideosGetError | null;
}

const createDateRange = (
  start: Date | null,
  end: Date | null,
  videos: PlaylistVideoResponse | null,
  isLoading: boolean,
  error: GetPlaylistVideosApiYoutubePlaylistsPlaylistIdVideosGetError | null
): DateRangeState => ({
  start,
  end,
  videos,
  isLoading,
  error,
});

export { formatDate, createDateRange };
