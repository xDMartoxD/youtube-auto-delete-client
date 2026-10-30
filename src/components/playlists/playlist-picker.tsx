import { Check } from 'lucide-react';
import type { PlaylistResponse } from '@/api';
import { cn } from '@/lib/utils';
import { pluralize } from '@/utils';
import { PlaylistCover } from './playlist-cover';

interface PlaylistPickerProps {
  playlists: PlaylistResponse[];
  /** Selected ids, in the order they were picked */
  selected: string[];
  onChange: (selected: string[]) => void;
  /** Ids that can't be picked (e.g. the merge destination) */
  disabledIds?: string[];
  /** Show the pick order (1, 2, ...) instead of a check mark */
  showOrder?: boolean;
}

/** Grid of playlist cards with multi-selection. */
export function PlaylistPicker({
  playlists,
  selected,
  onChange,
  disabledIds = [],
  showOrder = false,
}: PlaylistPickerProps) {
  const toggle = (id: string) =>
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id]
    );

  return (
    <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {playlists.map((playlist) => {
        const order = selected.indexOf(playlist.id);
        const isSelected = order !== -1;
        const isDisabled = disabledIds.includes(playlist.id);
        return (
          <li key={playlist.id}>
            <button
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              disabled={isDisabled}
              onClick={() => toggle(playlist.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition-colors',
                'focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px]',
                'disabled:cursor-not-allowed disabled:opacity-40',
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'bg-card hover:bg-accent'
              )}
            >
              <PlaylistCover
                name={playlist.name}
                imageUrl={playlist.image_url}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">
                  {playlist.name}
                </span>
                <span className="text-muted-foreground block text-xs">
                  {pluralize(playlist.track_count ?? 0, 'track')}
                </span>
              </span>
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                  isSelected &&
                    'border-primary bg-primary text-primary-foreground'
                )}
              >
                {isSelected &&
                  (showOrder ? order + 1 : <Check className="size-3.5" />)}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
