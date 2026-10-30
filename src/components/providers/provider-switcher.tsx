import { useProviders } from '@/hooks';
import { cn } from '@/lib/utils';
import { ProviderMark } from './provider-mark';

/** Horizontal, scrollable list of music services. */
export function ProviderSwitcher() {
  const { providers, activeProvider, setActiveProvider } = useProviders();

  return (
    <nav
      aria-label="Music service"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
    >
      {providers.map((provider) => {
        const isActive = provider.id === activeProvider?.id;
        return (
          <button
            key={provider.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => setActiveProvider(provider.id)}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-full border py-1.5 pr-3.5 pl-1.5 text-sm font-medium transition-colors',
              'focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px]',
              isActive
                ? 'border-foreground/20 bg-foreground text-background'
                : 'bg-card hover:bg-accent text-muted-foreground hover:text-foreground'
            )}
          >
            <ProviderMark provider={provider.id} className="rounded-full" />
            {provider.name}
            {provider.is_mock && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
                  isActive
                    ? 'bg-background/15 text-background'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                Demo
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
