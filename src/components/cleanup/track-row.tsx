import type { TrackResponse } from '@/api';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { PlaylistCover } from '@/components/playlists/playlist-cover';
import { cn } from '@/lib/utils';
import { formatDate, formatDuration } from '@/utils';

interface TrackRowProps {
  track: TrackResponse;
  isSelected: boolean;
  isDuplicate: boolean;
  onToggle: (itemId: string) => void;
}

export function TrackRow({
  track,
  isSelected,
  isDuplicate,
  onToggle,
}: TrackRowProps) {
  const subtitle = [track.artist, track.album].filter(Boolean).join(' · ');

  return (
    <li>
      <label
        className={cn(
          'grid cursor-pointer grid-cols-[auto_auto_1fr_auto] items-center gap-3 rounded-lg px-3 py-2 transition-colors sm:grid-cols-[auto_auto_1fr_8rem_3.5rem]',
          isSelected ? 'bg-primary/10' : 'hover:bg-accent/60'
        )}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggle(track.item_id)}
          aria-label={`Select ${track.title}`}
        />
        <PlaylistCover
          name={track.title}
          imageUrl={track.image_url}
          className={cn('size-10', !track.is_available && 'grayscale')}
        />
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span
              className={cn(
                'truncate text-sm font-medium',
                !track.is_available && 'text-muted-foreground line-through'
              )}
            >
              {track.title}
            </span>
            {!track.is_available && (
              <Badge variant="destructive">Unavailable</Badge>
            )}
            {isDuplicate && <Badge variant="secondary">Duplicate</Badge>}
          </span>
          {subtitle && (
            <span className="text-muted-foreground block truncate text-xs">
              {subtitle}
            </span>
          )}
        </span>
        <span className="text-muted-foreground hidden text-xs sm:block">
          {formatDate(track.added_at)}
        </span>
        <span className="text-muted-foreground text-right text-xs tabular-nums">
          {formatDuration(track.duration_ms)}
        </span>
      </label>
    </li>
  );
}
