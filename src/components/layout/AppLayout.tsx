import { Outlet, useLocation } from 'react-router-dom';
import { TopBar } from './TopBar';
import { ConnectivityBanner } from './ConnectivityBanner';
import { Footer } from './Footer';

/**
 * Layout principal avec TopBar et ConnectivityBanner.
 * Le contenu de la page est rendu via React Router <Outlet />.
 * Padding bottom pour le NavDock fixe (76px) sauf sur le dashboard.
 */
export function AppLayout() {
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  return (
    <div className="min-h-screen bg-page-bg flex flex-col w-full shadow-soft relative">
      <ConnectivityBanner />
      <TopBar />
      <main className={`flex-1 px-4 ${isDashboard ? 'pb-8' : 'pb-dock'}`}>
        <Outlet />
      </main>
      {isDashboard && <Footer />}
    </div>
  );
}
