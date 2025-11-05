/**
 * YouTube API Service
 * 
 * Esta capa encapsula todas las llamadas a la API de YouTube.
 * El store solo debe usar estos servicios, no llamar directamente a la API.
 */

import { apiClient } from '@/configs/client-config';
import {
  getUserPlaylistsApiYoutubePlaylistsGet,
  getPlaylistVideosApiYoutubePlaylistsPlaylistIdVideosGet,
  type GetUserPlaylistsApiYoutubePlaylistsGetError,
  type GetPlaylistVideosApiYoutubePlaylistsPlaylistIdVideosGetError,
  type GetPlaylistVideosApiYoutubePlaylistsPlaylistIdVideosGetData,
} from '@/api';

export interface GetPlaylistsOptions {
  maxResults?: number;
  pageToken?: string | null;
}

export interface GetPlaylistVideosOptions {
  pageToken?: string | null;
  dateFrom?: Date | null;
  dateTo?: Date | null;
  maxResults?: number;
}

export interface ServiceResult<T> {
  data?: T;
  error?: GetUserPlaylistsApiYoutubePlaylistsGetError | GetPlaylistVideosApiYoutubePlaylistsPlaylistIdVideosGetError;
  success: boolean;
}

/**
 * Obtiene las playlists del usuario
 */
export async function getUserPlaylists(
  options?: GetPlaylistsOptions
): Promise<ServiceResult<Awaited<ReturnType<typeof getUserPlaylistsApiYoutubePlaylistsGet>>['data']>> {
  try {
    const result = await getUserPlaylistsApiYoutubePlaylistsGet({
      client: apiClient,
      query: options
        ? {
            max_results: options.maxResults,
            page_token: options.pageToken || undefined,
          }
        : undefined,
    });

    if (result.response.status === 200 && result.data) {
      return {
        data: result.data,
        success: true,
      };
    }

    if (result.error) {
      return {
        error: result.error,
        success: false,
      };
    }

    return {
      success: false,
    };
  } catch (error) {
    return {
      error: error as GetUserPlaylistsApiYoutubePlaylistsGetError,
      success: false,
    };
  }
}

/**
 * Obtiene videos de una playlist
 */
export async function getPlaylistVideos(
  playlistId: string,
  options?: GetPlaylistVideosOptions
): Promise<ServiceResult<Awaited<ReturnType<typeof getPlaylistVideosApiYoutubePlaylistsPlaylistIdVideosGet>>['data']>> {
  try {
    const query: GetPlaylistVideosApiYoutubePlaylistsPlaylistIdVideosGetData['query'] = {
      page_token: options?.pageToken || undefined,
      date_from: options?.dateFrom?.toISOString() || undefined,
      date_to: options?.dateTo?.toISOString() || undefined,
      max_results: options?.maxResults || 50,
    };

    const result = await getPlaylistVideosApiYoutubePlaylistsPlaylistIdVideosGet({
      client: apiClient,
      path: { playlist_id: playlistId },
      query,
    });

    if (result.response.status === 200 && result.data) {
      return {
        data: result.data,
        success: true,
      };
    }

    if (result.error) {
      return {
        error: result.error,
        success: false,
      };
    }

    return {
      success: false,
    };
  } catch (error) {
    return {
      error: error as GetPlaylistVideosApiYoutubePlaylistsPlaylistIdVideosGetError,
      success: false,
    };
  }
}

