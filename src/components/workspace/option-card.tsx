import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface OptionCardProps {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description: string;
  icon?: ReactNode;
}

/** Large radio-style choice used in forms. */
export function OptionCard({
  selected,
  onSelect,
  title,
  description,
  icon,
}: OptionCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors',
        'focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px]',
        selected ? 'border-primary bg-primary/10' : 'bg-card hover:bg-accent'
      )}
    >
      {icon && <span className="text-primary mt-0.5 shrink-0">{icon}</span>}
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="text-muted-foreground block text-xs">
          {description}
        </span>
      </span>
    </button>
  );
}
