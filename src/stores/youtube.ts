import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { toast } from 'sonner';
import {
  type YoutubePlaylistListResponse,
  type GetUserPlaylistsApiYoutubePlaylistsGetError,
  type PlaylistVideoResponse,
  type GetPlaylistVideosApiYoutubePlaylistsPlaylistIdVideosGetError,
} from '@/api';
import {
  getUserPlaylists as getUserPlaylistsService,
  getPlaylistVideos as getPlaylistVideosService,
  deletePlaylistVideos,
} from '@/services/youtube';
import { createDateRange, handleServiceError } from '@/utils';

export interface YoutubeActions {
  getUserPlaylists: () => Promise<void>;
  getVideosFromSelectedPlaylist: (
    options?: { pageToken?: string | null; append?: boolean },
    dateRange?: { start: Date | null; end: Date | null }
  ) => Promise<void>;
  setSelectedPlaylistId: (playlistId: string) => void;
  addIncludedVideoOutsideDateRange: (videoId: string) => void;
  addExcludedVideoInsideDateRange: (videoId: string) => void;
  addDateRange: (start: Date | null, end: Date | null) => Promise<void>;
  removeExcludedVideoInsideDateRange: (videoId: string) => void;
  removeIncludedVideoOutsideDateRange: (videoId: string) => void;
  removeDateRange: (start: Date | null) => void;
  clearAllSelections: () => void;
  clearVideos: () => void;
  selectAllVideos: () => void;
  setShouldRemovePrivateVideos: (value: boolean) => void;
  deleteVideos: (videos: string[]) => Promise<void>;
}

/**
 * Base state shared for async operations that load videos
 */
interface BaseVideosLoadingState {
  videos: PlaylistVideoResponse | null;
  isLoading: boolean;
  error: GetPlaylistVideosApiYoutubePlaylistsPlaylistIdVideosGetError | null;
}

interface DateRangeSelection extends BaseVideosLoadingState {
  start: Date | null;
  end: Date | null;
}

/**
 * Normalized video selection state
 * Unifies all selection forms into a single structure
 */
interface VideoSelectionState {
  // IDs selected manually (direct click on video)
  includedOutsideRanges: string[];
  // Date ranges with their selected videos
  dateRanges: { [dateKey: string]: DateRangeSelection };
  // IDs of videos excluded from date ranges
  excludedFromRanges: string[];
}

interface PlaylistVideosState extends BaseVideosLoadingState {}

interface YoutubeState {
  // Actions
  actions: YoutubeActions;
  // State
  playlists: YoutubePlaylistListResponse | null;
  playlistVideos: PlaylistVideosState;

  // Loading states
  isLoadingPlaylists: boolean;
  // Error states
  playlistsError: GetUserPlaylistsApiYoutubePlaylistsGetError | null;
  selectedPlaylistId: string | null;
  // Estado normalizado de selección
  videoSelection: VideoSelectionState;
  shouldRemovePrivateVideos: boolean;
}

