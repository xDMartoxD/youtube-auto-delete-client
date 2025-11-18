import { Button } from '@/components/ui/button';
import { Trash2, X, Loader2 } from 'lucide-react';
import { useVideoSelection } from '@/hooks';
import { cn } from '@/lib/utils';

interface VideoSelectionBarProps {
  onDelete?: () => void | Promise<void>;
  isDeleting?: boolean;
}

/**
 * Floating action bar for selected videos
 * Appears when there are selected videos
 */
export function VideoSelectionBar({
  onDelete,
  isDeleting = false,
}: VideoSelectionBarProps) {
  const {
    selectedVideosCount,
    hasSelectedVideos,
    clearSelectedVideos,
    shouldRemovePrivateVideos,
    shouldRemoveDeletedVideos,
  } = useVideoSelection();

  const handleDeselectAll = () => {
    clearSelectedVideos();
  };

  // Show bar if there are selected videos OR if auto-remove flags are enabled
  const shouldShow =
    hasSelectedVideos || shouldRemovePrivateVideos || shouldRemoveDeletedVideos;

  if (!shouldShow) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50',
        'bg-card/70 border border-border/50 rounded-lg shadow-2xl',
        'px-3 sm:px-6 py-3 sm:py-4 w-[calc(100%-2rem)] sm:min-w-[300px] max-w-md',
        'animate-in slide-in-from-bottom-4 duration-300',
        'backdrop-blur-md'
      )}
    >
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="text-xs sm:text-sm font-medium truncate">
            {selectedVideosCount}{' '}
            {selectedVideosCount === 1 ? 'video' : 'videos'} selected
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeselectAll}
            className="h-7 sm:h-8 gap-1 px-2 sm:px-3"
            title="Deselect all videos"
          >
            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Clear</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            disabled={isDeleting || !shouldShow}
            className="h-7 sm:h-8 px-2 sm:px-3"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 animate-spin" />
                <span className="hidden sm:inline">Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                <span className="hidden sm:inline">Delete</span>
                <span className="sm:hidden">({selectedVideosCount})</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
