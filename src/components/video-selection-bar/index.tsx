import { Button } from '@/components/ui/button';
import { Trash2, X, CheckSquare, Square, Loader2 } from 'lucide-react';
import { useVideoSelection, usePlaylistVideos } from '@/hooks';
import { cn } from '@/lib/utils';

interface VideoSelectionBarProps {
  onDelete?: () => void | Promise<void>;
  isDeleting?: boolean;
}

/**
 * Barra de acciones flotante para videos seleccionados
 * Aparece cuando hay videos seleccionados
 */
export function VideoSelectionBar({
  onDelete,
  isDeleting = false,
}: VideoSelectionBarProps) {
  const {
    selectedVideosCount,
    hasSelectedVideos,
    clearSelectedVideos,
    selectAllVideos,
  } = useVideoSelection();
  const { videosItems } = usePlaylistVideos();

  const allVideosSelected =
    hasSelectedVideos &&
    videosItems.length > 0 &&
    selectedVideosCount === videosItems.length;

  const handleSelectAll = () => {
    selectAllVideos();
  };

  const handleDeselectAll = () => {
    clearSelectedVideos();
  };

  if (!hasSelectedVideos) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
        'bg-card border border-border rounded-lg shadow-2xl',
        'px-6 py-4 min-w-[300px]',
        'animate-in slide-in-from-bottom-4 duration-300',
        'backdrop-blur-sm bg-card/95'
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">
            {selectedVideosCount}{' '}
            {selectedVideosCount === 1 ? 'video' : 'videos'} seleccionado
            {selectedVideosCount !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {allVideosSelected ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeselectAll}
              className="h-8"
            >
              <Square className="h-4 w-4 mr-1.5" />
              Deseleccionar todo
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="h-8"
            >
              <CheckSquare className="h-4 w-4 mr-1.5" />
              Seleccionar todo
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelectedVideos}
            className="h-8"
          >
            <X className="h-4 w-4" />
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            disabled={isDeleting || !hasSelectedVideos}
            className="h-8"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-1.5" />
                Eliminar ({selectedVideosCount})
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

