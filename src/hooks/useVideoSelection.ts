import { useCallback, useMemo, useState } from 'react';
import {
  useDateRangesSelection,
  useExcludedFromRanges,
  useIncludedOutsideRanges,
  useShouldRemoveDeletedVideos,
  useShouldRemovePrivateVideos,
  useVideos,
  useYoutubeActions,
} from '@/stores/youtube';
import type { PlaylistItemVideoOutput } from '@/api';
import {
  DELETED_VIDEO_DESCRIPTION,
  DELETED_VIDEO_TITLE,
  PRIVATE_VIDEO_DESCRIPTION,
  PRIVATE_VIDEO_TITLE,
} from '@/constants';
import { handleApiError } from '@/utils';

/**
 * Hook para manejar la selección de videos
 * Encapsula la lógica de selección y proporciona utilidades
 * Usa la estructura normalizada de selección
 *
 * @returns {Object} Video selection state and actions
 * @returns {string[]} selectedVideoIds - Array of selected video IDs
 * @returns {Function} isVideoSelected - Function to check if a video is selected
 * @returns {Function} toggleVideoSelection - Function to toggle video selection
 * @returns {number} selectedVideosCount - Number of selected videos
 * @returns {boolean} hasSelectedVideos - Whether there are any selected videos
 * @returns {Function} deleteSelectedVideos - Function to delete selected videos
 * @returns {boolean} isDeleting - Whether deletion is in progress
 */
export function useVideoSelection() {
  // Usar selectores atómicos para evitar re-renders innecesarios
  const includedOutsideRanges = useIncludedOutsideRanges();
  const dateRanges = useDateRangesSelection();
  const excludedFromRanges = useExcludedFromRanges();
  const shouldRemovePrivateVideos = useShouldRemovePrivateVideos();
  const shouldRemoveDeletedVideos = useShouldRemoveDeletedVideos();
  const videos = useVideos();
  const {
    addIncludedVideoOutsideDateRange,
    addExcludedVideoInsideDateRange,
    addDateRange,
    removeDateRange,
    removeExcludedVideoInsideDateRange,
    removeIncludedVideoOutsideDateRange,
    setShouldRemovePrivateVideos,
    setShouldRemoveDeletedVideos,
    deleteVideos,
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
        if (
          video.snippet?.title === PRIVATE_VIDEO_TITLE &&
          video.snippet?.description === PRIVATE_VIDEO_DESCRIPTION &&
          !excludedFromRanges.includes(video.id)
        ) {
          allIds.add(video.id);
        }
      });
    }

    if (shouldRemoveDeletedVideos && videos?.items) {
      videos.items.forEach((video) => {
        if (
          video.snippet?.title === DELETED_VIDEO_TITLE &&
          video.snippet?.description === DELETED_VIDEO_DESCRIPTION &&
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
    shouldRemoveDeletedVideos,
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

  // Delete videos functionality
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteSelectedVideos = useCallback(async () => {
    if (selectedVideoIds.length === 0) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteVideos(selectedVideoIds);
    } catch (error) {
      handleApiError(error, 'Failed to delete videos');
    } finally {
      setIsDeleting(false);
    }
  }, [selectedVideoIds, deleteVideos]);

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
    shouldRemoveDeletedVideos,
    setShouldRemoveDeletedVideos,
    addDateRange,
    removeDateRange,
    deleteSelectedVideos,
    isDeleting,
  };
}
