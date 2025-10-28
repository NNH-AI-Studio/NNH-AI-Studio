import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import React, { Component, ReactNode } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ToastProvider as MicroToastProvider } from './components/shared/Toast';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import SkipLink from './components/shared/SkipLink';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Locations from './pages/Locations';
import Posts from './pages/Posts';
import Reviews from './pages/Reviews';
import Insights from './pages/Insights';
import GoogleCallback from './pages/GoogleCallback';
import AuthCallback from './pages/AuthCallback';
import AISettings from './pages/AISettings';
import Settings from './pages/Settings';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import About from './pages/About';
import Contact from './pages/Contact';
import Pricing from './pages/Pricing';
import Citations from './pages/Citations';
import UserHome from './pages/UserHome';

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('App Error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-gray-900 border border-red-500 rounded-lg p-8">
            <h1 className="text-3xl font-bold text-red-500 mb-4">Configuration Error</h1>
            <p className="text-gray-300 mb-6">
              The application is missing required environment variables.
            </p>
            <div className="bg-gray-800 border border-gray-700 rounded p-4 mb-6">
              <p className="text-sm text-gray-400 mb-2">Please add these variables in Netlify:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                <li>VITE_SUPABASE_URL</li>
                <li>VITE_SUPABASE_ANON_KEY</li>
                <li>All AI provider API keys</li>
                <li>Google OAuth credentials</li>
              </ul>
            </div>
            <p className="text-sm text-gray-400">
              Go to: Netlify Dashboard → Site settings → Environment variables
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppRoutes() {
  const { user } = useAuth();

  // Redirect component to preserve hash when forwarding /accounts -> /settings/integrations
  function AccountsRedirect() {
    const location = useLocation();
    const navigate = useNavigate();
    React.useEffect(() => {
      navigate(`/settings/integrations${location.hash || ''}` , { replace: true });
    }, [location.hash, navigate]);
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <SkipLink />
      <AnimatePresence mode="wait">
        <Routes>
          <Route
            path="/"
            element={<Home />}
          />
          <Route
            path="/landing"
            element={<Home />}
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/auth/login"
            element={user ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/" replace /> : <Register />}
          />
          <Route
            path="/auth/signup"
            element={user ? <Navigate to="/" replace /> : <Register />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <UserHome />
              </ProtectedRoute>
            }
          />
          <Route path="/accounts" element={<AccountsRedirect />} />
          <Route
            path="/locations"
            element={
              <ProtectedRoute>
                <Layout>
                  <Locations />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/posts"
            element={
              <ProtectedRoute>
                <Layout>
                  <Posts />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reviews"
            element={
              <ProtectedRoute>
                <Layout>
                  <Reviews />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/insights"
            element={
              <ProtectedRoute>
                <Layout>
                  <Insights />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/citations"
            element={
              <ProtectedRoute>
                <Layout>
                  <Citations />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/auth/google/callback"
            element={<GoogleCallback />}
          />
          <Route
            path="/auth/callback"
            element={<AuthCallback />}
          />
          <Route
            path="/ai-settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <AISettings />
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
            path="/settings/integrations"
            element={
              <ProtectedRoute>
                <Layout>
                  <Accounts />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/terms"
            element={<Terms />}
          />
          <Route
            path="/privacy"
            element={<Privacy />}
          />
          <Route
            path="/about"
            element={<About />}
          />
          <Route
            path="/contact"
            element={<Contact />}
          />
          <Route
            path="/pricing"
            element={<Pricing />}
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <MicroToastProvider>
            <Router>
              <AppRoutes />
            </Router>
          </MicroToastProvider>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;