/**
 * Esquemas Zod para validar respuestas de la API
 * 
 * Estos esquemas validan los DTOs autogenerados de la API y crean
 * una capa de abstracción que desacopla el frontend de los cambios
 * en la estructura de la API.
 */

import { z } from 'zod';

// ============================================================================
// Esquemas Base
// ============================================================================

export const ThumbnailSchema = z.object({
  url: z.string(),
  width: z.number(),
  height: z.number(),
});

export const ThumbnailsSchema = z.object({
  default: ThumbnailSchema.nullable().optional(),
  medium: ThumbnailSchema.nullable().optional(),
  high: ThumbnailSchema.nullable().optional(),
  standard: ThumbnailSchema.nullable().optional(),
  maxres: ThumbnailSchema.nullable().optional(),
});

export const ResourceIdSchema = z.object({
  kind: z.string(),
  videoId: z.string(),
});

export const PageInfoSchema = z.object({
  totalResults: z.number(),
  resultsPerPage: z.number(),
});

export const ContentDetailsSchema = z.object({
  videoId: z.string(),
  videoPublishedAt: z.string().nullable().optional(),
});

// ============================================================================
// Esquemas de Playlist
// ============================================================================

export const PlaylistSnippetSchema = z.object({
  title: z.string(),
  description: z.string().nullable().optional(),
  publishedAt: z.string().nullable().optional(),
  channelId: z.string().nullable().optional(),
  channelTitle: z.string().nullable().optional(),
  thumbnails: z.record(z.unknown()).nullable().optional(),
});

export const PlaylistItemSchema = z.object({
  kind: z.string(),
  etag: z.string(),
  id: z.string(),
  snippet: PlaylistSnippetSchema.nullable().optional(),
});

export const YoutubePlaylistListResponseSchema = z.object({
  kind: z.string().optional(),
  etag: z.string(),
  nextPageToken: z.string().nullable().optional(),
  pageInfo: PageInfoSchema,
  items: z.array(PlaylistItemSchema),
});

// ============================================================================
// Esquemas de Video
// ============================================================================

export const PlaylistItemSnippetOutputSchema = z.object({
  publishedAt: z.string(),
  channelId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  thumbnails: ThumbnailsSchema.nullable().optional(),
  channelTitle: z.string(),
  playlistId: z.string(),
  position: z.number(),
  resourceId: ResourceIdSchema,
  videoOwnerChannelTitle: z.string().nullable().optional(),
  videoOwnerChannelId: z.string().nullable().optional(),
});

export const PlaylistItemVideoOutputSchema = z.object({
  kind: z.string().optional(),
  etag: z.string(),
  id: z.string(),
  snippet: PlaylistItemSnippetOutputSchema,
  contentDetails: ContentDetailsSchema,
});

export const PlaylistVideoResponseSchema = z.object({
  items: z.array(PlaylistItemVideoOutputSchema),
  total_results: z.number(),
  next_page_token: z.string().nullable().optional(),
  prev_page_token: z.string().nullable().optional(),
  page_info: PageInfoSchema,
});

