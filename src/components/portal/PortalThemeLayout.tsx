import { Outlet } from 'react-router';
import { ThemeProvider } from '../../contexts/ThemeProvider';
import { Toaster } from '../ui/sonner';
import { RequireAuth } from '../RequireAuth';

export function PortalThemeLayout() {
  return (
    <ThemeProvider>
      <RequireAuth>
        <Outlet />
      </RequireAuth>
      <Toaster richColors position="top-right" closeButton />
    </ThemeProvider>
  );
}
