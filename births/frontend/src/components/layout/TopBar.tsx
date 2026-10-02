import { useAuthStore } from '../../stores/auth.store';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * TopBar — Barre de navigation supérieure
 * Min height: 64px (DESIGN.md topbar token)
 * Fond: Sovereign Navy (#0C2340)
 */
export function TopBar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-sovereign-navy min-h-topbar flex items-center justify-between px-4 md:px-6 shadow-sm z-20 sticky top-0">
      {/* Tricolor border */}
      <div className="absolute bottom-0 left-0 w-full h-1 flex">
        <div className="flex-1 bg-republican-crimson"></div>
        <div className="flex-1 bg-golden-yellow"></div>
        <div className="flex-1 bg-congo-azure"></div>
      </div>

      {/* Logo / Titre */}
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="Logo" className="h-10 object-contain bg-white rounded-md px-2" />
        <div>
          <h1 className="text-white text-headline-sm leading-tight font-bold hidden sm:block">PDL-145T</h1>
        </div>
      </div>

      {/* User info + Logout */}
      {user && (
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-white text-body-sm font-medium">{user.username}</p>
            <p className="text-blue-100 text-label-md uppercase">{user.roleName.replace(/_/g, ' ')}</p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 p-2 rounded-full text-white hover:bg-white/20 transition-colors"
            aria-label="Se déconnecter"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      )}
    </header>
  );
}
