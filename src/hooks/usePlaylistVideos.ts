import { useEffect, useCallback } from 'react';
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

  // Load all videos when playlist is selected
  useEffect(() => {
    if (selectedPlaylistId) {
      void getVideosFromSelectedPlaylist({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlaylistId]); // getVideosFromSelectedPlaylist es estable, no necesita estar en deps

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
