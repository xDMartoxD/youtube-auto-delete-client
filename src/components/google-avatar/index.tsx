import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import useAuth from '@/stores/auth';

export function AvatarComponent() {
  const { user } = useAuth();
  return (
    <div className="flex flex-row flex-wrap items-center gap-12">
      <Avatar>
        <AvatarImage src={user?.picture || ''} alt={user?.name || 'User'} />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </div>
  );
}
