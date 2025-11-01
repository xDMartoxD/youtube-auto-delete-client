import './App.css';
import { ThemeProvider } from './components/theme-provider';

import LandingPage from './pages/landing/index';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import NotFoundPage from './pages/not-found';
import { useEffect } from 'react';
import useAuth from './stores/auth';

const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },

  { path: '*', element: <NotFoundPage /> },
]);

function App() {
  const { me } = useAuth();
  useEffect(() => {
    me();
  }, []);
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
