import { create } from 'zustand';
import { getUserPlaylistsApiYoutubePlaylistsGet } from '@/api';
import { apiClient } from '@/configs/client-config';

interface YoutubeState {
  getUserPlaylists: () => Promise<void>;
}

const useYoutube = create<YoutubeState>((set) => ({
  getUserPlaylists: async () => {
    const { data, error, response } =
      await getUserPlaylistsApiYoutubePlaylistsGet({
        client: apiClient,
      });
    if (response.status === 200 && data) {
      set((state) => ({
        ...state,
        playlists: data,
      }));
    }
    if (error) {
      console.error('Get playlists error:', error);
    }
  },
}));

export default useYoutube;
