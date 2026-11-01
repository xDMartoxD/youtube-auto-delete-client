import { CheckCircle2, FlaskConical, Loader2, Unlink } from 'lucide-react';
import type { ProviderInfo } from '@/api';
import { Button } from '@/components/ui/button';
import { useProviders } from '@/hooks';
import { ProviderMark } from './provider-mark';

interface ProviderStatusProps {
  provider: ProviderInfo;
}

/** Demo / connect / connected state of the active provider. */
export function ProviderStatus({ provider }: ProviderStatusProps) {
  const { connectProvider, disconnectProvider, isMutating } = useProviders();

  if (!provider.is_mock && provider.connectable) {
    return (
      <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
        <CheckCircle2 className="size-4 text-emerald-500" />
        Connected to {provider.name}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => disconnectProvider(provider.id)}
          disabled={isMutating}
        >
          {isMutating ? <Loader2 className="animate-spin" /> : <Unlink />}
          Disconnect
        </Button>
      </div>
    );
  }

  if (!provider.is_mock) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
      <FlaskConical className="size-4 shrink-0 text-amber-500" />
      <p className="min-w-0 flex-1">
        <span className="font-medium">{provider.name} is in demo mode.</span>{' '}
        <span className="text-muted-foreground">
          {provider.connectable
            ? `Connect your account to manage your real ${provider.name} playlists.`
            : `You’re working with sample playlists; changes are not sent to ${provider.name}.`}
        </span>
      </p>
      {provider.connectable && (
        <Button size="sm" onClick={() => connectProvider(provider.id)}>
          <ProviderMark provider={provider.id} className="size-4" />
          Connect {provider.name}
        </Button>
      )}
    </div>
  );
}
