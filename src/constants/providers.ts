import type { ProviderType } from '@/api';

export interface ProviderBrand {
  /** Brand color used for accents and the provider mark */
  color: string;
  /** Short label for the provider mark */
  initials: string;
}

export const PROVIDER_BRANDS: Record<ProviderType, ProviderBrand> = {
  youtube: { color: '#ff0033', initials: 'YT' },
  youtube_music: { color: '#ff4e45', initials: 'YM' },
  spotify: { color: '#1db954', initials: 'S' },
  apple_music: { color: '#fa2d48', initials: 'AM' },
  amazon_music: { color: '#25d1da', initials: 'A' },
};

export const PROVIDER_NAMES: Record<ProviderType, string> = {
  youtube: 'YouTube',
  youtube_music: 'YouTube Music',
  spotify: 'Spotify',
  apple_music: 'Apple Music',
  amazon_music: 'Amazon Music',
};
