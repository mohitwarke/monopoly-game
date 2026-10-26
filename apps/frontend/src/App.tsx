import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { LoadingOverlay } from '@monopoly/ui-components';
import { useAuthStore } from './store/authStore';
import { useGameStore } from './store/gameStore';
import { Layout } from './components/shared/Layout';

// Lazy load pages for code splitting
const LandingPage = lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })));
const LoginPage = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const RegisterPage = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const LobbyListPage = lazy(() => import('./pages/LobbyList').then(m => ({ default: m.LobbyList })));
const LobbyPage = lazy(() => import('./pages/Lobby').then(m => ({ default: m.Lobby })));
const GamePage = lazy(() => import('./pages/Game').then(m => ({ default: m.Game })));
const TournamentPage = lazy(() => import('./pages/Tournament').then(m => ({ default: m.Tournament })));
const ProfilePage = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const SettingsPage = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const ModdingPage = lazy(() => import('./pages/Modding').then(m => ({ default: m.Modding })));

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingOverlay isLoading message="Loading..." size="lg" />}>
    {children}
  </Suspense>
);

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, initializeAuth } = useAuthStore();
  const { initializeGame } = useGameStore();

  // Initialize auth on first render
  React.useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function GameRoute({ children }: { children: React.ReactNode }) {
  const { currentGameId } = useGameStore();

  if (!currentGameId) {
    return <Navigate to="/lobbies" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><RegisterPage /></PageWrapper>} />

        {/* Protected routes */}
        <Route
          element={
            <PrivateRoute>
              <PageWrapper>
                <Layout />
              </PageWrapper>
            </PrivateRoute>
          }
        >
          <Route path="/lobbies" element={<LobbyListPage />} />
          <Route path="/lobbies/:lobbyId" element={<LobbyPage />} />
          <Route path="/tournaments" element={<TournamentPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/modding" element={<ModdingPage />} />
        </Route>

        {/* Game route - requires active game */}
        <Route
          element={
            <PrivateRoute>
              <GameRoute>
                <PageWrapper>
                  <Layout />
                </PageWrapper>
              </GameRoute>
            </PrivateRoute>
          }
        >
          <Route path="/game/:gameId" element={<GamePage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}