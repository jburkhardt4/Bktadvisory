import { Outlet, useLocation } from 'react-router';
import { useEffect } from 'react';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { AIChatbot } from './AIChatbot';

export function Layout() {
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Outlet />
      <Footer />
      <AIChatbot />
    </div>
  );
}
