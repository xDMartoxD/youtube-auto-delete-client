import './App.css';
import { ThemeProvider } from './components/theme-provider';
import { ErrorBoundary } from './components/ErrorBoundary';
import LandingPage from './pages/landing/index';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import NotFoundPage from './pages/not-found';
import PrivacyPolicyPage from './pages/privacy-policy/index';
import { useEffect, useRef } from 'react';
import { useAuth } from './hooks';
import { Toaster } from 'sonner';

const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/privacy-policy', element: <PrivacyPolicyPage /> },
  { path: '*', element: <NotFoundPage /> },
]);

function App() {
  const { me } = useAuth();
  const hasRunRef = useRef(false);

  useEffect(() => {
    // Evitar ejecución duplicada (incluso con StrictMode)
    if (hasRunRef.current) return;
    hasRunRef.current = true;
    // Ejecutar en modo silencioso para no mostrar toast de error
    me(true);
  }, [me]);
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
        <Toaster />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
