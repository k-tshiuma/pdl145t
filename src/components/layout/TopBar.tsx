import { useAuthStore } from '../../stores/auth.store';
import { LogOut, BarChart3, Baby, Stethoscope, Users } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

/**
 * TopBar — Barre de navigation supérieure
 * Min height: 64px (DESIGN.md topbar token)
 * Fond: Sovereign Navy (#0C2340)
 */
export function TopBar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-sovereign-navy min-h-topbar flex items-center justify-between px-3 md:px-6 shadow-sm z-20 sticky top-0">
      {/* Tricolor border */}
      <div className="absolute bottom-0 left-0 w-full h-1 flex">
        <div className="flex-1 bg-republican-crimson"></div>
        <div className="flex-1 bg-golden-yellow"></div>
        <div className="flex-1 bg-congo-azure"></div>
      </div>

      {/* Logo / Titre */}
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="h-10 object-contain bg-white rounded-md px-2" />
          <div>
            <h1 className="text-white text-headline-sm leading-tight font-bold hidden sm:block">PDL-145T</h1>
            <p className="text-[10px] text-blue-200 hidden md:block uppercase tracking-wider">Rép. Dém. du Congo</p>
          </div>
        </Link>

        {/* Navigation tabs */}
        {user && (
          <nav className="flex items-center gap-1 ml-2 md:ml-4">
            <Link
              to="/births"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                location.pathname.startsWith('/births')
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Baby className="w-4 h-4" />
              <span>Naissances</span>
            </Link>

            <Link
              to="/parents"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                isActive('/parents')
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Parents</span>
            </Link>

            <Link
              to="/statistics"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                isActive('/statistics')
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Statistiques & Carte</span>
            </Link>

            <Link
              to="/tools"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                isActive('/tools')
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Outils Cliniques</span>
            </Link>
          </nav>
        )}
      </div>

      {/* User info + Logout */}
      {user && (
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-white text-body-sm font-medium">{user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.username}</p>
            <p className="text-blue-100 text-label-md uppercase">{user.roleName.replace(/_/g, ' ')}</p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 p-2 rounded-full text-white hover:bg-white/20 transition-colors"
            title="Se déconnecter"
            aria-label="Se déconnecter"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      )}
    </header>
  );
}
