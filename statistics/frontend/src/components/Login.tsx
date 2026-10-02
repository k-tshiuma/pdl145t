import React, { useState } from 'react';
import { login } from '../services/api';
import { Shield } from 'lucide-react';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      onLogin();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pdl-bg flex items-center justify-center p-4">
      <div className="bg-pdl-surface max-w-md w-full p-8 border border-pdl-border rounded-xl shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-pdl-primary rounded-full flex items-center justify-center text-white">
            <Shield size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-pdl-primary mb-2">PDL-145T Démographie</h2>
        <p className="text-center text-pdl-text-muted text-sm mb-8">Authentification requise</p>

        {error && <div className="bg-red-50 text-pdl-danger p-3 rounded mb-4 text-sm border border-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Nom d'utilisateur</label>
            <input 
              type="text" 
              className="w-full border border-pdl-border rounded p-2 focus:border-pdl-primary focus:ring-1 focus:ring-pdl-primary outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Mot de passe</label>
            <input 
              type="password" 
              className="w-full border border-pdl-border rounded p-2 focus:border-pdl-primary focus:ring-1 focus:ring-pdl-primary outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-pdl-primary hover:bg-[#133E68] text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-70"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
