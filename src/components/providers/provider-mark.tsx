import type { ProviderType } from '@/api';
import { PROVIDER_BRANDS } from '@/constants/providers';
import { cn } from '@/lib/utils';

interface ProviderMarkProps {
  provider: ProviderType;
  className?: string;
}

/** Small brand-colored tile identifying a provider (no third-party logos). */
export function ProviderMark({ provider, className }: ProviderMarkProps) {
  const brand = PROVIDER_BRANDS[provider];
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex size-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white',
        className
      )}
      style={{ backgroundColor: brand.color }}
    >
      {brand.initials}
    </span>
  );
}