const youtubeStore = create<YoutubeState>()(
  devtools(
    (set, get) => ({
      // Initial state
      playlists: null,
      playlistVideos: {
        videos: null,
        isLoading: false,
        error: null,
      },

      isLoadingPlaylists: false,
      playlistsError: null,
      selectedPlaylistId: null,

      videoSelection: {
        includedOutsideRanges: [],
        dateRanges: {},
        excludedFromRanges: [],
      },
      shouldRemovePrivateVideos: false,
      // Actions nested in actions object
      actions: {
        setSelectedPlaylistId: (playlistId: string) =>
          set({
            selectedPlaylistId:
              playlistId === get().selectedPlaylistId ? null : playlistId,
          }),

        getUserPlaylists: async () => {
          set({ isLoadingPlaylists: true, playlistsError: null });

          const result = await getUserPlaylistsService();

          if (result.success && result.data) {
            set({
              playlists: result.data,
              playlistsError: null,
              isLoadingPlaylists: false,
            });
          } else if (result.error) {
            set({
              playlistsError: result.error,
              isLoadingPlaylists: false,
            });
            handleServiceError(result, 'Failed to load playlists');
          } else {
            set({
              playlistsError: null,
              isLoadingPlaylists: false,
            });
          }
        },

        getVideosFromSelectedPlaylist: async (
          options?: { pageToken?: string | null; append?: boolean },
          dateRange?: { start: Date | null; end: Date | null }
        ) => {
          if (!get().selectedPlaylistId) {
            return;
          }
          set((state) => ({
            playlistVideos: {
              ...state.playlistVideos,
              isLoading: true,
              error: null,
            },
          }));

          const result = await getPlaylistVideosService(
            get().selectedPlaylistId!,
            {
              pageToken: options?.pageToken,
              dateFrom: dateRange?.start,
              dateTo: dateRange?.end,
              maxResults: 50,
            }
          );

          if (result.success && result.data) {
            const newVideos = result.data;
            set((state) => ({
              playlistVideos: {
                videos:
                  options?.append && state.playlistVideos.videos
                    ? {
                        ...newVideos,
                        items: [
                          ...state.playlistVideos.videos.items,
                          ...newVideos.items,
                        ],
                      }
                    : newVideos,
                isLoading: false,
                error: null,
              },
            }));
          } else if (result.error) {
            set((state) => ({
              playlistVideos: {
                videos: state.playlistVideos.videos,
                error: result.error ?? null,
                isLoading: false,
              },
            }));
            handleServiceError(result, 'Failed to load videos');
          } else {
            set((state) => ({
              playlistVideos: {
                videos: state.playlistVideos.videos,
                error: null,
                isLoading: false,
              },
            }));
          }
        },
        addDateRange: async (start: Date | null, end: Date | null) => {
          const playlistId = get().selectedPlaylistId;
          if (!playlistId) return;

          // Check if there's an intersection with existing ranges
          const state = get();
          const existingRanges = Object.values(state.videoSelection.dateRanges);

          const hasIntersection = existingRanges.some((range) => {
            if (!start || !end || !range.start || !range.end) return false;

            // Normalize dates for comparison (date only, without time)
            const newStart = new Date(start);
            newStart.setHours(0, 0, 0, 0);
            const newEnd = new Date(end);
            newEnd.setHours(23, 59, 59, 999);

            const existingStart = new Date(range.start);
            existingStart.setHours(0, 0, 0, 0);
            const existingEnd = new Date(range.end);
            existingEnd.setHours(23, 59, 59, 999);

            // Check intersection: two ranges intersect if:
            // newStart <= existingEnd && newEnd >= existingStart
            return newStart <= existingEnd && newEnd >= existingStart;
          });

          if (hasIntersection) {
            toast.warning('The date range intersects with an existing range');
            return;
          }

          const dateKey = start?.toISOString() || '';
          const dateRange = createDateRange(
            start,
            end,
            null,
            true,
            null
          ) as DateRangeSelection;

          // Set loading state
          set((state) => ({
            videoSelection: {
              ...state.videoSelection,
              dateRanges: {
                ...state.videoSelection.dateRanges,
                [dateKey]: dateRange,
              },
            },
          }));

          // Fetch videos from API
          const result = await getPlaylistVideosService(playlistId, {
            dateFrom: start,
            dateTo: end,
          });

          // Determine final state
          const finalDateRange =
            result.success && result.data
              ? (createDateRange(
                  start,
                  end,
                  result.data,
                  false,
                  null
                ) as DateRangeSelection)
              : (createDateRange(
                  start,
                  end,
                  null,
                  false,
                  result.error ?? null
                ) as DateRangeSelection);

          // Update with results
          set((state) => {
            const newState = {
              videoSelection: {
                ...state.videoSelection,
                dateRanges: {
                  ...state.videoSelection.dateRanges,
                  [dateKey]: finalDateRange,
                },
              },
            };

            // If there's data, filter includedOutsideRanges
            if (result.success && result.data) {
              newState.videoSelection.includedOutsideRanges =
                state.videoSelection.includedOutsideRanges.filter(
                  (id) => !result.data?.items?.some((video) => video.id === id)
                );
            }

            return newState;
          });

          if (result.error) {
            handleServiceError(result, 'Failed to load videos by date range');
          }
        },

        addIncludedVideoOutsideDateRange: (videoId: string) => {
          set((state) => ({
            videoSelection: {
              ...state.videoSelection,
              includedOutsideRanges: [
                ...state.videoSelection.includedOutsideRanges,
                videoId,
              ].filter((id, index, arr) => arr.indexOf(id) === index), // Remove duplicates
            },
          }));
        },

        addExcludedVideoInsideDateRange: (videoId: string) => {
          set((state) => ({
            videoSelection: {
              ...state.videoSelection,
              excludedFromRanges: [
                ...state.videoSelection.excludedFromRanges,
                videoId,
              ].filter((id, index, arr) => arr.indexOf(id) === index), // Remove duplicates
            },
          }));
        },

        removeDateRange: (start: Date | null) => {
          set((state) => {
            const dateKey = start?.toISOString() || '';
            const dateRangeToRemove = state.videoSelection.dateRanges[dateKey];
            const newDateRanges = { ...state.videoSelection.dateRanges };
            delete newDateRanges[dateKey];

            // Get video IDs from the removed range
            const videoIdsInRange =
              dateRangeToRemove?.videos?.items?.map((video) => video.id) || [];

            return {
              videoSelection: {
                ...state.videoSelection,
                dateRanges: newDateRanges,
                // Remove from excludedFromRanges the videos that were in this range
                excludedFromRanges:
                  state.videoSelection.excludedFromRanges.filter(
                    (id) => !videoIdsInRange.includes(id)
                  ),
              },
            };
          });
        },

        removeIncludedVideoOutsideDateRange: (videoId: string) => {
          set((state) => ({
            videoSelection: {
              ...state.videoSelection,
              includedOutsideRanges:
                state.videoSelection.includedOutsideRanges.filter(
                  (id) => id !== videoId
                ),
            },
          }));
        },

        removeExcludedVideoInsideDateRange: (videoId: string) => {
          set((state) => ({
            videoSelection: {
              ...state.videoSelection,
              excludedFromRanges:
                state.videoSelection.excludedFromRanges.filter(
                  (id) => id !== videoId
                ),
            },
          }));
        },

        clearAllSelections: () => {
          set({
            videoSelection: {
              includedOutsideRanges: [],
              dateRanges: {},
              excludedFromRanges: [],
            },
            shouldRemovePrivateVideos: false,
          });
        },
        clearVideos: () => {
          set({
            playlistVideos: {
              videos: null,
              isLoading: false,
              error: null,
            },
          });
        },

        selectAllVideos: () => {
          const state = get();
          const allVideoIds = new Set<string>();

          // Add videos from all date ranges
          Object.values(state.videoSelection.dateRanges).forEach((range) => {
            if (range.videos?.items) {
              range.videos.items.forEach((video) => allVideoIds.add(video.id));
            }
          });

          // Add videos from playlist
          if (state.playlistVideos.videos?.items) {
            state.playlistVideos.videos.items.forEach((video) =>
              allVideoIds.add(video.id)
            );
          }

          set({
            videoSelection: {
              ...state.videoSelection,
              includedOutsideRanges: [
                ...new Set([
                  ...state.videoSelection.includedOutsideRanges,
                  ...Array.from(allVideoIds),
                ]),
              ],
            },
          });
        },
        setShouldRemovePrivateVideos: (value: boolean) => {
          set({ shouldRemovePrivateVideos: value });
        },
        deleteVideos: async (videos: string[]) => {
          if (!get().selectedPlaylistId) {
            return;
          }
          const result = await deletePlaylistVideos(
            get().selectedPlaylistId!,
            videos,
            get().shouldRemovePrivateVideos
          );

          if (result.success) {
            toast.success('Videos deleted successfully');
            get().actions.clearAllSelections();
            get().actions.clearVideos();
            set({
              selectedPlaylistId: null,
            });
          } else if (result.error) {
            handleServiceError(result, 'Failed to delete videos');
          }
        },
      } satisfies YoutubeActions,
    }),
    { name: 'YoutubeStore' } // name for Redux DevTools
  )
);

