import { Button } from '@/components/ui/button';
import { SCOPES } from '@/constants';
import useAuth from '@/stores/auth';
import useYoutube from '@/stores/youtube';
import { useGoogleLogin } from '@react-oauth/google';

export default function LandingPage() {
  const { authenticate, isAuthenticated } = useAuth();
  const { getUserPlaylists } = useYoutube();
  const login = useGoogleLogin({
    flow: 'auth-code',
    scope: Array.isArray(SCOPES) ? SCOPES.join(' ') : SCOPES, // <-- here
    onSuccess: async (codeResponse) => {
      await authenticate(codeResponse);
    },
    onError: (err) => {
      console.error('Login error', err);
    },
  });

  return (
    <div>
      <Button
        variant="outline"
        className="!border-[#e84133] !text-[#e84133]"
        onClick={login}
      >
        <img
          src="https://cdn.shadcnstudio.com/ss-assets/brand-logo/google-icon.png?width=20&height=20&format=auto"
          alt="Google Icon"
          className="size-5"
        />
        Continue with Google
      </Button>

      <Button
        variant="outline"
        className="!border-[#e84133] !text-[#e84133]"
        onClick={getUserPlaylists}
      >
        Get user playlists
      </Button>
      {isAuthenticated && <div>Authenticated</div>}
      {!isAuthenticated && <div>Not Authenticated</div>}
    </div>
  );
}
