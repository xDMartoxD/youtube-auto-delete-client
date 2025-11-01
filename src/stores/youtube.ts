import { create } from 'zustand';
import {
  getUserPlaylistsApiYoutubePlaylistsGet,
  getPlaylistVideosApiYoutubePlaylistsPlaylistIdVideosGet,
  type YoutubePlaylistListResponse,
  type GetUserPlaylistsApiYoutubePlaylistsGetError,
  type PlaylistVideoResponse,
  type GetPlaylistVideosApiYoutubePlaylistsPlaylistIdVideosGetError,
  type PlaylistItemVideoOutput,
} from '@/api';
import { apiClient } from '@/configs/client-config';

interface YoutubeState {
  // Actions
  getUserPlaylists: () => Promise<void>;
  getVideosFromPlaylist: (
    playlistId: string,
    options?: { pageToken?: string | null; append?: boolean }
  ) => Promise<void>;
  setSelectedPlaylistId: (playlistId: string) => void;
  toggleVideoSelection: (video: PlaylistItemVideoOutput) => void;
  clearSelectedVideos: () => void;
  selectAllVideos: () => void;
  // State
  playlists: YoutubePlaylistListResponse | null;
  videos: PlaylistVideoResponse | null;
  selectedVideos: PlaylistItemVideoOutput[];
  // Loading states
  isLoadingPlaylists: boolean;
  isLoadingVideos: boolean;
  // Error states
  playlistsError: GetUserPlaylistsApiYoutubePlaylistsGetError | null;
  videosError: GetPlaylistVideosApiYoutubePlaylistsPlaylistIdVideosGetError | null;
  selectedPlaylistId: string | null;
}

const useYoutube = create<YoutubeState>((set) => ({
  // Initial state
  playlists: null,
  videos: null,
  selectedVideos: [],
  isLoadingPlaylists: false,
  isLoadingVideos: false,
  playlistsError: null,
  videosError: null,
  selectedPlaylistId: null,

  setSelectedPlaylistId: (playlistId: string) =>
    set({ selectedPlaylistId: playlistId }),

  toggleVideoSelection: (video: PlaylistItemVideoOutput) => {
    set((state) => {
      const isSelected = state.selectedVideos.some((v) => v.id === video.id);
      if (isSelected) {
        return {
          selectedVideos: state.selectedVideos.filter((v) => v.id !== video.id),
        };
      }
      return {
        selectedVideos: [...state.selectedVideos, video],
      };
    });
  },

  clearSelectedVideos: () => set({ selectedVideos: [] }),

  selectAllVideos: () =>
    set((state) => {
      if (!state.videos?.items) return state;
      return {
        selectedVideos: [...state.videos.items],
      };
    }),

  getUserPlaylists: async () => {
    set({ isLoadingPlaylists: true, playlistsError: null });

    try {
      const result = await getUserPlaylistsApiYoutubePlaylistsGet({
        client: apiClient,
      });

      if (result.response.status === 200 && result.data) {
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
    } catch (error) {
      const typedError = error as GetUserPlaylistsApiYoutubePlaylistsGetError;
      set({
        playlistsError: typedError,
        isLoadingPlaylists: false,
      });
      console.error('Unexpected error getting playlists:', error);
    }
  },

  getVideosFromPlaylist: async (
    playlistId: string,
    options?: { pageToken?: string | null; append?: boolean }
  ) => {
    set({ isLoadingVideos: true, videosError: null });

    try {
      const result =
        await getPlaylistVideosApiYoutubePlaylistsPlaylistIdVideosGet({
          client: apiClient,
          path: { playlist_id: playlistId },
          query: options?.pageToken
            ? { page_token: options.pageToken }
            : undefined,
        });

      if (result.response.status === 200 && result.data) {
        const newVideos = result.data;
        set((state) => ({
          videos:
            options?.append && state.videos
              ? {
                  ...newVideos,
                  items: [...state.videos.items, ...newVideos.items],
                }
              : newVideos,
          videosError: null,
          isLoadingVideos: false,
        }));
      } else if (result.error) {
        set({
          videosError: result.error,
          isLoadingVideos: false,
        });
        console.error('Get playlist videos error:', result.error);
      } else {
        set({
          videosError: null,
          isLoadingVideos: false,
        });
      }
    } catch (error) {
      const typedError =
        error as GetPlaylistVideosApiYoutubePlaylistsPlaylistIdVideosGetError;
      set({
        videosError: typedError,
        isLoadingVideos: false,
      });
      console.error('Unexpected error getting videos:', error);
    }
  },
}));

export default useYoutube;
