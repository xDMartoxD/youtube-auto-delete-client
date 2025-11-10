/**
 * Hook para manejar playlists
 * Encapsula selectores y acciones relacionadas con playlists
 */
import {
  usePlaylists as usePlaylistsSelector,
  useIsLoadingPlaylists,
  usePlaylistsError,
  useYoutubeActions,
} from '@/stores/youtube';

export function usePlaylists() {
  const playlists = usePlaylistsSelector();
  const isLoading = useIsLoadingPlaylists();
  const error = usePlaylistsError();
  const { getUserPlaylists } = useYoutubeActions();

  return {
    playlists,
    isLoading,
    error,
    getUserPlaylists,
  };
}

