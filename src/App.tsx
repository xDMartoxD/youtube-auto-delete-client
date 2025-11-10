import './App.css';
import { ThemeProvider } from './components/theme-provider';
import { ErrorBoundary } from './components/ErrorBoundary';
import LandingPage from './pages/landing/index';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import NotFoundPage from './pages/not-found';
import { useEffect } from 'react';
import { useAuth } from './hooks';
import { Toaster } from 'sonner';

const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '*', element: <NotFoundPage /> },
]);

function App() {
  const { me } = useAuth();
  useEffect(() => {
    me();
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
