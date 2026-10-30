import { useGoogleLogin } from '@react-oauth/google';
import { Eraser, Loader2, LogIn, Merge, Sparkles } from 'lucide-react';
import type { ProviderType } from '@/api';
import { Button } from '@/components/ui/button';
import { ProviderMark } from '@/components/providers/provider-mark';
import { SCOPES } from '@/constants';
import { PROVIDER_NAMES } from '@/constants/providers';
import { useAuth } from '@/hooks';
import { handleApiError } from '@/utils';

const FEATURES = [
  {
    icon: Eraser,
    title: 'Clean up in bulk',
    description:
      'Filter by date, duplicates or unavailable songs and remove dozens of tracks in one go.',
  },
  {
    icon: Merge,
    title: 'Merge playlists',
    description:
      'Combine several playlists into a new one or an existing one, without repeats.',
  },
  {
    icon: Sparkles,
    title: 'Create from others',
    description:
      'Build playlists from what your lists share, or what one has that the others don’t.',
  },
];

export function SignInHero() {
  const { authenticate, isAuthenticating } = useAuth();

  const login = useGoogleLogin({
    flow: 'auth-code',
    scope: SCOPES.join(' '),
    onSuccess: (codeResponse) => authenticate(codeResponse),
    onError: (err) => handleApiError(err, 'Failed to sign in with Google'),
  });

  return (
    <div className="mx-auto max-w-5xl py-12 sm:py-20">
      <section className="space-y-6 text-center">
        <div className="flex flex-wrap justify-center gap-2">
          {(Object.keys(PROVIDER_NAMES) as ProviderType[]).map((provider) => (
            <span
              key={provider}
              className="bg-card text-muted-foreground flex items-center gap-1.5 rounded-full border py-1 pr-3 pl-1 text-xs font-medium"
            >
              <ProviderMark
                provider={provider}
                className="size-5 rounded-full text-[8px]"
              />
              {PROVIDER_NAMES[provider]}
            </span>
          ))}
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">
          Your playlists,{' '}
          <span className="from-primary bg-gradient-to-r to-orange-400 bg-clip-text text-transparent">
            finally under control
          </span>
        </h1>
        <p className="text-muted-foreground mx-auto max-w-xl text-lg text-balance">
          Clean up, merge and remix playlists across YouTube, YouTube Music,
          Spotify, Apple Music and Amazon Music.
        </p>
        <Button size="lg" onClick={() => login()} disabled={isAuthenticating}>
          {isAuthenticating ? <Loader2 className="animate-spin" /> : <LogIn />}
          {isAuthenticating ? 'Connecting…' : 'Continue with Google'}
        </Button>
      </section>

      <section className="mt-16 grid gap-4 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <article key={title} className="bg-card rounded-xl border p-5">
            <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
              <Icon className="size-4" />
            </span>
            <h2 className="mt-4 font-semibold">{title}</h2>
            <p className="text-muted-foreground mt-1 text-sm">{description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
