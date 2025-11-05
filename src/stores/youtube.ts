import { create } from 'zustand';
import {
  type YoutubePlaylistListResponse,
  type GetUserPlaylistsApiYoutubePlaylistsGetError,
  type PlaylistVideoResponse,
  type GetPlaylistVideosApiYoutubePlaylistsPlaylistIdVideosGetError,
  type PlaylistItemVideoOutput,
} from '@/api';
import {
  getUserPlaylists as getUserPlaylistsService,
  getPlaylistVideos as getPlaylistVideosService,
} from '@/services/youtube';

export interface YoutubeActions {
  getUserPlaylists: () => Promise<void>;
  getVideosFromSelectedPlaylist: (
    options?: { pageToken?: string | null; append?: boolean },
    dateRange?: { start: Date | null; end: Date | null }
  ) => Promise<void>;
  setSelectedPlaylistId: (playlistId: string) => void;
  toggleVideoSelection: (video: PlaylistItemVideoOutput) => void;
  addIncludeVideosByDateRange: (
    start: Date | null,
    end: Date | null
  ) => Promise<void>;
  addIncludeVideosOutsideOfDateRanges: (videoIds: string[]) => void;
  addExcludeVideosInsideDateRanges: (videoIds: string[]) => void;
  removeIncludeVideosByDateRange: (start: Date | null) => void;
  removeIncludeVideosOutsideOfDateRanges: (videoIds: string[]) => void;
  removeExcludeVideosInsideDateRanges: (videoIds: string[]) => void;
  clearAllSelections: () => void;
  selectAllVideos: (videoIds: string[]) => void;
}

interface DateRangeSelection {
  start: Date | null;
  end: Date | null;
  videoIds: string[];
  isLoading: boolean;
  error: GetPlaylistVideosApiYoutubePlaylistsPlaylistIdVideosGetError | null;
}

/**
 * Estado normalizado de selección de videos
 * Unifica todas las formas de selección en una sola estructura
 */
interface VideoSelectionState {
  // IDs seleccionados manualmente (click directo en video)
  manual: string[];
  // Rangos de fecha con sus videos seleccionados
  dateRanges: { [dateKey: string]: DateRangeSelection };
  // IDs de videos excluidos de los rangos de fecha
  excludedFromRanges: string[];
}

interface PlaylistVideosState {
  videos: PlaylistVideoResponse | null;
  isLoading: boolean;
  error: GetPlaylistVideosApiYoutubePlaylistsPlaylistIdVideosGetError | null;
}

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
}

