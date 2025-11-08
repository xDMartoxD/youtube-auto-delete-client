import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/playlist-combobox';
import { SCOPES } from '@/constants';
import {
  useAuthenticate,
  useLogout,
  useIsAuthenticated,
  useIsAuthenticating,
} from '@/stores/auth';
import {
  usePlaylists,
  useIsLoadingPlaylists,
  useYoutubeActions,
} from '@/stores/youtube';
import { useGoogleLogin } from '@react-oauth/google';
import { AvatarComponent } from '@/components/google-avatar';
import { VideosCarrousell } from '@/components/videos-carrousell';
import { VideoSelectionBar } from '@/components/video-selection-bar';
import { DeleteVideosDialog } from '@/components/delete-videos-dialog';
import { VideoDateFilterPanel } from '@/components/video-date-filter-panel';
import { FeedbackDialog } from '@/components/feedback-dialog';
import { useState } from 'react';
import { LogOut, PlayCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVideoSelection, usePlaylistVideos } from '@/hooks';
import { formatDate } from '@/utils';

export default function LandingPage() {
  const authenticate = useAuthenticate();
  const logout = useLogout();
  const isAuthenticated = useIsAuthenticated();
  const isAuthenticating = useIsAuthenticating();
  const playlists = usePlaylists();
  const isLoadingPlaylists = useIsLoadingPlaylists();
  const { getUserPlaylists } = useYoutubeActions();
  const { hasSelectedVideos, getDateRangesSelection } = useVideoSelection();
  const { videosItems, hasNextPage, isLoadingVideos, loadNextPage } =
    usePlaylistVideos();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const login = useGoogleLogin({
    flow: 'auth-code',
    scope: Array.isArray(SCOPES) ? SCOPES.join(' ') : SCOPES,
    onSuccess: async (codeResponse) => {
      await authenticate(codeResponse);
    },
    onError: (err) => {
      console.error('Login error', err);
    },
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // TODO: Implementar llamada al API para eliminar videos
      // await deleteVideos(selectedVideoIds);
      console.log('Deleting videos...');
      // Simular delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error deleting videos:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-lg bg-primary p-2">
                <PlayCircle className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold leading-tight">
                  YouTube Playlist Manager
                </h1>
                <p className="text-xs text-muted-foreground">
                  Elimina videos de manera eficiente
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <FeedbackDialog />
              {isAuthenticated ? (
                <>
                  <AvatarComponent />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Cerrar sesión</span>
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={login}
                  disabled={isAuthenticating}
                  className={cn(
                    'gap-2',
                    '!border-[#e84133] !text-[#e84133]',
                    'hover:!bg-[#e84133] hover:!text-white'
                  )}
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Conectando...</span>
                    </>
                  ) : (
                    <>
                      <img
                        src="https://cdn.shadcnstudio.com/ss-assets/brand-logo/google-icon.png?width=20&height=20&format=auto"
                        alt="Google Icon"
                        className="size-4"
                      />
                      <span>Continuar con Google</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isAuthenticated ? (
          /* Welcome Screen */
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">
                Gestiona tus playlists de YouTube
              </h2>
              <p className="text-muted-foreground max-w-md">
                Elimina videos de tus playlists de manera rápida y eficiente.
                Selecciona múltiples videos y elimínalos en un solo clic.
              </p>
            </div>
            <Button
              size="lg"
              onClick={login}
              disabled={isAuthenticating}
              className={cn(
                'gap-2',
                '!border-[#e84133] !text-[#e84133]',
                'hover:!bg-[#e84133] hover:!text-white'
              )}
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <img
                    src="https://cdn.shadcnstudio.com/ss-assets/brand-logo/google-icon.png?width=20&height=20&format=auto"
                    alt="Google Icon"
                    className="size-5"
                  />
                  Continuar con Google
                </>
              )}
            </Button>
          </div>
        ) : (
          /* Authenticated Content */
          <div className="space-y-6">
            {/* Playlist Selection Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Selecciona una playlist
                </h2>
                <p className="text-sm text-muted-foreground">
                  Elige la playlist de la que deseas eliminar videos
                </p>
              </div>
              {/* Playlist Combobox */}
              <div>
                <Combobox />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={getUserPlaylists}
                  disabled={isLoadingPlaylists}
                  className="gap-2"
                >
                  {isLoadingPlaylists ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Cargando...</span>
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        Actualizar playlists
                      </span>
                      <span className="sm:hidden">Actualizar</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Videos Section */}
            {playlists && (
              <div className="space-y-4">
                <VideosCarrousell
                  videos={videosItems}
                  title="Videos"
                  hasNextPage={hasNextPage}
                  isLoading={isLoadingVideos}
                  onLoadNext={loadNextPage}
                  showAdvanceFilterButton={true}
                />
              </div>
            )}

            {/* Videos Section - Date Ranges */}
            {playlists && Object.entries(getDateRangesSelection).length > 0 && (
              <div className="space-y-6">
                {Object.entries(getDateRangesSelection).map(
                  ([dateKey, range]) => {
                    // Use videos from the range response directly
                    const rangeVideos = range.videos?.items || [];

                    return (
                      <div key={dateKey} className="space-y-2">
                        <VideosCarrousell
                          videos={rangeVideos}
                          title={`${formatDate(range.start)} - ${formatDate(range.end)}`}
                          hasNextPage={false}
                          isLoading={range.isLoading}
                          onLoadNext={() => {}}
                        />
                      </div>
                    );
                  }
                )}
              </div>
            )}

            {!playlists && !isLoadingPlaylists && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <PlayCircle className="h-12 w-12 text-muted-foreground" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    No hay playlists disponibles
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Haz clic en "Actualizar playlists" para cargar tus playlists
                    de YouTube.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={getUserPlaylists}
                  className="gap-2"
                >
                  <PlayCircle className="h-4 w-4" />
                  Actualizar playlists
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Video Selection Bar */}
      {hasSelectedVideos && (
        <VideoSelectionBar
          onDelete={() => setShowDeleteDialog(true)}
          isDeleting={isDeleting}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteVideosDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
