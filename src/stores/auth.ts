import { REDIRECT_URI } from '@/constants';
import type { CodeResponse } from '@react-oauth/google';
import { create } from 'zustand';
import {
  codeLoginApiAuthExchangePost,
  getUserProfileApiAuthMeGet,
  type AuthSuccessResponse,
  type UserInfo,
  type CodeLoginApiAuthExchangePostError,
} from '@/api';
import { apiClient } from '@/configs/client-config';

interface AuthState {
  // State
  isAuthenticated: boolean;
  user: UserInfo | null;
  session: string;
  // Loading states
  isAuthenticating: boolean;
  isLoadingProfile: boolean;
  // Error states
  authError: CodeLoginApiAuthExchangePostError | null;
  profileError: Error | null;
  // Actions
  authenticate: (codeResponse: CodeResponse) => Promise<void>;
  me: () => Promise<void>;
  logout: () => void;
}

const useAuth = create<AuthState>((set) => ({
  // Initial state
  isAuthenticated: false,
  user: null,
  session: '',
  isAuthenticating: false,
  isLoadingProfile: false,
  authError: null,
  profileError: null,

  authenticate: async (codeResponse) => {
    const { code } = codeResponse;

    if (!code) {
      console.warn('No authorization code provided');
      return;
    }

    set({ isAuthenticating: true, authError: null });

    try {
      const result = await codeLoginApiAuthExchangePost({
        client: apiClient,
        body: {
          code,
          redirect_uri: REDIRECT_URI,
        },
      });

      if (result.response.status === 200 && result.data) {
        const authData = result.data as AuthSuccessResponse;
        set({
          isAuthenticated: true,
          user: authData.user,
          session: authData.user.sub,
          authError: null,
          isAuthenticating: false,
        });
      } else if (result.error) {
        set({
          authError: result.error,
          isAuthenticating: false,
        });
        console.error('Authentication error:', result.error);
      } else {
        set({
          authError: null,
          isAuthenticating: false,
        });
      }
    } catch (error) {
      const typedError = error as CodeLoginApiAuthExchangePostError;
      set({
        authError: typedError,
        isAuthenticating: false,
      });
      console.error('Unexpected authentication error:', error);
    }
  },

  logout: () =>
    set({
      isAuthenticated: false,
      user: null,
      session: '',
      authError: null,
      profileError: null,
    }),

  me: async () => {
    set({ isLoadingProfile: true, profileError: null });

    try {
      const result = await getUserProfileApiAuthMeGet({
        client: apiClient,
      });

      if (result.response.status === 200 && result.data) {
        const userData = result.data as AuthSuccessResponse;
        set({
          isAuthenticated: true,
          user: userData.user,
          session: userData.user.sub,
          profileError: null,
          isLoadingProfile: false,
        });
      } else if (result.error) {
        set({
          profileError: new Error('Failed to get user profile'),
          isLoadingProfile: false,
        });
        console.error('Get user profile error:', result.error);
      } else {
        set({
          profileError: null,
          isLoadingProfile: false,
        });
      }
    } catch (error) {
      const typedError =
        error instanceof Error ? error : new Error('Unknown error');
      set({
        profileError: typedError,
        isLoadingProfile: false,
      });
      console.error('Unexpected error getting user profile:', error);
    }
  },
}));

export default useAuth;