// Playlist selectors - atomic values
export const usePlaylists = () => youtubeStore((state) => state.playlists);
export const useIsLoadingPlaylists = () =>
  youtubeStore((state) => state.isLoadingPlaylists);
export const usePlaylistsError = () =>
  youtubeStore((state) => state.playlistsError);

export const useSelectedPlaylistId = () =>
  youtubeStore((state) => state.selectedPlaylistId);

// Video selectors - atomic values
export const useVideos = () =>
  youtubeStore((state) => state.playlistVideos.videos);
export const useIsLoadingVideos = () =>
  youtubeStore((state) => state.playlistVideos.isLoading);
export const useVideosError = () =>
  youtubeStore((state) => state.playlistVideos.error);

// Video selection selectors - atomic values
export const useVideoSelectionState = () =>
  youtubeStore((state) => state.videoSelection);

// Atomic selectors for individual parts of selection state
export const useIncludedOutsideRanges = () =>
  youtubeStore((state) => state.videoSelection.includedOutsideRanges);
export const useDateRangesSelection = () =>
  youtubeStore((state) => state.videoSelection.dateRanges);
export const useExcludedFromRanges = () =>
  youtubeStore((state) => state.videoSelection.excludedFromRanges);

export const useShouldRemovePrivateVideos = () =>
  youtubeStore((state) => state.shouldRemovePrivateVideos);

// Actions - single export for all actions
// The actions object is stable as it's defined once in the store
export const useYoutubeActions = () => youtubeStore((state) => state.actions);
