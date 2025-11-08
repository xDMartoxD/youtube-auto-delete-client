import { useEffect, useCallback, useRef } from 'react';
import {
  useSelectedPlaylistId,
  useVideos,
  useIsLoadingVideos,
  useVideosError,
  useYoutubeActions,
} from '@/stores/youtube';

/**
 * Hook para manejar la carga de videos de una playlist
 * Encapsula la lógica de carga y estados relacionados
 */
export function usePlaylistVideos() {
  const selectedPlaylistId = useSelectedPlaylistId();
  const videos = useVideos();
  const isLoadingVideos = useIsLoadingVideos();
  const videosError = useVideosError();
  const { getVideosFromSelectedPlaylist } = useYoutubeActions();
  const { clearAllSelections, clearVideos } = useYoutubeActions();

  // Track previous selectedPlaylistId to only load when it actually changes

  // Load all videos when playlist is selected
  // Only run when selectedPlaylistId actually changes, not when selection state changes
  useEffect(() => {
    // Only call if selectedPlaylistId actually changed
    if (selectedPlaylistId) {
      void getVideosFromSelectedPlaylist();
    } else if (!selectedPlaylistId) {
      clearAllSelections();
      clearVideos();
    }
    // getVideosFromSelectedPlaylist is stable (defined once in store), so we can safely
    // ignore it in dependencies. The ref check prevents unnecessary calls.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlaylistId]); // Only depend on selectedPlaylistId

  const loadNextPage = useCallback(() => {
    if (selectedPlaylistId && videos?.next_page_token && !isLoadingVideos) {
      void getVideosFromSelectedPlaylist({
        pageToken: videos.next_page_token,
        append: true,
      });
    }
  }, [
    selectedPlaylistId,
    videos?.next_page_token,
    isLoadingVideos,
    getVideosFromSelectedPlaylist,
  ]);

  const hasNextPage = Boolean(videos?.next_page_token);
  const videosItems = videos?.items || [];

  return {
    videosItems,
    videos,
    isLoadingVideos,
    videosError,
    hasNextPage,
    loadNextPage,
    selectedPlaylistId,
  };
}
