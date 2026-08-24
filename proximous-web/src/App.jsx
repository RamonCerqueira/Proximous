import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import { ThemeProvider } from './hooks/useTheme.jsx';
import { VipModalProvider } from './context/VipModalContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Lazy Loaded Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Home = lazy(() => import('./pages/Home'));
const Discover = lazy(() => import('./pages/Discover'));
const ModoAgora = lazy(() => import('./pages/ModoAgora'));
const ActivitiesExplorer = lazy(() => import('./pages/ActivitiesExplorer'));
const MomentsFeed = lazy(() => import('./pages/MomentsFeed'));
const Matches = lazy(() => import('./pages/Matches'));
const Messages = lazy(() => import('./pages/Messages'));
const Profile = lazy(() => import('./pages/Profile'));
const Premium = lazy(() => import('./pages/Premium'));
const Help = lazy(() => import('./pages/Help'));
const Contact = lazy(() => import('./pages/Contact'));
const Advertising = lazy(() => import('./pages/Advertising'));
const Settings = lazy(() => import('./pages/Settings'));
const Notifications = lazy(() => import('./pages/Notifications'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));
const Search = lazy(() => import('./pages/Search'));
const Achievements = lazy(() => import('./pages/Achievements'));

// Lazy Loaded Admin Pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminModeration = lazy(() => import('./pages/admin/AdminModeration'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

// Loading Component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <div className="loading-spinner mx-auto"></div>
      <p className="text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

// Admin Protected Route — checks for admin JWT claim
const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('proximous_token');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  try {
    // Decode payload (no signature verify — server does that)
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload?.type !== 'admin') {
      return <Navigate to="/admin/login" replace />;
    }
    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('proximous_token');
      return <Navigate to="/admin/login" replace />;
    }
  } catch {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

// App Routes component
const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login />
        } 
      />
      <Route 
        path="/register" 
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <Register />
        } 
      />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/welcome" element={<LandingPage />} />

      {/* Root route: Landing for visitors, Dashboard for authenticated users */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          ) : (
            <LandingPage />
          )
        } 
      />

      <Route 
        path="/discover" 
        element={
          <ProtectedRoute>
            <Layout>
              <Discover />
            </Layout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/now" 
        element={
          <ProtectedRoute>
            <Layout>
              <ModoAgora />
            </Layout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/activities" 
        element={
          <ProtectedRoute>
            <Layout>
              <ActivitiesExplorer />
            </Layout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/feed" 
        element={
          <ProtectedRoute>
            <Layout>
              <MomentsFeed />
            </Layout>
          </ProtectedRoute>
        } 
      />


      <Route 
        path="/matches" 
        element={
          <ProtectedRoute>
            <Layout>
              <Matches />
            </Layout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/messages" 
        element={
          <ProtectedRoute>
            <Layout>
              <Messages />
            </Layout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/profile/:userId" 
        element={
          <ProtectedRoute>
            <Layout>
              <PublicProfile />
            </Layout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/search" 
        element={
          <ProtectedRoute>
            <Layout>
              <Search />
            </Layout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/achievements" 
        element={
          <ProtectedRoute>
            <Layout>
              <Achievements />
            </Layout>
          </ProtectedRoute>
        } 
      />

      <Route
        path="/premium"
        element={
          <ProtectedRoute>
            <Layout>
              <Premium />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/help"
        element={
          <ProtectedRoute>
            <Layout>
              <Help />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/contact"
        element={
          <ProtectedRoute>
            <Layout>
              <Contact />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/advertising"
        element={
          <ProtectedRoute>
            <Layout>
              <Advertising />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute>
            <Layout>
              <Notifications />
            </Layout>
          </ProtectedRoute>
        } 
      />


      <Route 
        path="/support" 
        element={
          <ProtectedRoute>
            <Layout>
              <Contact />
            </Layout>
          </ProtectedRoute>
        } 
      />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
      <Route path="/admin/users" element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} />
      <Route path="/admin/moderation" element={<AdminProtectedRoute><AdminModeration /></AdminProtectedRoute>} />
      <Route path="/admin/settings" element={<AdminProtectedRoute><AdminSettings /></AdminProtectedRoute>} />
      <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

      {/* Catch all route - MUST BE AT THE VERY END */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
};

// Main App component
function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <VipModalProvider>
            <AppRoutes />
          </VipModalProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
