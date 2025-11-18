import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getErrorMessage,
  getErrorCode,
  handleApiError,
  handleServiceError,
  createAppError,
} from '../error-handler';
import { toast } from 'sonner';

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('Error Handler Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getErrorMessage', () => {
    it('should return message from Error instance', () => {
      const error = new Error('Test error message');
      expect(getErrorMessage(error)).toBe('Test error message');
    });

    it('should return string error directly', () => {
      expect(getErrorMessage('String error')).toBe('String error');
    });

    it('should return message from error object', () => {
      const error = { message: 'Object error message' };
      expect(getErrorMessage(error)).toBe('Object error message');
    });

    it('should return default message for unknown error types', () => {
      expect(getErrorMessage(null)).toBe('An unexpected error occurred');
      expect(getErrorMessage(undefined)).toBe('An unexpected error occurred');
      expect(getErrorMessage({})).toBe('An unexpected error occurred');
      expect(getErrorMessage(123)).toBe('An unexpected error occurred');
    });
  });

  describe('getErrorCode', () => {
    it('should return code from error object', () => {
      const error = { code: 'ERROR_123' };
      expect(getErrorCode(error)).toBe('ERROR_123');
    });

    it('should return status as code', () => {
      const error = { status: 404 };
      expect(getErrorCode(error)).toBe('404');
    });

    it('should return undefined for errors without code or status', () => {
      expect(getErrorCode(null)).toBeUndefined();
      expect(getErrorCode({})).toBeUndefined();
      expect(getErrorCode('string')).toBeUndefined();
    });
  });

  describe('handleApiError', () => {
    it('should show toast error with message', () => {
      const error = new Error('API error occurred');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      handleApiError(error, 'Failed to fetch data');

      expect(toast.error).toHaveBeenCalledWith('Failed to fetch data', {
        description: 'API error occurred',
      });
      expect(consoleSpy).toHaveBeenCalledWith('API Error:', {
        message: 'API error occurred',
        code: undefined,
        error,
      });

      consoleSpy.mockRestore();
    });

    it('should use default message when not provided', () => {
      const error = new Error('Test error');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      handleApiError(error);

      expect(toast.error).toHaveBeenCalledWith('An error occurred', {
        description: 'Test error',
      });

      consoleSpy.mockRestore();
    });

    it('should handle error with code', () => {
      const error = { message: 'Error', code: 'ERR_001' };
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      handleApiError(error, 'Operation failed');

      expect(toast.error).toHaveBeenCalledWith('Operation failed', {
        description: 'Error',
      });
      expect(consoleSpy).toHaveBeenCalledWith('API Error:', {
        message: 'Error',
        code: 'ERR_001',
        error,
      });

      consoleSpy.mockRestore();
    });
  });

  describe('handleServiceError', () => {
    it('should call handleApiError when result has error', () => {
      const error = new Error('Service error');
      const result = { success: false, error };
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const handled = handleServiceError(result, 'Service failed');

      expect(handled).toBe(true);
      expect(toast.error).toHaveBeenCalledWith('Service failed', {
        description: 'Service error',
      });

      consoleSpy.mockRestore();
    });

    it('should return false when result is successful', () => {
      const result = { success: true };
      const handled = handleServiceError(result, 'Service failed');

      expect(handled).toBe(false);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should return false when result has no error', () => {
      const result = { success: false };
      const handled = handleServiceError(result, 'Service failed');

      expect(handled).toBe(false);
      expect(toast.error).not.toHaveBeenCalled();
    });
  });

  describe('createAppError', () => {
    it('should create error object with all fields', () => {
      const error = createAppError(
        'Error message',
        'ERR_CODE',
        500,
        { detail: 'Additional info' }
      );

      expect(error).toEqual({
        message: 'Error message',
        code: 'ERR_CODE',
        statusCode: 500,
        details: { detail: 'Additional info' },
      });
    });

    it('should create error object with minimal fields', () => {
      const error = createAppError('Error message');

      expect(error).toEqual({
        message: 'Error message',
        code: undefined,
        statusCode: undefined,
        details: undefined,
      });
    });
  });
});

