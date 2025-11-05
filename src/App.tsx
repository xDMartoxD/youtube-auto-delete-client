import './App.css';
import { ThemeProvider } from './components/theme-provider';
import { ErrorBoundary } from './components/ErrorBoundary';
import LandingPage from './pages/landing/index';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import NotFoundPage from './pages/not-found';
import { useEffect } from 'react';
import { useMe } from './stores/auth';

const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '*', element: <NotFoundPage /> },
]);

function App() {
  const me = useMe();
  useEffect(() => {
    me();
  }, []);
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
