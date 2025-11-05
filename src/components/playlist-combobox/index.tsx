import { useEffect, useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  usePlaylists,
  useIsLoadingPlaylists,
  usePlaylistsError,
  useYoutubeActions,
} from '@/stores/youtube';
import { type PlaylistItem } from '@/api';

export function Combobox() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string>('');
  const playlists = usePlaylists();
  const isLoadingPlaylists = useIsLoadingPlaylists();
  const playlistsError = usePlaylistsError();
  const { getUserPlaylists, setSelectedPlaylistId } = useYoutubeActions();

  // Load playlists on mount
  useEffect(() => {
    if (!playlists && !isLoadingPlaylists) {
      void getUserPlaylists();
    }
  }, []); // Only run on mount

  // Get playlists items with proper typing
  const playlistsItems: PlaylistItem[] = useMemo(
    () => playlists?.items || [],
    [playlists?.items]
  );

  // Find selected playlist for display
  const selectedPlaylist = useMemo(
    () => playlistsItems.find((playlist) => playlist.id === value),
    [playlistsItems, value]
  );

  const handleSelect = (currentValue: string): void => {
    setValue(currentValue === value ? '' : currentValue);
    setOpen(false);
    setSelectedPlaylistId(currentValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
          disabled={isLoadingPlaylists}
        >
          {isLoadingPlaylists ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2">Loading...</span>
            </>
          ) : playlistsError ? (
            'Error loading playlists'
          ) : selectedPlaylist?.snippet?.title ? (
            selectedPlaylist.snippet.title
          ) : (
            'Select playlist...'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search playlist..." className="h-9" />
          <CommandList>
            {isLoadingPlaylists ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : playlistsError ? (
              <CommandEmpty>Error loading playlists</CommandEmpty>
            ) : playlistsItems.length === 0 ? (
              <CommandEmpty>No playlists found</CommandEmpty>
            ) : (
              <>
                <CommandEmpty>No playlist found.</CommandEmpty>
                <CommandGroup>
                  {playlistsItems.map((playlist) => {
                    const title =
                      playlist.snippet?.title ?? 'Untitled Playlist';
                    return (
                      <CommandItem
                        key={playlist.id}
                        value={`${playlist.id}-${title}`}
                        onSelect={() => handleSelect(playlist.id)}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            value === playlist.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {title}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
