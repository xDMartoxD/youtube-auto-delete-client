import type { PlaylistResponse } from '@/api';
import { cn } from '@/lib/utils';
import { pluralize } from '@/utils';
import { PlaylistCover } from './playlist-cover';

interface PlaylistListProps {
  playlists: PlaylistResponse[];
  activeId: string | null;
  onSelect: (playlistId: string) => void;
}

/** Single-selection list of playlists (library sidebar). */
export function PlaylistList({
  playlists,
  activeId,
  onSelect,
}: PlaylistListProps) {
  return (
    <ul className="space-y-1">
      {playlists.map((playlist) => (
        <li key={playlist.id}>
          <button
            type="button"
            aria-current={playlist.id === activeId}
            onClick={() => onSelect(playlist.id)}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors',
              'focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px]',
              playlist.id === activeId ? 'bg-accent' : 'hover:bg-accent/60'
            )}
          >
            <PlaylistCover
              name={playlist.name}
              imageUrl={playlist.image_url}
              className="size-10"
            />
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">
                {playlist.name}
              </span>
              <span className="text-muted-foreground block text-xs">
                {pluralize(playlist.track_count ?? 0, 'track')}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
