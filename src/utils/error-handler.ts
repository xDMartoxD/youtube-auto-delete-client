/**
 * Centralized error handling utilities
 * Provides consistent error handling across the application
 */

import { toast } from 'sonner';

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: unknown;
}

/**
 * Extracts a user-friendly error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  // API errors: { detail, user_message }; validation errors: { detail: [{ msg }] }
  if (error && typeof error === 'object') {
    if ('user_message' in error && error.user_message) {
      return String(error.user_message);
    }
    if ('detail' in error) {
      const { detail } = error;
      if (typeof detail === 'string') return detail;
      if (Array.isArray(detail) && detail[0]?.msg) return String(detail[0].msg);
    }
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'An unexpected error occurred';
}

/**
 * Extracts error code from error object
 */
export function getErrorCode(error: unknown): string | undefined {
  if (error && typeof error === 'object') {
    if ('code' in error) {
      return String(error.code);
    }
    if ('status' in error) {
      return String(error.status);
    }
  }
  return undefined;
}

/**
 * Handles API errors and shows appropriate toast notifications
 */
export function handleApiError(
  error: unknown,
  defaultMessage = 'An error occurred'
): void {
  const message = getErrorMessage(error);
  const code = getErrorCode(error);

  console.error('API Error:', { message, code, error });

  // Show user-friendly error message
  toast.error(defaultMessage, {
    description: message,
  });
}

/**
 * Handles service result errors
 */
export function handleServiceError(
  result: { success: boolean; error?: unknown },
  defaultMessage = 'Operation failed'
): boolean {
  if (!result.success && result.error) {
    handleApiError(result.error, defaultMessage);
    return true;
  }
  return false;
}

/**
 * Creates a standardized error object
 */
export function createAppError(
  message: string,
  code?: string,
  statusCode?: number,
  details?: unknown
): AppError {
  return {
    message,
    code,
    statusCode,
    details,
  };
}
