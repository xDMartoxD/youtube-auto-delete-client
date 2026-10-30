import { useState, type FormEvent } from 'react';
import { FolderInput, ListPlus, Loader2, Merge } from 'lucide-react';
import type { PlaylistResponse } from '@/api';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { PlaylistPicker } from '@/components/playlists/playlist-picker';
import { OptionCard } from '@/components/workspace/option-card';
import { Step } from '@/components/workspace/step';
import { usePlaylistOperations } from '@/hooks';
import { pluralize } from '@/utils';

type Destination = 'existing' | 'new';

interface MergeViewProps {
  playlists: PlaylistResponse[];
}

/** Copy the tracks of several playlists into one. */
export function MergeView({ playlists }: MergeViewProps) {
  const { mergePlaylists, isMutating } = usePlaylistOperations();
  const [sources, setSources] = useState<string[]>([]);
  const [destination, setDestination] = useState<Destination>('new');
  const [targetId, setTargetId] = useState('');
  const [newName, setNewName] = useState('');
  const [removeDuplicates, setRemoveDuplicates] = useState(true);

  const target = destination === 'existing' ? targetId : '';
  const trackTotal = playlists
    .filter((p) => sources.includes(p.id))
    .reduce((sum, p) => sum + (p.track_count ?? 0), 0);
  const canSubmit =
    sources.length > 0 &&
    (destination === 'existing' ? !!targetId : newName.trim().length > 0);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const merged = await mergePlaylists({
      source_playlist_ids: sources,
      target_playlist_id: target || null,
      new_playlist_name: destination === 'new' ? newName.trim() : null,
      remove_duplicates: removeDuplicates,
    });
    if (merged) {
      setSources([]);
      setNewName('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-8">
      <Step
        number={1}
        title="Pick the playlists to merge"
        description="Their tracks are copied; the originals stay untouched."
      >
        <PlaylistPicker
          playlists={playlists}
          selected={sources}
          onChange={setSources}
          disabledIds={target ? [target] : []}
        />
      </Step>

      <Step number={2} title="Choose where they go">
        <div className="grid gap-2 sm:grid-cols-2" role="radiogroup">
          <OptionCard
            selected={destination === 'new'}
            onSelect={() => setDestination('new')}
            icon={<ListPlus className="size-4" />}
            title="A new playlist"
            description="Start fresh with everything combined."
          />
          <OptionCard
            selected={destination === 'existing'}
            onSelect={() => setDestination('existing')}
            icon={<FolderInput className="size-4" />}
            title="An existing playlist"
            description="Add the tracks to one you already have."
          />
        </div>
        <div className="mt-3">
          {destination === 'new' ? (
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name of the new playlist"
              maxLength={150}
              aria-label="New playlist name"
            />
          ) : (
            <select
              value={targetId}
              onChange={(e) => {
                setTargetId(e.target.value);
                setSources((s) => s.filter((id) => id !== e.target.value));
              }}
              aria-label="Destination playlist"
              className="border-input bg-background dark:bg-input/30 h-9 w-full rounded-md border px-3 text-sm"
            >
              <option value="">Select a playlist…</option>
              {playlists.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </Step>

      <Step number={3} title="Review">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={removeDuplicates}
            onCheckedChange={(checked) => setRemoveDuplicates(checked === true)}
          />
          Skip songs that are repeated or already in the destination
        </label>
        <div className="bg-muted/50 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
          <p className="text-muted-foreground text-sm">
            {sources.length === 0
              ? 'No playlists selected yet.'
              : `${pluralize(sources.length, 'playlist')} · up to ${pluralize(trackTotal, 'track')}`}
          </p>
          <Button type="submit" disabled={!canSubmit || isMutating}>
            {isMutating ? <Loader2 className="animate-spin" /> : <Merge />}
            Merge playlists
          </Button>
        </div>
      </Step>
    </form>
  );
}
