/**
 * Auth API Service
 *
 * Esta capa encapsula todas las llamadas a la API de autenticación.
 * El store solo debe usar estos servicios, no llamar directamente a la API.
 */

import { apiClient } from '@/configs/client-config';
import { getRedirectUri } from '@/constants';
import {
  codeLoginV1AuthExchangePost,
  getUserProfileV1AuthMeGet,
  logoutV1AuthLogoutPost,
  type AuthSuccessResponse,
  type CodeLoginV1AuthExchangePostError,
} from '@/api';
import type { CodeResponse } from '@react-oauth/google';

export interface ServiceResult<T> {
  data?: T;
  error?: CodeLoginV1AuthExchangePostError | Error;
  success: boolean;
}

/**
 * Intercambia el código de autorización de Google por un token de sesión
 */
export async function exchangeCode(
  codeResponse: CodeResponse
): Promise<ServiceResult<AuthSuccessResponse>> {
  const { code } = codeResponse;

  if (!code) {
    return {
      error: new Error('No authorization code provided'),
      success: false,
    };
  }

  try {
    const result = await codeLoginV1AuthExchangePost({
      client: apiClient,
      body: {
        code,
        redirect_uri: getRedirectUri(),
      },
    });

    if (result.response.status === 200 && result.data) {
      return {
        data: result.data as AuthSuccessResponse,
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
      error: error as CodeLoginV1AuthExchangePostError,
      success: false,
    };
  }
}

/**
 * Obtiene el perfil del usuario autenticado
 */
export async function getUserProfile(): Promise<
  ServiceResult<AuthSuccessResponse>
> {
  try {
    const result = await getUserProfileV1AuthMeGet({
      client: apiClient,
    });

    if (result.response.status === 200 && result.data) {
      return {
        data: result.data as AuthSuccessResponse,
        success: true,
      };
    }

    if (result.error) {
      return {
        error: new Error('Failed to get user profile'),
        success: false,
      };
    }

    return {
      success: false,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
      success: false,
    };
  }
}

/**
 * Cierra la sesión del usuario
 */
export async function logout(): Promise<ServiceResult<void>> {
  try {
    const result = await logoutV1AuthLogoutPost({
      client: apiClient,
    });

    if (result.response.status === 200) {
      return {
        data: undefined,
        success: true,
      };
    }

    if (result.error) {
      return {
        error: new Error('Failed to logout'),
        success: false,
      };
    }

    return {
      success: false,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
      success: false,
    };
  }
}
