import type { ProviderType } from '@/api';
import { PROVIDER_ICONS } from '@/constants/providers';
import { cn } from '@/lib/utils';

interface ProviderMarkProps {
  provider: ProviderType;
  className?: string;
}

/** The provider's official logo, in its brand color. */
export function ProviderMark({ provider, className }: ProviderMarkProps) {
  const icon = PROVIDER_ICONS[provider];
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      aria-hidden
      className={cn('size-5 shrink-0', className)}
      fill={`#${icon.hex}`}
    >
      <path d={icon.path} />
    </svg>
  );
}
