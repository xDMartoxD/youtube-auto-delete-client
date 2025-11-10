import {
  useAuthenticate,
  useLogout,
  useIsAuthenticated,
  useIsAuthenticating,
  useUser,
  useMe,
  useAuthError,
  useProfileError,
  useIsLoadingProfile,
} from '@/stores/auth';

/**
 * Custom hook that encapsulates all auth-related state and actions
 * Provides a single interface for authentication functionality
 * This prevents direct access to the auth store from components
 *
 * @returns {Object} Auth state and actions
 * @returns {boolean} isAuthenticated - Whether the user is authenticated
 * @returns {boolean} isAuthenticating - Whether authentication is in progress
 * @returns {boolean} isLoadingProfile - Whether user profile is being loaded
 * @returns {UserInfo | null} user - Current user information
 * @returns {Error | null} authError - Authentication error if any
 * @returns {Error | null} profileError - Profile loading error if any
 * @returns {Function} authenticate - Function to authenticate with Google OAuth code
 * @returns {Function} logout - Function to logout the user
 * @returns {Function} me - Function to fetch current user profile
 */
export function useAuth() {
  const isAuthenticated = useIsAuthenticated();
  const isAuthenticating = useIsAuthenticating();
  const isLoadingProfile = useIsLoadingProfile();
  const user = useUser();
  const authError = useAuthError();
  const profileError = useProfileError();
  const authenticate = useAuthenticate();
  const logout = useLogout();
  const me = useMe();

  return {
    isAuthenticated,
    isAuthenticating,
    isLoadingProfile,
    user,
    authError,
    profileError,
    authenticate,
    logout,
    me,
  };
}

