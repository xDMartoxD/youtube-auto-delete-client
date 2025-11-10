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
  const { selectedVideosCount, hasSelectedVideos, clearSelectedVideos } =
    useVideoSelection();

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
        'backdrop-blur-sm bg-card/25'
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">
            {selectedVideosCount}{' '}
            {selectedVideosCount === 1 ? 'video' : 'videos'} selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeselectAll}
            className="h-8 gap-1.5"
            title="Deselect all videos"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Clear</span>
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
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-1.5" />
                Delete ({selectedVideosCount})
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
