import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exchangeCode, getUserProfile, logout } from '../auth';
import {
  codeLoginApiAuthExchangePost,
  getUserProfileApiAuthMeGet,
  logoutApiAuthLogoutPost,
} from '@/api';
import { apiClient } from '@/configs/client-config';
import type { CodeResponse } from '@react-oauth/google';
import type { AuthSuccessResponse } from '@/api';

// Mock the API functions
vi.mock('@/api', () => ({
  codeLoginApiAuthExchangePost: vi.fn(),
  getUserProfileApiAuthMeGet: vi.fn(),
  logoutApiAuthLogoutPost: vi.fn(),
}));

// Mock the apiClient
vi.mock('@/configs/client-config', () => ({
  apiClient: {},
}));

// Mock constants
vi.mock('@/constants', () => ({
  REDIRECT_URI: 'http://localhost:5173',
}));

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('exchangeCode', () => {
    it('should return auth data on successful exchange', async () => {
      const mockAuthResponse: AuthSuccessResponse = {
        user: {
          sub: 'user-id',
          email: 'test@example.com',
          name: 'Test User',
          picture: 'https://example.com/picture.jpg',
        },
      };

      const codeResponse: CodeResponse = {
        code: 'auth-code-123',
      };

      vi.mocked(codeLoginApiAuthExchangePost).mockResolvedValue({
        response: { status: 200 } as Response,
        data: mockAuthResponse,
      });

      const result = await exchangeCode(codeResponse);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAuthResponse);
      expect(result.error).toBeUndefined();
      expect(codeLoginApiAuthExchangePost).toHaveBeenCalledWith({
        client: apiClient,
        body: {
          code: 'auth-code-123',
          redirect_uri: 'http://localhost:5173',
        },
      });
    });

    it('should return error when code is missing', async () => {
      const codeResponse: CodeResponse = {};

      const result = await exchangeCode(codeResponse);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.data).toBeUndefined();
      expect(codeLoginApiAuthExchangePost).not.toHaveBeenCalled();
    });

    it('should return error on API error', async () => {
      const codeResponse: CodeResponse = {
        code: 'invalid-code',
      };

      const mockError = {
        status: 400,
        body: { detail: 'Invalid code' },
      };

      vi.mocked(codeLoginApiAuthExchangePost).mockResolvedValue({
        response: { status: 400 } as Response,
        error: mockError,
      });

      const result = await exchangeCode(codeResponse);

      expect(result.success).toBe(false);
      expect(result.error).toEqual(mockError);
    });

    it('should return error on exception', async () => {
      const codeResponse: CodeResponse = {
        code: 'auth-code-123',
      };

      const mockError = new Error('Network error');

      vi.mocked(codeLoginApiAuthExchangePost).mockRejectedValue(mockError);

      const result = await exchangeCode(codeResponse);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile on successful request', async () => {
      const mockAuthResponse: AuthSuccessResponse = {
        user: {
          sub: 'user-id',
          email: 'test@example.com',
          name: 'Test User',
          picture: 'https://example.com/picture.jpg',
        },
      };

      vi.mocked(getUserProfileApiAuthMeGet).mockResolvedValue({
        response: { status: 200 } as Response,
        data: mockAuthResponse,
      });

      const result = await getUserProfile();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAuthResponse);
      expect(result.error).toBeUndefined();
      expect(getUserProfileApiAuthMeGet).toHaveBeenCalledWith({
        client: apiClient,
      });
    });

    it('should return error on API error', async () => {
      vi.mocked(getUserProfileApiAuthMeGet).mockResolvedValue({
        response: { status: 401 } as Response,
        error: new Error('Unauthorized'),
      });

      const result = await getUserProfile();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error on exception', async () => {
      const mockError = new Error('Network error');

      vi.mocked(getUserProfileApiAuthMeGet).mockRejectedValue(mockError);

      const result = await getUserProfile();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('logout', () => {
    it('should return success on successful logout', async () => {
      vi.mocked(logoutApiAuthLogoutPost).mockResolvedValue({
        response: { status: 200 } as Response,
      });

      const result = await logout();

      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
      expect(logoutApiAuthLogoutPost).toHaveBeenCalledWith({
        client: apiClient,
      });
    });

    it('should return error on API error', async () => {
      vi.mocked(logoutApiAuthLogoutPost).mockResolvedValue({
        response: { status: 500 } as Response,
        error: new Error('Server error'),
      });

      const result = await logout();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error on exception', async () => {
      const mockError = new Error('Network error');

      vi.mocked(logoutApiAuthLogoutPost).mockRejectedValue(mockError);

      const result = await logout();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});

