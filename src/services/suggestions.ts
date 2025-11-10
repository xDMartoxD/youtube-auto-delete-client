import { apiClient } from '@/configs/client-config';
import {
  createSuggestionApiSuggestionsPost,
  type CreateSuggestionApiSuggestionsPostError,
  type SuggestionResponse,
} from '@/api';

export interface ServiceResult<T> {
  data?: T;
  error?: CreateSuggestionApiSuggestionsPostError;
  success: boolean;
}

/**
 * Envía una sugerencia al servidor
 * @param title - Título de la sugerencia
 * @param message - Descripción/mensaje de la sugerencia
 * @returns Resultado de la operación con los datos de la sugerencia creada
 */
export async function postSuggestion(
  title: string,
  message: string
): Promise<ServiceResult<SuggestionResponse>> {
  try {
    const result = await createSuggestionApiSuggestionsPost({
      client: apiClient,
      body: {
        title: title.trim(),
        description: message.trim(),
      },
    });

    if (result.response.status === 201 && result.data) {
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
      error: error as CreateSuggestionApiSuggestionsPostError,
      success: false,
    };
  }
}
