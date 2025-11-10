import { useCallback, useMemo } from 'react';
import {
  useDateRangesSelection,
  useExcludedFromRanges,
  useIncludedOutsideRanges,
  useShouldRemovePrivateVideos,
  useVideos,
  useYoutubeActions,
} from '@/stores/youtube';
import type { PlaylistItemVideoOutput } from '@/api';
import { PRIVATE_VIDEO_DESCRIPTION, PRIVATE_VIDEO_TITLE } from '@/constants';

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
  const shouldRemovePrivateVideos = useShouldRemovePrivateVideos();
  const videos = useVideos();
  const {
    addIncludedVideoOutsideDateRange,
    addExcludedVideoInsideDateRange,
    addDateRange,
    removeDateRange,
    removeExcludedVideoInsideDateRange,
    removeIncludedVideoOutsideDateRange,
    setShouldRemovePrivateVideos,
  } = useYoutubeActions();

  // Computed: get all selected video IDs (manual + date ranges - excluded + private videos if enabled)
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

    // Add private videos if shouldRemovePrivateVideos is enabled
    if (shouldRemovePrivateVideos && videos?.items) {
      videos.items.forEach((video) => {
        if (video.snippet.position == 66) {
          debugger;
        }
        if (
          video.snippet?.title === PRIVATE_VIDEO_TITLE &&
          video.snippet?.description === PRIVATE_VIDEO_DESCRIPTION &&
          !excludedFromRanges.includes(video.id)
        ) {
          allIds.add(video.id);
        }
      });
    }

    // Remove excluded videos
    excludedFromRanges.forEach((id) => allIds.delete(id));

    return Array.from(allIds).sort(); // Sort para estabilidad
  }, [
    includedOutsideRanges,
    dateRanges,
    excludedFromRanges,
    shouldRemovePrivateVideos,
    videos,
  ]);

  const isVideoSelected = useCallback(
    (videoId: PlaylistItemVideoOutput): boolean => {
      return selectedVideoIds.includes(videoId.id);
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

      // Verificar si es un video privado que está seleccionado automáticamente
      const isPrivateVideo = videos?.items?.some(
        (video) =>
          video.id === videoId &&
          video.snippet?.title === PRIVATE_VIDEO_TITLE &&
          video.snippet?.description === PRIVATE_VIDEO_DESCRIPTION
      );
      const isAutoSelectedPrivate =
        isPrivateVideo &&
        shouldRemovePrivateVideos &&
        !isInIncludedOutside &&
        !isInDateRange;

      if (isInDateRange) {
        // Si está en un dateRange, toggle en excludedFromRanges
        if (excludedFromRanges.includes(videoId)) {
          removeExcludedVideoInsideDateRange(videoId);
        } else {
          addExcludedVideoInsideDateRange(videoId);
        }
      } else if (isAutoSelectedPrivate) {
        // Si es un video privado seleccionado automáticamente, agregarlo a excludedFromRanges para excluirlo
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
      shouldRemovePrivateVideos,
      videos,
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
    shouldRemovePrivateVideos,
    setShouldRemovePrivateVideos,
    addDateRange,
    removeDateRange,
  };
}
