import { useEffect, useMemo, useState } from 'react';
import { Loader2, RefreshCw, Search, Trash2, X } from 'lucide-react';
import type { PlaylistResponse } from '@/api';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { PlaylistCover } from '@/components/playlists/playlist-cover';
import { PlaylistList } from '@/components/playlists/playlist-list';
import { EmptyState } from '@/components/workspace/empty-state';
import {
  usePlaylistOperations,
  usePlaylistTracks,
  useTrackSelection,
  type TrackFilter,
} from '@/hooks';
import { cn } from '@/lib/utils';
import { formatTotalDuration, pluralize } from '@/utils';
import { RemoveTracksDialog } from './remove-tracks-dialog';
import { TrackRow } from './track-row';

const FILTER_LABELS: Record<TrackFilter, string> = {
  all: 'All',
  unavailable: 'Unavailable',
  duplicates: 'Duplicates',
};

interface CleanupViewProps {
  playlists: PlaylistResponse[];
}

/** Select many tracks of one playlist and remove them at once. */
export function CleanupView({ playlists }: CleanupViewProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Fall back to the first playlist when none (or a stale one) is selected
  const playlist = playlists.find((p) => p.id === activeId) ?? playlists[0];

  if (!playlist) {
    return (
      <EmptyState
        title="No playlists here yet"
        description="Create a playlist in this service and refresh."
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
      <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
        <h2 className="text-muted-foreground mb-2 px-2 text-xs font-semibold tracking-wider uppercase">
          Your playlists
        </h2>
        <PlaylistList
          playlists={playlists}
          activeId={playlist.id}
          onSelect={setActiveId}
        />
      </aside>
      {/* Keyed so filters and selection start fresh for every playlist */}
      <PlaylistCleanupPanel key={playlist.id} playlist={playlist} />
    </div>
  );
}

function PlaylistCleanupPanel({ playlist }: { playlist: PlaylistResponse }) {
  const [confirming, setConfirming] = useState(false);
  const { tracks, duplicateItemIds, isLoading, loadTracks } = usePlaylistTracks(
    playlist.id
  );
  const { removeTracks, isMutating } = usePlaylistOperations();
  const selection = useTrackSelection(tracks, duplicateItemIds);

  useEffect(() => {
    loadTracks(playlist.id);
  }, [playlist.id, loadTracks]);

  const totalDuration = useMemo(
    () => (tracks ?? []).reduce((sum, t) => sum + (t.duration_ms ?? 0), 0),
    [tracks]
  );

  const handleRemove = async () => {
    const removed = await removeTracks(playlist.id, [...selection.selected]);
    if (removed) {
      selection.clearSelection();
      setConfirming(false);
    }
  };

  return (
    <>
      <section className="min-w-0 space-y-4 pb-24">
        <header className="flex items-center gap-4">
          <PlaylistCover
            name={playlist.name}
            imageUrl={playlist.image_url}
            className="size-20 rounded-lg"
          />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-2xl font-bold tracking-tight">
              {playlist.name}
            </h2>
            <p className="text-muted-foreground text-sm">
              {pluralize(tracks?.length ?? playlist.track_count ?? 0, 'track')}
              {totalDuration > 0 && ` · ${formatTotalDuration(totalDuration)}`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Reload tracks"
            onClick={() => loadTracks(playlist.id, true)}
            disabled={isLoading}
          >
            <RefreshCw className={cn(isLoading && 'animate-spin')} />
          </Button>
        </header>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-48 flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={selection.filters.query}
              onChange={(e) =>
                selection.updateFilters({ query: e.target.value })
              }
              placeholder="Search title, artist or album"
              className="pl-9"
            />
          </div>
          <div
            className="bg-muted flex rounded-lg p-1"
            role="radiogroup"
            aria-label="Filter"
          >
            {(Object.keys(FILTER_LABELS) as TrackFilter[]).map((filter) => (
              <button
                key={filter}
                type="button"
                role="radio"
                aria-checked={selection.filters.filter === filter}
                onClick={() => selection.updateFilters({ filter })}
                className={cn(
                  'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                  selection.filters.filter === filter
                    ? 'bg-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {FILTER_LABELS[filter]}
                <span className="text-muted-foreground ml-1.5 text-xs tabular-nums">
                  {selection.counts[filter]}
                </span>
              </button>
            ))}
          </div>
          <label className="text-muted-foreground flex items-center gap-2 text-sm">
            Added before
            <Input
              type="date"
              value={selection.filters.addedBefore}
              onChange={(e) =>
                selection.updateFilters({ addedBefore: e.target.value })
              }
              className="w-auto"
            />
          </label>
        </div>

        {isLoading && !tracks ? (
          <div className="flex justify-center py-16">
            <Loader2 className="text-muted-foreground size-6 animate-spin" />
          </div>
        ) : selection.visible.length === 0 ? (
          <EmptyState
            title="Nothing matches"
            description="Try another filter or search term."
          />
        ) : (
          <div className="bg-card rounded-xl border">
            <label className="text-muted-foreground flex items-center gap-3 border-b px-3 py-2.5 text-xs font-medium">
              <Checkbox
                checked={selection.allVisibleSelected}
                onCheckedChange={selection.toggleAllVisible}
                aria-label="Select all visible tracks"
              />
              Select all {pluralize(selection.visible.length, 'shown track')}
            </label>
            <ul className="p-1">
              {selection.visible.map((track) => (
                <TrackRow
                  key={track.item_id}
                  track={track}
                  isSelected={selection.selected.has(track.item_id)}
                  isDuplicate={selection.duplicates.has(track.item_id)}
                  onToggle={selection.toggle}
                />
              ))}
            </ul>
          </div>
        )}
      </section>

      {selection.selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
          <div className="bg-foreground text-background flex items-center gap-3 rounded-full py-2 pr-2 pl-5 shadow-xl">
            <span className="text-sm font-medium">
              {pluralize(selection.selected.size, 'track')} selected
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={selection.clearSelection}
              className="hover:bg-background/10 hover:text-background rounded-full"
            >
              <X /> Clear
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setConfirming(true)}
              className="rounded-full"
            >
              <Trash2 /> Remove
            </Button>
          </div>
        </div>
      )}

      <RemoveTracksDialog
        open={confirming}
        count={selection.selected.size}
        playlistName={playlist.name}
        isRemoving={isMutating}
        onOpenChange={setConfirming}
        onConfirm={handleRemove}
      />
    </>
  );
}
