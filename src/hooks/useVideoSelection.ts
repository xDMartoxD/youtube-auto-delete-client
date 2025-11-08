import { useCallback, useMemo } from 'react';
import {
  useDateRangesSelection,
  useExcludedFromRanges,
  useYoutubeActions,
  useIncludedOutsideRanges,
} from '@/stores/youtube';

/**
 * Hook para manejar la selección de videos
 * Encapsula la lógica de selección y proporciona utilidades
 * Usa la estructura normalizada de selección
 */
export function useVideoSelection() {
  // Usar selectores atómicos para evitar re-renders innecesarios
  const includedOutsideRanges = useIncludedOutsideRanges();
  const dateRanges = useDateRangesSelection();
  const excludedFromRanges = useExcludedFromRanges();
  const {
    addIncludedVideoOutsideDateRange,
    addExcludedVideoInsideDateRange,
    addDateRange,
    removeDateRange,
    removeExcludedVideoInsideDateRange,
    removeIncludedVideoOutsideDateRange,
  } = useYoutubeActions();

  // Computed: get all selected video IDs (manual + date ranges - excluded)
  // Usa selectores atómicos para dependencias estables
  const selectedVideoIds = useMemo(() => {
    const allIds = new Set<string>();

    // Add manual selections
    includedOutsideRanges.forEach((id) => allIds.add(id));

    // Add date range selections
    Object.values(dateRanges).forEach((range) => {
      if (range.videos?.items) {
        range.videos.items.forEach((video) => allIds.add(video.id));
      }
    });

    // Remove excluded videos
    excludedFromRanges.forEach((id) => allIds.delete(id));

    return Array.from(allIds).sort(); // Sort para estabilidad
  }, [includedOutsideRanges, dateRanges, excludedFromRanges]);

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

  const getDateRangesSelection = useMemo(() => dateRanges, [dateRanges]);

  const { clearAllSelections, selectAllVideos: selectAllVideosAction } =
    useYoutubeActions();

  const clearSelectedVideos = useCallback(() => {
    clearAllSelections();
  }, [clearAllSelections]);

  const selectAllVideos = useCallback(() => {
    selectAllVideosAction();
  }, [selectAllVideosAction]);

  const isInVideoInDateRanges = useCallback(
    (videoId: string) => {
      return Object.values(dateRanges).some((range) =>
        range.videos?.items?.some((video) => video.id === videoId)
      );
    },
    [dateRanges]
  );
  const isInIncludedOutsideRange = useCallback(
    (videoId: string) => {
      return includedOutsideRanges.some((id) => id === videoId);
    },
    [includedOutsideRanges]
  );

  const toggleVideoSelection = useCallback(
    (videoId: string) => {
      console.log('toggleVideoSelection', videoId);
      const isInDateRange = isInVideoInDateRanges(videoId);
      const isInIncludedOutside = isInIncludedOutsideRange(videoId);

      if (isInDateRange) {
        // Si está en un dateRange, toggle en excludedFromRanges
        if (excludedFromRanges.includes(videoId)) {
          removeExcludedVideoInsideDateRange(videoId);
        } else {
          addExcludedVideoInsideDateRange(videoId);
        }
      } else if (isInIncludedOutside) {
        // Si está en includedOutsideRanges, removerlo
        removeIncludedVideoOutsideDateRange(videoId);
      } else {
        // Si no está en ningún lado, agregarlo a includedOutsideRanges
        addIncludedVideoOutsideDateRange(videoId);
      }
    },
    [
      isInVideoInDateRanges,
      isInIncludedOutsideRange,
      excludedFromRanges,
      addExcludedVideoInsideDateRange,
      removeExcludedVideoInsideDateRange,
      addIncludedVideoOutsideDateRange,
      removeIncludedVideoOutsideDateRange,
    ]
  );

  return {
    selectedVideoIds,
    isVideoSelected,
    toggleVideoSelection,
    selectedVideosCount,
    hasSelectedVideos,
    getSelectedVideoIds,
    clearSelectedVideos,
    selectAllVideos,
    getDateRangesSelection,
    addDateRange,
    removeDateRange,
  };
}
