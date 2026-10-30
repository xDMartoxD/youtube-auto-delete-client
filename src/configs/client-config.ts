// Custom client configuration - this file is NOT auto-generated
import { createClient, createConfig } from '../api/client';
import type { ClientOptions } from '../api/types.gen';

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl;
  }
  // Defaults: production API for production builds, local backend otherwise
  return import.meta.env.PROD
    ? 'https://api.youtube-auto-delete.com'
    : 'http://localhost:8080';
};

export const apiClient = createClient(
  createConfig<ClientOptions>({
    baseUrl: getApiBaseUrl(),
    credentials: 'include',
  })
);
