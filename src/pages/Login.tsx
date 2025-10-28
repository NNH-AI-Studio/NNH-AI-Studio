import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chrome, Shield, TrendingUp, Mail, Lock, AlertCircle, Eye, EyeOff,
  Smartphone, Send
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
type AuthMode = 'email' | 'magic-link' | 'phone';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signIn, signInWithMagicLink, signInWithPhone, verifyPhoneOTP, resetPassword, signInWithGoogle } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<AuthMode>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    otp: '',
    resetEmail: '',
  });

  const from = (location.state as any)?.from?.pathname || '/home';

  // ✅ التوجيه بعد تسجيل الدخول الناجح
  useEffect(() => {
    if (user) {
      showToast('success', 'Welcome back!');
      navigate(from, { replace: true });
    }
  }, [user, navigate, from, showToast]);

  // ✅ تسجيل الدخول عبر Google
  // ✅ الصحيح — Supabase Auth فقط
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (err) {
      console.error('Google Sign-In error:', err);
      showToast('error', 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };
  // ✅ تسجيل الدخول بالبريد وكلمة المرور
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(formData.email, formData.password);

    if (error) {
      setError(error.message);
      showToast('error', 'Login failed: ' + error.message);
    } else {
      if (rememberMe) localStorage.setItem('rememberMe', 'true');
    }
    setLoading(false);
  };

  // ✅ تسجيل الدخول عبر Magic Link
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signInWithMagicLink(formData.email);
    if (error) {
      setError(error.message);
      showToast('error', 'Failed to send magic link: ' + error.message);
    } else {
      setMagicLinkSent(true);
      showToast('success', 'Magic link sent! Check your email.');
    }
    setLoading(false);
  };

  // ✅ تسجيل الدخول عبر الهاتف
  const handlePhoneSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!otpSent) {
      const { error } = await signInWithPhone(formData.phone);
      if (error) {
        setError(error.message);
        showToast('error', 'Failed to send OTP: ' + error.message);
      } else {
        setOtpSent(true);
        showToast('success', 'OTP sent to your phone!');
      }
    } else {
      const { error } = await verifyPhoneOTP(formData.phone, formData.otp);
      if (error) {
        setError(error.message);
        showToast('error', 'Invalid OTP: ' + error.message);
      } else {
        showToast('success', 'Phone verified! Redirecting...');
      }
    }
    setLoading(false);
  };

  // ✅ إعادة تعيين كلمة المرور
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await resetPassword(formData.resetEmail);
    if (error) {
      setError(error.message);
      showToast('error', 'Failed to send reset email: ' + error.message);
    } else {
      showToast('success', 'Password reset email sent!');
      setShowForgotPassword(false);
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-6 pt-24">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">

          {/* ---------- Left Side ---------- */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <div className="flex items-center justify-center lg:justify-start space-x-4 mb-6">
              <img src="/nnh-logo.png" alt="NNH AI Studio Logo" width="96" height="96"
                className="w-20 h-20 lg:w-24 lg:h-24" />
              <h1 className="text-5xl lg:text-7xl font-bold text-white">
                NNH AI<span className="text-white block">Studio</span>
              </h1>
            </div>
            <p className="text-xl text-gray-300 mb-8">
              Your all-in-one platform for GMB & YouTube management powered by AI
            </p>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-center space-x-3"><TrendingUp className="w-5 h-5 text-orange-500" /><span>Real-time analytics and insights</span></div>
              <div className="flex items-center space-x-3"><Shield className="w-5 h-5 text-orange-500" /><span>Secure authentication with multiple options</span></div>
              <div className="flex items-center space-x-3"><Chrome className="w-5 h-5 text-orange-500" /><span>Manage all platforms in one place</span></div>
            </div>
          </motion.div>

          {/* ---------- Right Side (Login Form) ---------- */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-neon-orange shadow-neon-orange"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-gray-400">Sign in to access your dashboard</p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-500 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Mode Switch */}
            <div className="flex gap-2 mb-6">
              {['email', 'magic-link', 'phone'].map((m) => (
                <button key={m} onClick={() => setMode(m as AuthMode)}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    mode === m
                      ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}>
                  {m === 'email' && <Mail className="w-4 h-4 inline mr-2" />}
                  {m === 'magic-link' && <Send className="w-4 h-4 inline mr-2" />}
                  {m === 'phone' && <Smartphone className="w-4 h-4 inline mr-2" />}
                  {m.replace('-', ' ')}
                </button>
              ))}
            </div>

            {/* Email Login Form */}
            <AnimatePresence mode="wait">
              {mode === 'email' && (
                <motion.form
                  key="email-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onSubmit={handleEmailSignIn}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input type="email" name="email" value={formData.email} onChange={handleChange}
                        required className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-orange transition-all"
                        placeholder="john@example.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input type={showPassword ? 'text' : 'password'} name="password"
                        value={formData.password} onChange={handleChange} required
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-11 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-orange transition-all"
                        placeholder="Enter your password" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-orange-500 focus:ring-orange-500" />
                      <span className="text-sm text-gray-400">Remember me</span>
                    </label>
                    <button type="button" onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-orange-500 hover:text-orange-400">Forgot password?</button>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold py-3 px-6 rounded-lg hover:from-orange-600 transition-all disabled:opacity-50">
                    {loading ? 'Signing In...' : 'Sign In'}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Divider */}
            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900/50 text-gray-400">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn} disabled={loading}
              className="w-full mt-6 bg-white text-gray-900 py-3 px-6 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2">
              <Chrome className="w-5 h-5" />
              <span>Sign in with Google</span>
            </motion.button>

            <div className="mt-6 text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-orange-500 hover:text-orange-400 font-medium">
                Create Account
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Login;