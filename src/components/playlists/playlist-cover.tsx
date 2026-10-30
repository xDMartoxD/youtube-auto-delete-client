import { Music2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlaylistCoverProps {
  name: string;
  imageUrl?: string | null;
  className?: string;
}

// Stable gradient per name so covers without artwork are still recognisable
const GRADIENTS = [
  'from-rose-500 to-orange-400',
  'from-violet-500 to-fuchsia-400',
  'from-sky-500 to-cyan-400',
  'from-emerald-500 to-lime-400',
  'from-amber-500 to-yellow-300',
  'from-indigo-500 to-sky-400',
];

function gradientFor(name: string) {
  const hash = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return GRADIENTS[hash % GRADIENTS.length];
}

export function PlaylistCover({
  name,
  imageUrl,
  className,
}: PlaylistCoverProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        loading="lazy"
        className={cn('size-12 shrink-0 rounded-md object-cover', className)}
      />
    );
  }
  return (
    <div
      aria-hidden
      className={cn(
        'flex size-12 shrink-0 items-center justify-center rounded-md bg-gradient-to-br text-white',
        gradientFor(name),
        className
      )}
    >
      <Music2 className="size-1/2 opacity-90" />
    </div>
  );
}
