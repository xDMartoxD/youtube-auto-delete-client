/**
 * Playlist providers service
 *
 * Wraps the generated SDK for /v1/providers. Stores use these functions,
 * never the SDK directly.
 */

import { apiClient } from '@/configs/client-config';
import {
  createPlaylistFromSourcesV1ProvidersProviderPlaylistsPost,
  getPlaylistTracksV1ProvidersProviderPlaylistsPlaylistIdTracksGet,
  listPlaylistsV1ProvidersProviderPlaylistsGet,
  listProvidersV1ProvidersGet,
  mergePlaylistsV1ProvidersProviderPlaylistsMergePost,
  removePlaylistTracksV1ProvidersProviderPlaylistsPlaylistIdTracksRemovePost,
  type CreatePlaylistFromSourcesRequest,
  type MergePlaylistsRequest,
  type ProviderType,
} from '@/api';
import { toServiceResult } from './result';

export function listProviders() {
  return toServiceResult(listProvidersV1ProvidersGet({ client: apiClient }));
}

export function listPlaylists(provider: ProviderType) {
  return toServiceResult(
    listPlaylistsV1ProvidersProviderPlaylistsGet({
      client: apiClient,
      path: { provider },
    })
  );
}

export function getPlaylistTracks(provider: ProviderType, playlistId: string) {
  return toServiceResult(
    getPlaylistTracksV1ProvidersProviderPlaylistsPlaylistIdTracksGet({
      client: apiClient,
      path: { provider, playlist_id: playlistId },
    })
  );
}

export function removePlaylistTracks(
  provider: ProviderType,
  playlistId: string,
  itemIds: string[]
) {
  return toServiceResult(
    removePlaylistTracksV1ProvidersProviderPlaylistsPlaylistIdTracksRemovePost({
      client: apiClient,
      path: { provider, playlist_id: playlistId },
      body: { item_ids: itemIds },
    })
  );
}

export function mergePlaylists(
  provider: ProviderType,
  request: MergePlaylistsRequest
) {
  return toServiceResult(
    mergePlaylistsV1ProvidersProviderPlaylistsMergePost({
      client: apiClient,
      path: { provider },
      body: request,
    })
  );
}

export function createPlaylistFromSources(
  provider: ProviderType,
  request: CreatePlaylistFromSourcesRequest
) {
  return toServiceResult(
    createPlaylistFromSourcesV1ProvidersProviderPlaylistsPost({
      client: apiClient,
      path: { provider },
      body: request,
    })
  );
}
