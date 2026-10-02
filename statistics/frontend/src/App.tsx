import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { logout } from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      try {
        setUser(JSON.parse(userData));
      } catch (e) {}
    }
  }, []);

  if (!isAuthenticated) {
    return <Login onLogin={() => {
      setIsAuthenticated(true);
      setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    }} />;
  }

  return (
    <div className="min-h-screen bg-pdl-bg flex flex-col">
      <header className="bg-pdl-surface border-b border-pdl-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-pdl-primary rounded-full flex items-center justify-center text-white font-bold">
            RDC
          </div>
          <div>
            <h1 className="font-bold text-pdl-primary leading-tight">RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</h1>
            <p className="text-xs text-pdl-text-muted">Système National d'Analyse Démographique & Territoriale — PDL-145T</p>
          </div>
        </div>
        <div className="flex gap-4 text-sm items-center">
          <span className="text-pdl-secondary font-semibold border border-pdl-secondary px-2 py-1 rounded bg-orange-50">En ligne • Synchronisé</span>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="font-semibold text-pdl-primary block">{user?.firstName || user?.username}</span>
              <span className="text-xs text-pdl-text-muted block uppercase">{user?.role}</span>
            </div>
            <div className="w-8 h-8 bg-pdl-primary text-white rounded-full flex items-center justify-center font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          </div>
          <button onClick={logout} className="ml-4 text-xs text-pdl-danger hover:underline">Déconnexion</button>
        </div>
      </header>
      
      <main className="flex-1 overflow-auto">
        <Dashboard />
      </main>
    </div>
  );
}

export default App;

