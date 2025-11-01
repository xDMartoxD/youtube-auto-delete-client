import { REDIRECT_URI } from '@/constants';
import type { CodeResponse } from '@react-oauth/google';
import { create } from 'zustand';
import {
  codeLoginApiAuthExchangePost,
  getUserProfileApiAuthMeGet,
} from '@/api';
import { apiClient } from '@/configs/client-config';

interface AuthState {
  isAuthenticated: boolean;
  session: string;
  authenticate: (codeResponse: CodeResponse) => Promise<void>;
  me: () => Promise<void>;
  logout: () => void;
}

const useAuth = create<AuthState>((set) => ({
  isAuthenticated: false,
  session: '',
  authenticate: async (codeResponse) => {
    const { code } = codeResponse;
    console.log(code);
    if (!code) return;
    const { data, error, response } = await codeLoginApiAuthExchangePost({
      client: apiClient,
      body: {
        code,
        redirect_uri: REDIRECT_URI,
      },
    });
    console.log(response);
    if (response.status === 200 && data) {
      set((state) => ({
        ...state,
        isAuthenticated: true,
      }));
    }
    if (error) {
      console.error('Authentication error:', error);
    }
  },
  logout: () => set(() => ({ isAuthenticated: false, session: '' })),
  me: async () => {
    const { data, error, response } = await getUserProfileApiAuthMeGet({
      client: apiClient,
    });
    if (response.status === 200 && data) {
      set((state) => ({
        ...state,
        isAuthenticated: true,
      }));
    }
    if (error) {
      console.error('Get user profile error:', error);
    }
  },
}));

export default useAuth;
