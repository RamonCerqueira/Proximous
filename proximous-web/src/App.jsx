import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import { ThemeProvider } from './hooks/useTheme.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Discover from './pages/Discover';
import ModoAgora from './pages/ModoAgora';
import MomentsFeed from './pages/MomentsFeed';
import Matches from './pages/Matches';

import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Premium from './pages/Premium';
import Help from './pages/Help';
import Contact from './pages/Contact';
import Advertising from './pages/Advertising';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';

// Admin Pages

import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminModeration from './pages/admin/AdminModeration';
import AdminSettings from './pages/admin/AdminSettings';

// Loading Component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <div className="loading-spinner mx-auto"></div>
      <p className="text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

// App Routes component
const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
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

      {/* Protected routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
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
              <Help />
            </Layout>
          </ProtectedRoute>
        } 
      />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/moderation" element={<AdminModeration />} />
      <Route path="/admin/settings" element={<AdminSettings />} />
      <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

      {/* Catch all route - MUST BE AT THE VERY END */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Main App component
function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
