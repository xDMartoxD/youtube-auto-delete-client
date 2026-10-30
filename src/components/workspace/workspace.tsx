import { useEffect, useState } from 'react';
import {
  Eraser,
  FlaskConical,
  Loader2,
  Merge,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CleanupView } from '@/components/cleanup/cleanup-view';
import { CreateView } from '@/components/create/create-view';
import { MergeView } from '@/components/merge/merge-view';
import { ProviderSwitcher } from '@/components/providers/provider-switcher';
import { usePlaylists, useProviders } from '@/hooks';
import { cn } from '@/lib/utils';
import { EmptyState } from './empty-state';

type Tool = 'cleanup' | 'merge' | 'create';

const TOOLS: { id: Tool; label: string; icon: typeof Eraser }[] = [
  { id: 'cleanup', label: 'Clean up', icon: Eraser },
  { id: 'merge', label: 'Merge', icon: Merge },
  { id: 'create', label: 'Create', icon: Sparkles },
];

/** Signed-in area: pick a service, then a tool. */
export function Workspace() {
  const { activeProvider, loadProviders } = useProviders();
  const { playlists, isLoading, loadPlaylists } = usePlaylists();
  const [tool, setTool] = useState<Tool>('cleanup');

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  useEffect(() => {
    if (activeProvider) loadPlaylists();
  }, [activeProvider, loadPlaylists]);

  const renderTool = () => {
    if (!playlists) {
      return isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="text-muted-foreground size-6 animate-spin" />
        </div>
      ) : (
        <EmptyState
          title="Couldn’t load your playlists"
          description="Check your connection and try again."
          action={
            <Button variant="outline" onClick={() => loadPlaylists(true)}>
              <RefreshCw /> Try again
            </Button>
          }
        />
      );
    }
    if (tool === 'merge') return <MergeView playlists={playlists} />;
    if (tool === 'create') return <CreateView playlists={playlists} />;
    return <CleanupView playlists={playlists} />;
  };

  return (
    <div className="space-y-6">
      <ProviderSwitcher />

      {activeProvider?.is_mock && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
          <FlaskConical className="mt-0.5 size-4 shrink-0 text-amber-500" />
          <p>
            <span className="font-medium">
              {activeProvider.name} is in demo mode.
            </span>{' '}
            <span className="text-muted-foreground">
              You’re working with sample playlists; changes are not sent to{' '}
              {activeProvider.name}.
            </span>
          </p>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 border-b">
        <div className="flex gap-1" role="tablist" aria-label="Tools">
          {TOOLS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tool === id}
              onClick={() => setTool(id)}
              className={cn(
                '-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                tool === id
                  ? 'border-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground border-transparent'
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => loadPlaylists(true)}
          disabled={isLoading || !activeProvider}
        >
          <RefreshCw className={cn(isLoading && 'animate-spin')} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      <div role="tabpanel">{renderTool()}</div>
    </div>
  );
}
