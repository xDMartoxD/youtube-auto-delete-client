/**
 * Hook para manejar la playlist seleccionada
 * Encapsula el selector y la acción para establecer la playlist seleccionada
 */
import {
  useSelectedPlaylistId,
  useYoutubeActions,
} from '@/stores/youtube';

export function useSelectedPlaylist() {
  const selectedPlaylistId = useSelectedPlaylistId();
  const { setSelectedPlaylistId } = useYoutubeActions();

  return {
    selectedPlaylistId,
    setSelectedPlaylistId,
  };
}

