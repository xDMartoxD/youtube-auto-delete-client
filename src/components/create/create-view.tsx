import { useState, type FormEvent } from 'react';
import {
  Combine,
  Layers,
  Loader2,
  Sparkles,
  SplitSquareHorizontal,
} from 'lucide-react';
import type { CompositionMode, PlaylistResponse } from '@/api';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlaylistPicker } from '@/components/playlists/playlist-picker';
import { OptionCard } from '@/components/workspace/option-card';
import { Step } from '@/components/workspace/step';
import { usePlaylistOperations } from '@/hooks';

const MODES: {
  mode: CompositionMode;
  title: string;
  description: string;
  icon: typeof Combine;
}[] = [
  {
    mode: 'union',
    title: 'Everything',
    description: 'All songs from every selected playlist.',
    icon: Combine,
  },
  {
    mode: 'intersection',
    title: 'In common',
    description: 'Only songs that appear in all of them.',
    icon: Layers,
  },
  {
    mode: 'difference',
    title: 'Only in the first',
    description: 'Songs of the first pick missing from the others.',
    icon: SplitSquareHorizontal,
  },
];

interface CreateViewProps {
  playlists: PlaylistResponse[];
}

/** Build a new playlist from a set operation over existing ones. */
export function CreateView({ playlists }: CreateViewProps) {
  const { createFromPlaylists, isMutating } = usePlaylistOperations();
  const [sources, setSources] = useState<string[]>([]);
  const [mode, setMode] = useState<CompositionMode>('union');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [removeDuplicates, setRemoveDuplicates] = useState(true);

  const minSources = mode === 'union' ? 1 : 2;
  const canSubmit = sources.length >= minSources && name.trim().length > 0;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const created = await createFromPlaylists({
      name: name.trim(),
      description: description.trim(),
      source_playlist_ids: sources,
      mode,
      remove_duplicates: removeDuplicates,
    });
    if (created) {
      setSources([]);
      setName('');
      setDescription('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-8">
      <Step number={1} title="How should they be combined?">
        <div className="grid gap-2 sm:grid-cols-3" role="radiogroup">
          {MODES.map(({ mode: value, title, description, icon: Icon }) => (
            <OptionCard
              key={value}
              selected={mode === value}
              onSelect={() => setMode(value)}
              icon={<Icon className="size-4" />}
              title={title}
              description={description}
            />
          ))}
        </div>
      </Step>

      <Step
        number={2}
        title="Pick the source playlists"
        description={
          mode === 'difference'
            ? 'Order matters: the first pick is the base, the rest are subtracted.'
            : mode === 'intersection'
              ? 'Pick at least two playlists.'
              : undefined
        }
      >
        <PlaylistPicker
          playlists={playlists}
          selected={sources}
          onChange={setSources}
          showOrder={mode === 'difference'}
        />
      </Step>

      <Step number={3} title="Name your playlist">
        <div className="space-y-3">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Best of both"
            maxLength={150}
            aria-label="Playlist name"
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            maxLength={1000}
            rows={2}
            aria-label="Playlist description"
          />
          {mode === 'union' && (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={removeDuplicates}
                onCheckedChange={(checked) =>
                  setRemoveDuplicates(checked === true)
                }
              />
              Skip repeated songs
            </label>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={!canSubmit || isMutating}>
            {isMutating ? <Loader2 className="animate-spin" /> : <Sparkles />}
            Create playlist
          </Button>
        </div>
      </Step>
    </form>
  );
}
