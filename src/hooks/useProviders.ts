import {
  useActivePlaylists,
  useActiveProviderId,
  useIsLoadingPlaylists,
  useIsLoadingTracks,
  useIsMutating,
  usePlaylistTrackList,
  useProvidersActions,
  useProvidersList,
} from '@/stores/providers';

/**
 * Providers and the active one. Components never access the store directly.
 */
export function useProviders() {
  const providers = useProvidersList();
  const activeProviderId = useActiveProviderId();
  const { loadProviders, setActiveProvider } = useProvidersActions();

  return {
    providers,
    activeProvider: providers.find((p) => p.id === activeProviderId) ?? null,
    loadProviders,
    setActiveProvider,
  };
}

/** Playlists of the active provider. */
export function usePlaylists() {
  const playlists = useActivePlaylists();
  const isLoading = useIsLoadingPlaylists();
  const { loadPlaylists } = useProvidersActions();

  return { playlists, isLoading, loadPlaylists };
}

/** Tracks of one playlist of the active provider. */
export function usePlaylistTracks(playlistId: string | null) {
  const trackList = usePlaylistTrackList(playlistId);
  const isLoading = useIsLoadingTracks(playlistId);
  const { loadTracks } = useProvidersActions();

  return {
    tracks: trackList?.tracks,
    duplicateItemIds: trackList?.duplicate_item_ids,
    isLoading,
    loadTracks,
  };
}

/** Write operations (remove, merge, create) and their pending state. */
export function usePlaylistOperations() {
  const isMutating = useIsMutating();
  const { removeTracks, mergePlaylists, createFromPlaylists } =
    useProvidersActions();

  return { isMutating, removeTracks, mergePlaylists, createFromPlaylists };
}
