import {
  siAmazonmusic,
  siApplemusic,
  siSpotify,
  siYoutube,
  siYoutubemusic,
  type SimpleIcon,
} from 'simple-icons';
import type { ProviderType } from '@/api';

/** Official brand logo (path + color) from Simple Icons */
export const PROVIDER_ICONS: Record<ProviderType, SimpleIcon> = {
  youtube: siYoutube,
  youtube_music: siYoutubemusic,
  spotify: siSpotify,
  apple_music: siApplemusic,
  amazon_music: siAmazonmusic,
};

export const PROVIDER_NAMES: Record<ProviderType, string> = {
  youtube: 'YouTube',
  youtube_music: 'YouTube Music',
  spotify: 'Spotify',
  apple_music: 'Apple Music',
  amazon_music: 'Amazon Music',
};
