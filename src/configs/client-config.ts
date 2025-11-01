// Custom client configuration - this file is NOT auto-generated
import { createClient, createConfig } from '../api/client';
import type { ClientOptions } from '../api/types.gen';

export const apiClient = createClient(
  createConfig<ClientOptions>({
    baseUrl: 'http://localhost:8080',
    credentials: 'include',
  })
);
