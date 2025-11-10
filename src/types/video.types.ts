/**
 * Tipos internos del frontend derivados de esquemas Zod
 * 
 * Estos tipos son estables y no cambian cuando se regenera la API.
 * El frontend usa estos tipos en lugar de los tipos autogenerados.
 */

import {
  YoutubePlaylistListResponseSchema,
  PlaylistVideoResponseSchema,
  PlaylistItemVideoOutputSchema,
  PlaylistItemSnippetOutputSchema,
} from '@/schemas/video.schema';
import { z } from 'zod';

// Tipos internos inferidos de los esquemas Zod
export type InternalYoutubePlaylistListResponse = z.infer<
  typeof YoutubePlaylistListResponseSchema
>;

export type InternalPlaylistVideoResponse = z.infer<
  typeof PlaylistVideoResponseSchema
>;

export type InternalPlaylistItemVideoOutput = z.infer<
  typeof PlaylistItemVideoOutputSchema
>;

export type InternalPlaylistItemSnippetOutput = z.infer<
  typeof PlaylistItemSnippetOutputSchema
>;

