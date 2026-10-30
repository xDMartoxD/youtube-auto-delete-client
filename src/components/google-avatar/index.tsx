import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks';

function initials(name: string | null | undefined) {
  return (name ?? '?')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function AvatarComponent() {
  const { user } = useAuth();
  return (
    <Avatar className="size-8">
      <AvatarImage src={user?.picture || ''} alt={user?.name || 'User'} />
      <AvatarFallback>{initials(user?.name)}</AvatarFallback>
    </Avatar>
  );
}
