import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { toast } from 'sonner';
import type {
  CreatePlaylistFromSourcesRequest,
  MergePlaylistsRequest,
  PlaylistResponse,
  ProviderInfo,
  ProviderType,
  TrackListResponse,
} from '@/api';
import * as providersService from '@/services/providers';
import { handleServiceError, pluralize } from '@/utils';

const tracksKey = (provider: ProviderType, playlistId: string) =>
  `${provider}:${playlistId}`;

interface ProvidersActions {
  loadProviders: () => Promise<void>;
  setActiveProvider: (provider: ProviderType) => void;
  loadPlaylists: (force?: boolean) => Promise<void>;
  loadTracks: (playlistId: string, force?: boolean) => Promise<void>;
  removeTracks: (playlistId: string, itemIds: string[]) => Promise<boolean>;
  mergePlaylists: (
    request: MergePlaylistsRequest
  ) => Promise<PlaylistResponse | null>;
  createFromPlaylists: (
    request: CreatePlaylistFromSourcesRequest
  ) => Promise<PlaylistResponse | null>;
}

interface ProvidersState {
  providers: ProviderInfo[];
  activeProvider: ProviderType | null;
  playlists: Partial<Record<ProviderType, PlaylistResponse[]>>;
  isLoadingPlaylists: boolean;
  /** Track lists keyed by `${provider}:${playlistId}` */
  tracks: Record<string, TrackListResponse>;
  loadingTracksKey: string | null;
  isMutating: boolean;
  actions: ProvidersActions;
}

const providersStore = create<ProvidersState>()(
  devtools(
    (set, get) => {
      /** Active provider or a toast if none is selected yet. */
      const requireProvider = (): ProviderType | null => {
        const { activeProvider } = get();
        if (!activeProvider) toast.error('Choose a music service first');
        return activeProvider;
      };

      /** Forget cached tracks so the next view refetches them. */
      const invalidateTracks = (provider: ProviderType, ids: string[]) =>
        set((state) => {
          const tracks = { ...state.tracks };
          ids.forEach((id) => delete tracks[tracksKey(provider, id)]);
          return { tracks };
        });

      return {
        providers: [],
        activeProvider: null,
        playlists: {},
        isLoadingPlaylists: false,
        tracks: {},
        loadingTracksKey: null,
        isMutating: false,

        actions: {
          loadProviders: async () => {
            const result = await providersService.listProviders();
            if (handleServiceError(result, 'Failed to load music services')) {
              return;
            }
            const providers = result.data?.providers ?? [];
            set((state) => ({
              providers,
              activeProvider: state.activeProvider ?? providers[0]?.id ?? null,
            }));
          },

          setActiveProvider: (provider) => set({ activeProvider: provider }),

          loadPlaylists: async (force = false) => {
            const provider = get().activeProvider;
            if (!provider || (!force && get().playlists[provider])) return;

            set({ isLoadingPlaylists: true });
            const result = await providersService.listPlaylists(provider);
            set({ isLoadingPlaylists: false });
            if (handleServiceError(result, 'Failed to load playlists')) return;

            set((state) => ({
              playlists: {
                ...state.playlists,
                [provider]: result.data?.playlists ?? [],
              },
            }));
          },

          loadTracks: async (playlistId, force = false) => {
            const provider = get().activeProvider;
            if (!provider) return;
            const key = tracksKey(provider, playlistId);
            if (!force && get().tracks[key]) return;

            set({ loadingTracksKey: key });
            const result = await providersService.getPlaylistTracks(
              provider,
              playlistId
            );
            set({ loadingTracksKey: null });
            if (handleServiceError(result, 'Failed to load tracks')) return;

            const data = result.data;
            if (data) {
              set((state) => ({ tracks: { ...state.tracks, [key]: data } }));
            }
          },

          removeTracks: async (playlistId, itemIds) => {
            const provider = requireProvider();
            if (!provider) return false;

            set({ isMutating: true });
            const result = await providersService.removePlaylistTracks(
              provider,
              playlistId,
              itemIds
            );
            set({ isMutating: false });
            if (handleServiceError(result, 'Failed to remove tracks')) {
              return false;
            }

            const removed = result.data?.removed_count ?? 0;
            toast.success(`Removed ${pluralize(removed, 'track')}`);
            await Promise.all([
              get().actions.loadTracks(playlistId, true),
              get().actions.loadPlaylists(true),
            ]);
            return true;
          },

          mergePlaylists: async (request) => {
            const provider = requireProvider();
            if (!provider) return null;

            set({ isMutating: true });
            const result = await providersService.mergePlaylists(
              provider,
              request
            );
            set({ isMutating: false });
            if (handleServiceError(result, 'Failed to merge playlists')) {
              return null;
            }

            const { playlist, added_count } = result.data!;
            toast.success(`Merged into “${playlist.name}”`, {
              description: `${pluralize(added_count, 'track')} added`,
            });
            invalidateTracks(provider, [playlist.id]);
            await get().actions.loadPlaylists(true);
            return playlist;
          },

          createFromPlaylists: async (request) => {
            const provider = requireProvider();
            if (!provider) return null;

            set({ isMutating: true });
            const result = await providersService.createPlaylistFromSources(
              provider,
              request
            );
            set({ isMutating: false });
            if (handleServiceError(result, 'Failed to create playlist')) {
              return null;
            }

            const { playlist, added_count } = result.data!;
            toast.success(`Created “${playlist.name}”`, {
              description: `${pluralize(added_count, 'track')} added`,
            });
            await get().actions.loadPlaylists(true);
            return playlist;
          },
        },
      };
    },
    { name: 'providers-store' }
  )
);

// Atomic selectors: components only re-render for the slice they read
export const useProvidersList = () => providersStore((s) => s.providers);
export const useActiveProviderId = () =>
  providersStore((s) => s.activeProvider);
export const useActivePlaylists = () =>
  providersStore((s) =>
    s.activeProvider ? s.playlists[s.activeProvider] : undefined
  );
export const useIsLoadingPlaylists = () =>
  providersStore((s) => s.isLoadingPlaylists);
export const usePlaylistTrackList = (playlistId: string | null) =>
  providersStore((s) =>
    s.activeProvider && playlistId
      ? s.tracks[tracksKey(s.activeProvider, playlistId)]
      : undefined
  );
export const useIsLoadingTracks = (playlistId: string | null) =>
  providersStore(
    (s) =>
      !!s.activeProvider &&
      !!playlistId &&
      s.loadingTracksKey === tracksKey(s.activeProvider, playlistId)
  );
export const useIsMutating = () => providersStore((s) => s.isMutating);
export const useProvidersActions = () => providersStore((s) => s.actions);
