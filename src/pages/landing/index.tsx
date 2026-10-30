import { AppHeader } from '@/components/layout/app-header';
import { SignInHero } from '@/components/layout/sign-in-hero';
import { Workspace } from '@/components/workspace/workspace';
import { useAuth } from '@/hooks';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-background min-h-screen">
      <AppHeader />
      <main className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {isAuthenticated ? <Workspace /> : <SignInHero />}
      </main>
    </div>
  );
}
