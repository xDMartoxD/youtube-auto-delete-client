import type { CodeResponse } from '@react-oauth/google';
import { create } from 'zustand';
import { type UserInfo, type CodeLoginV1AuthExchangePostError } from '@/api';
import {
  exchangeCode as exchangeCodeService,
  getUserProfile as getUserProfileService,
  logout as logoutService,
} from '@/services/auth';
import { handleServiceError } from '@/utils';

interface AuthState {
  // State
  isAuthenticated: boolean;
  user: UserInfo | null;
  session: string;
  // Loading states
  isAuthenticating: boolean;
  isLoadingProfile: boolean;
  // Error states
  authError: CodeLoginV1AuthExchangePostError | null;
  profileError: Error | CodeLoginV1AuthExchangePostError | null;
  // Actions
  authenticate: (codeResponse: CodeResponse) => Promise<void>;
  me: () => Promise<void>;
  logout: () => Promise<void>;
}

const authStore = create<AuthState>((set) => ({
  // Initial state
  isAuthenticated: false,
  user: null,
  session: '',
  isAuthenticating: false,
  isLoadingProfile: false,
  authError: null,
  profileError: null,

  authenticate: async (codeResponse) => {
    set({ isAuthenticating: true, authError: null });

    const result = await exchangeCodeService(codeResponse);

    if (result.success && result.data) {
      const authData = result.data;
      set({
        isAuthenticated: true,
        user: authData.user,
        session: authData.user.sub,
        authError: null,
        isAuthenticating: false,
      });
    } else if (result.error) {
      set({
        authError: result.error as CodeLoginV1AuthExchangePostError,
        isAuthenticating: false,
      });
      handleServiceError(result, 'Failed to authenticate');
    } else {
      set({
        authError: null,
        isAuthenticating: false,
      });
    }
  },

  logout: async () => {
    // Llamar al servicio de logout (aunque no esperamos respuesta)
    await logoutService();

    // Actualizar estado local
    set({
      isAuthenticated: false,
      user: null,
      session: '',
      authError: null,
      profileError: null,
    });
  },

  me: async () => {
    set({ isLoadingProfile: true, profileError: null });

    const result = await getUserProfileService();

    if (result.success && result.data) {
      const userData = result.data;
      set({
        isAuthenticated: true,
        user: userData.user,
        session: userData.user.sub,
        profileError: null,
        isLoadingProfile: false,
      });
    } else if (result.error) {
      set({
        profileError: result.error,
        isLoadingProfile: false,
      });
      handleServiceError(result, 'Failed to load user profile');
    } else {
      set({
        profileError: null,
        isLoadingProfile: false,
      });
    }
  },
}));

// Selectors - atomic values only
export const useAuth = () => authStore();

// Auth state - atomic values
export const useIsAuthenticated = () =>
  authStore((state) => state.isAuthenticated);
export const useUser = () => authStore((state) => state.user);
export const useSession = () => authStore((state) => state.session);
export const useIsAuthenticating = () =>
  authStore((state) => state.isAuthenticating);
export const useIsLoadingProfile = () =>
  authStore((state) => state.isLoadingProfile);
export const useAuthError = () => authStore((state) => state.authError);
export const useProfileError = () => authStore((state) => state.profileError);

// Auth actions - atomic values
export const useAuthenticate = () => authStore((state) => state.authenticate);
export const useMe = () => authStore((state) => state.me);
export const useLogout = () => authStore((state) => state.logout);

export default useAuth;
