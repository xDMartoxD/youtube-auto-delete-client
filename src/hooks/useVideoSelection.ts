import { useCallback, useMemo } from 'react';
import {
  useManualSelection,
  useDateRangesSelection,
  useExcludedFromRanges,
  useYoutubeActions,
  useVideos,
} from '@/stores/youtube';

/**
 * Hook para manejar la selección de videos
 * Encapsula la lógica de selección y proporciona utilidades
 * Usa la estructura normalizada de selección
 */
export function useVideoSelection() {
  // Usar selectores atómicos para evitar re-renders innecesarios
  const manual = useManualSelection();
  const dateRanges = useDateRangesSelection();
  const excludedFromRanges = useExcludedFromRanges();
  const { toggleVideoSelection } = useYoutubeActions();
  const videos = useVideos();
  const videosItems = videos?.items || [];

  // Computed: get all selected video IDs (manual + date ranges - excluded)
  // Usa selectores atómicos para dependencias estables
  const selectedVideoIds = useMemo(() => {
    const allIds = new Set<string>();

    // Add manual selections
    manual.forEach((id) => allIds.add(id));

    // Add date range selections
    Object.values(dateRanges).forEach((range) => {
      range.videoIds.forEach((id) => allIds.add(id));
    });

    // Remove excluded videos
    excludedFromRanges.forEach((id) => allIds.delete(id));

    return Array.from(allIds).sort(); // Sort para estabilidad
  }, [manual, dateRanges, excludedFromRanges]);

  const isVideoSelected = useCallback(
    (videoId: string): boolean => {
      return selectedVideoIds.includes(videoId);
    },
    [selectedVideoIds]
  );

  const selectedVideosCount = useMemo(
    () => selectedVideoIds.length,
    [selectedVideoIds]
  );

  const hasSelectedVideos = useMemo(
    () => selectedVideosCount > 0,
    [selectedVideosCount]
  );

  const getSelectedVideoIds = useMemo(
    () => selectedVideoIds,
    [selectedVideoIds]
  );

  const { clearAllSelections, selectAllVideos: selectAllVideosAction } =
    useYoutubeActions();

  const clearSelectedVideos = useCallback(() => {
    clearAllSelections();
  }, [clearAllSelections]);

  const selectAllVideos = useCallback(() => {
    const allVideoIds = videosItems.map((video) => video.id);
    selectAllVideosAction(allVideoIds);
  }, [videosItems, selectAllVideosAction]);

  return {
    selectedVideos: selectedVideoIds,
    isVideoSelected,
    toggleVideoSelection,
    selectedVideosCount,
    hasSelectedVideos,
    getSelectedVideoIds,
    clearSelectedVideos,
    selectAllVideos,
  };
}