const youtubeStore = create<YoutubeState>((set, get) => ({
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
    manual: [],
    dateRanges: {},
    excludedFromRanges: [],
  },
  // Actions nested in actions object
  actions: {
    setSelectedPlaylistId: (playlistId: string) =>
      set({ selectedPlaylistId: playlistId }),

    toggleVideoSelection: (video: PlaylistItemVideoOutput) => {
      set((state) => {
        const isSelected = state.videoSelection.manual.some(
          (id) => id === video.id
        );
        if (isSelected) {
          return {
            videoSelection: {
              ...state.videoSelection,
              manual: state.videoSelection.manual.filter(
                (id) => id !== video.id
              ),
            },
          };
        }
        return {
          videoSelection: {
            ...state.videoSelection,
            manual: [...state.videoSelection.manual, video.id],
          },
        };
      });
    },

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
        console.error('Get playlists error:', result.error);
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

      const result = await getPlaylistVideosService(get().selectedPlaylistId!, {
        pageToken: options?.pageToken,
        dateFrom: dateRange?.start,
        dateTo: dateRange?.end,
        maxResults: 50,
      });

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
        console.error('Get playlist videos error:', result.error);
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
    addIncludeVideosByDateRange: async (
      start: Date | null,
      end: Date | null
    ) => {
      if (!get().selectedPlaylistId) {
        return;
      }
      const dateKey = start?.toISOString() || '';

      // Set loading state
      set((state) => ({
        videoSelection: {
          ...state.videoSelection,
          dateRanges: {
            ...state.videoSelection.dateRanges,
            [dateKey]: {
              start,
              end,
              videoIds: [],
              isLoading: true,
              error: null,
            },
          },
        },
      }));

      // Fetch videos from API
      const result = await getPlaylistVideosService(get().selectedPlaylistId!, {
        dateFrom: start,
        dateTo: end,
      });

      // Update with results
      if (result.success && result.data) {
        const videoIds = result.data?.items?.map((item) => item.id) || [];
        set((state) => ({
          videoSelection: {
            ...state.videoSelection,
            dateRanges: {
              ...state.videoSelection.dateRanges,
              [dateKey]: {
                start,
                end,
                videoIds,
                isLoading: false,
                error: null,
              },
            },
          },
        }));
      } else if (result.error) {
        set((state) => ({
          videoSelection: {
            ...state.videoSelection,
            dateRanges: {
              ...state.videoSelection.dateRanges,
              [dateKey]: {
                start,
                end,
                videoIds: [],
                isLoading: false,
                error: result.error ?? null,
              },
            },
          },
        }));
        console.error('Get videos by date range error:', result.error);
      } else {
        set((state) => ({
          videoSelection: {
            ...state.videoSelection,
            dateRanges: {
              ...state.videoSelection.dateRanges,
              [dateKey]: {
                start,
                end,
                videoIds: [],
                isLoading: false,
                error: null,
              },
            },
          },
        }));
      }
    },

    addIncludeVideosOutsideOfDateRanges: (videoIds: string[]) => {
      set((state) => ({
        videoSelection: {
          ...state.videoSelection,
          manual: [...state.videoSelection.manual, ...videoIds],
        },
      }));
    },

    addExcludeVideosInsideDateRanges: (videoIds: string[]) => {
      set((state) => ({
        videoSelection: {
          ...state.videoSelection,
          excludedFromRanges: [
            ...state.videoSelection.excludedFromRanges,
            ...videoIds,
          ],
        },
      }));
    },

    removeIncludeVideosByDateRange: (start: Date | null) => {
      set((state) => {
        const dateKey = start?.toISOString() || '';
        const newDateRanges = { ...state.videoSelection.dateRanges };
        delete newDateRanges[dateKey];
        return {
          videoSelection: {
            ...state.videoSelection,
            dateRanges: newDateRanges,
          },
        };
      });
    },

    removeIncludeVideosOutsideOfDateRanges: (videoIds: string[]) => {
      set((state) => ({
        videoSelection: {
          ...state.videoSelection,
          manual: state.videoSelection.manual.filter(
            (videoId) => !videoIds.includes(videoId)
          ),
        },
      }));
    },
    removeExcludeVideosInsideDateRanges: (videoIds: string[]) => {
      set((state) => ({
        videoSelection: {
          ...state.videoSelection,
          excludedFromRanges: state.videoSelection.excludedFromRanges.filter(
            (id) => !videoIds.includes(id)
          ),
        },
      }));
    },

    clearAllSelections: () => {
      set({
        videoSelection: {
          manual: [],
          dateRanges: {},
          excludedFromRanges: [],
        },
      });
    },

    selectAllVideos: (videoIds: string[]) => {
      set((state) => ({
        videoSelection: {
          ...state.videoSelection,
          manual: [...new Set([...state.videoSelection.manual, ...videoIds])],
        },
      }));
    },
  },
}));

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
export const useManualSelection = () =>
  youtubeStore((state) => state.videoSelection.manual);
export const useDateRangesSelection = () =>
  youtubeStore((state) => state.videoSelection.dateRanges);
export const useExcludedFromRanges = () =>
  youtubeStore((state) => state.videoSelection.excludedFromRanges);

// Note: useSelectedVideoIds se movió a useVideoSelection hook
// para evitar loops infinitos con useMemo

// Legacy selector for backward compatibility
export const useIncludedVideos = () =>
  youtubeStore((state) => state.videoSelection.manual);

// Actions - single export for all actions
export const useYoutubeActions = () => youtubeStore((state) => state.actions);
