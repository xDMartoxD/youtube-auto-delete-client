import { useEffect, useCallback } from 'react';
import useYoutube from '@/stores/youtube';

/**
 * Hook para manejar la carga de videos de una playlist
 * Encapsula la lógica de carga y estados relacionados
 */
export function usePlaylistVideos() {
  const {
    selectedPlaylistId,
    videos,
    getVideosFromPlaylist,
    isLoadingVideos,
    videosError,
    selectedVideos,
  } = useYoutube();

  // Load videos when playlist is selected
  useEffect(() => {
    if (selectedPlaylistId) {
      void getVideosFromPlaylist(selectedPlaylistId);
    }
  }, [selectedPlaylistId, getVideosFromPlaylist]);

  const loadNextPage = useCallback(() => {
    if (selectedPlaylistId && videos?.next_page_token && !isLoadingVideos) {
      void getVideosFromPlaylist(selectedPlaylistId, {
        pageToken: videos.next_page_token,
        append: true,
      });
    }
  }, [
    selectedPlaylistId,
    videos?.next_page_token,
    isLoadingVideos,
    getVideosFromPlaylist,
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
    selectedVideos,
  };
}

