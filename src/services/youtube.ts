/**
 * YouTube API Service
 *
 * Esta capa encapsula todas las llamadas a la API de YouTube.
 * El store solo debe usar estos servicios, no llamar directamente a la API.
 */

import { apiClient } from '@/configs/client-config';
import {
  getUserPlaylistsV1YoutubePlaylistsGet,
  getPlaylistVideosV1YoutubePlaylistsPlaylistIdVideosGet,
  deletePlaylistVideosV1YoutubePlaylistsPlaylistIdDeletePost,
  type GetUserPlaylistsV1YoutubePlaylistsGetError,
  type GetPlaylistVideosV1YoutubePlaylistsPlaylistIdVideosGetError,
  type GetPlaylistVideosV1YoutubePlaylistsPlaylistIdVideosGetData,
  type DeletePlaylistVideosV1YoutubePlaylistsPlaylistIdDeletePostError,
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
  error?:
    | GetUserPlaylistsV1YoutubePlaylistsGetError
    | GetPlaylistVideosV1YoutubePlaylistsPlaylistIdVideosGetError
    | DeletePlaylistVideosV1YoutubePlaylistsPlaylistIdDeletePostError;
  success: boolean;
}

/**
 * Obtiene las playlists del usuario
 *
 * @param {GetPlaylistsOptions} [options] - Opciones para obtener playlists
 * @param {number} [options.maxResults] - Número máximo de resultados
 * @param {string | null} [options.pageToken] - Token de paginación
 * @returns {Promise<ServiceResult>} Resultado con las playlists o error
 */
export async function getUserPlaylists(
  options?: GetPlaylistsOptions
): Promise<
  ServiceResult<
    Awaited<ReturnType<typeof getUserPlaylistsV1YoutubePlaylistsGet>>['data']
  >
> {
  try {
    const result = await getUserPlaylistsV1YoutubePlaylistsGet({
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
      error: error as GetUserPlaylistsV1YoutubePlaylistsGetError,
      success: false,
    };
  }
}

/**
 * Obtiene videos de una playlist
 *
 * @param {string} playlistId - ID de la playlist
 * @param {GetPlaylistVideosOptions} [options] - Opciones para obtener videos
 * @param {string | null} [options.pageToken] - Token de paginación
 * @param {Date | null} [options.dateFrom] - Fecha de inicio para filtrar
 * @param {Date | null} [options.dateTo] - Fecha de fin para filtrar
 * @param {number} [options.maxResults] - Número máximo de resultados (default: 50)
 * @returns {Promise<ServiceResult>} Resultado con los videos o error
 */
export async function getPlaylistVideos(
  playlistId: string,
  options?: GetPlaylistVideosOptions
): Promise<
  ServiceResult<
    Awaited<
      ReturnType<typeof getPlaylistVideosV1YoutubePlaylistsPlaylistIdVideosGet>
    >['data']
  >
> {
  try {
    const query: GetPlaylistVideosV1YoutubePlaylistsPlaylistIdVideosGetData['query'] =
      {
        page_token: options?.pageToken || undefined,
        date_from: options?.dateFrom?.toISOString() || undefined,
        date_to: options?.dateTo?.toISOString() || undefined,
        max_results: options?.maxResults || 50,
      };

    const result = await getPlaylistVideosV1YoutubePlaylistsPlaylistIdVideosGet(
      {
        client: apiClient,
        path: { playlist_id: playlistId },
        query,
      }
    );

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
      error:
        error as GetPlaylistVideosV1YoutubePlaylistsPlaylistIdVideosGetError,
      success: false,
    };
  }
}

/**
 * Elimina videos de una playlist
 *
 * @param {string} playlistId - ID de la playlist
 * @param {string[]} videoIds - Array de IDs de videos a eliminar
 * @param {boolean} includePrivateVideos - Si incluir videos privados en la eliminación
 * @returns {Promise<ServiceResult<void>>} Resultado de la operación
 */
export async function deletePlaylistVideos(
  playlistId: string,
  videoIds: string[],
  includePrivateVideos: boolean,
  includeDeleteVideos: boolean
): Promise<ServiceResult<void>> {
  try {
    const result =
      await deletePlaylistVideosV1YoutubePlaylistsPlaylistIdDeletePost({
        client: apiClient,
        path: { playlist_id: playlistId },
        body: {
          video_ids: videoIds,
          include_private_videos: includePrivateVideos,
          include_delete_videos: includeDeleteVideos,
          playlist_id: playlistId,
        },
      });

    if (result.response.status === 204) {
      return {
        data: undefined,
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
      error:
        error as DeletePlaylistVideosV1YoutubePlaylistsPlaylistIdDeletePostError,
      success: false,
    };
  }
}
