export const SCOPES = ['https://www.googleapis.com/auth/youtube'];

/**
 * Obtiene el redirect URI dinámicamente desde el navegador o variables de entorno
 * Prioridad: window.location.origin > VITE_REDIRECT_URI > fallback localhost
 */
export const getRedirectUri = (): string => {
  // Primero intentar obtener el origin del navegador (más dinámico)
  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin;
  }

  // Si no está disponible (SSR o build time), usar variable de entorno
  const envRedirectUri = import.meta.env.VITE_REDIRECT_URI;
  if (envRedirectUri) {
    return envRedirectUri;
  }

  // Fallback para desarrollo local
  return 'http://localhost:5173';
};

// Exportar como función para evaluación en runtime
// Esto asegura que siempre obtenga el origin actual del navegador
export const REDIRECT_URI = getRedirectUri();
export const CLIENT_ID =
  '1045602413659-ns6cq27oi7ro1vj9pd9m8biq7q59j259.apps.googleusercontent.com';
export const PRIVATE_VIDEO_TITLE = 'Private video';
export const PRIVATE_VIDEO_DESCRIPTION = 'This video is private.';
export const DELETED_VIDEO_TITLE = 'Deleted video';
export const DELETED_VIDEO_DESCRIPTION = 'This video is unavailable.';
