import { useCallback, useMemo } from 'react';
import useYoutube from '@/stores/youtube';

/**
 * Hook para manejar la selección de videos
 * Encapsula la lógica de selección y proporciona utilidades
 */
export function useVideoSelection() {
  const {
    selectedVideos,
    toggleVideoSelection,
    clearSelectedVideos,
    selectAllVideos,
  } = useYoutube();

  const isVideoSelected = useCallback(
    (videoId: string): boolean => {
      return selectedVideos.some((v) => v.id === videoId);
    },
    [selectedVideos]
  );

  const selectedVideosCount = useMemo(
    () => selectedVideos.length,
    [selectedVideos.length]
  );

  const hasSelectedVideos = useMemo(
    () => selectedVideosCount > 0,
    [selectedVideosCount]
  );

  const getSelectedVideoIds = useMemo(
    () => selectedVideos.map((v) => v.id),
    [selectedVideos]
  );

  return {
    selectedVideos,
    isVideoSelected,
    toggleVideoSelection,
    clearSelectedVideos,
    selectAllVideos,
    selectedVideosCount,
    hasSelectedVideos,
    getSelectedVideoIds,
  };
}
