import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth.store';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/login/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { BirthWorkflowPage } from './pages/births/BirthWorkflowPage';
import { BirthsPage } from './pages/births/BirthsPage';
import { StatisticsPage } from './pages/statistics/StatisticsPage';
import { ToolsPage } from './pages/ToolsPage';
import { ParentPage } from './pages/parents/ParentPage';

/**
 * Route protégée — redirige vers /login si non authentifié.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

/**
 * Composant racine — React Router avec layout authentifié.
 */
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route publique */}
        <Route path="/login" element={<LoginPage />} />

        {/* Routes protégées */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/births" element={<BirthsPage />} />
          <Route path="/births/:id" element={<BirthsPage />} />
          <Route path="/births/new" element={<BirthWorkflowPage />} />
          <Route path="/parents" element={<ParentPage />} />
          <Route path="/parents/:id" element={<ParentPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/tools" element={<ToolsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
