import { Link } from 'react-router-dom';
import { ListMusic, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AvatarComponent } from '@/components/google-avatar';
import { FeedbackDialog } from '@/components/feedback-dialog';
import { useAuth } from '@/hooks';

export function AppHeader() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
            <ListMusic className="size-4" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            PlaylistMaster
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/privacy-policy">Privacy</Link>
          </Button>
          {isAuthenticated && (
            <>
              <FeedbackDialog />
              <div className="ml-1 flex items-center gap-1 border-l pl-2">
                <AvatarComponent />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  aria-label="Sign out"
                >
                  <LogOut />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
