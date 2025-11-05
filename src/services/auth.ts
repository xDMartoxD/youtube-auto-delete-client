/**
 * Auth API Service
 * 
 * Esta capa encapsula todas las llamadas a la API de autenticación.
 * El store solo debe usar estos servicios, no llamar directamente a la API.
 */

import { apiClient } from '@/configs/client-config';
import { REDIRECT_URI } from '@/constants';
import {
  codeLoginApiAuthExchangePost,
  getUserProfileApiAuthMeGet,
  logoutApiAuthLogoutPost,
  type AuthSuccessResponse,
  type CodeLoginApiAuthExchangePostError,
} from '@/api';
import type { CodeResponse } from '@react-oauth/google';

export interface ServiceResult<T> {
  data?: T;
  error?: CodeLoginApiAuthExchangePostError | Error;
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
    const result = await codeLoginApiAuthExchangePost({
      client: apiClient,
      body: {
        code,
        redirect_uri: REDIRECT_URI,
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
      error: error as CodeLoginApiAuthExchangePostError,
      success: false,
    };
  }
}

/**
 * Obtiene el perfil del usuario autenticado
 */
export async function getUserProfile(): Promise<ServiceResult<AuthSuccessResponse>> {
  try {
    const result = await getUserProfileApiAuthMeGet({
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
    const result = await logoutApiAuthLogoutPost({
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

