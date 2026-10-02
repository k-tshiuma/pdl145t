import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Footer } from '../../components/layout/Footer';
import type { ApiResponse, LoginResponse } from '../../types';

const loginSchema = z.object({
  username: z.string().min(1, 'Nom d\'utilisateur requis'),
  password: z.string().min(1, 'Mot de passe requis'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', data);
      const { accessToken, refreshToken, user } = response.data.data;
      setAuth(accessToken, refreshToken, user);
      navigate('/');
    } catch (err: any) {
      const message = err?.response?.data?.error?.message ?? 'Erreur de connexion';
      setServerError(message);
    }
  };

  return (
    <div className="min-h-screen bg-page-bg flex flex-col w-full relative overflow-hidden">
      {/* Top Bar */}
      <header className="bg-sovereign-navy py-6 flex flex-col items-center justify-center w-full relative shadow-sm z-20">
        <div className="absolute bottom-0 left-0 w-full h-1 flex">
          <div className="flex-1 bg-republican-crimson"></div>
          <div className="flex-1 bg-golden-yellow"></div>
          <div className="flex-1 bg-congo-azure"></div>
        </div>

        <img src="/logo.png" alt="Ministère de la Santé Publique" className="h-20 mx-auto mb-4 bg-white rounded-md px-3 py-1 object-contain" />
        <h1 className="text-display-lg-mobile md:text-display-lg text-white font-bold">PDL-145T</h1>
        <p className="text-blue-100 text-body-md mt-2 text-center">
          Système d'enregistrement des naissances
        </p>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 z-10 w-full py-8 md:py-0">
        {/* Formulaire */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-md bg-white rounded-3xl p-6 md:p-8 space-y-5 shadow-soft z-10 relative"
        >
          <h2 className="text-headline-md text-primary-text text-center font-semibold">Welcome Back</h2>

          {serverError && (
            <div className="flex items-start gap-2 bg-error-container p-3 rounded text-body-sm text-error">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <Input
            label="Nom d'utilisateur"
            placeholder="ex: agent.test"
            required
            error={errors.username?.message}
            {...register('username')}
          />

          <div className="relative">
            <Input
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              required
              error={errors.password?.message}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[42px] text-on-surface-variant hover:text-ink"
              aria-label={showPassword ? 'Masquer' : 'Afficher'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <Button type="submit" fullWidth loading={isSubmitting}>
            Se connecter
          </Button>

          <p className="text-center text-body-sm text-on-surface-variant">
            Contactez votre administrateur si vous n'avez pas de compte
          </p>
        </form>
      </div>
      
      {/* Decorative background blob */}
      <div className="absolute top-0 left-0 w-full h-64 bg-brand-purple rounded-b-[40px] z-0 opacity-10 hidden"></div>
      <Footer />
    </div>
  );
}
