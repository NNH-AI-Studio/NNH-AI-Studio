import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chrome, Shield, TrendingUp, User, Mail, Lock, AlertCircle, Eye, EyeOff,
  Smartphone, Send, CheckCircle, Check, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

type AuthMode = 'email' | 'magic-link' | 'phone';

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

function Register() {
  const navigate = useNavigate();
  const { user, signUp, signInWithMagicLink, signInWithPhone, verifyPhoneOTP, signInWithGoogle } = useAuth();
  const { showToast } = useToast();
  const [mode, setMode] = useState<AuthMode>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    otp: '',
  });
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: 'Too weak',
    color: 'red',
    checks: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
    },
  });

  useEffect(() => {
    if (user) {
      showToast('success', 'Account created successfully! Redirecting...');
      navigate('/landing', { replace: true });
    }
  }, [user, navigate, showToast]);

  useEffect(() => {
    if (formData.password) {
      const checks = {
        length: formData.password.length >= 8,
        uppercase: /[A-Z]/.test(formData.password),
        lowercase: /[a-z]/.test(formData.password),
        number: /[0-9]/.test(formData.password),
        special: /[^A-Za-z0-9]/.test(formData.password),
      };

      const score = Object.values(checks).filter(Boolean).length;
      let label = 'Too weak';
      let color = 'red';

      if (score >= 5) {
        label = 'Very strong';
        color = 'green';
      } else if (score >= 4) {
        label = 'Strong';
        color = 'blue';
      } else if (score >= 3) {
        label = 'Medium';
        color = 'yellow';
      } else if (score >= 2) {
        label = 'Weak';
        color = 'orange';
      }

      setPasswordStrength({ score, label, color, checks });
    }
  }, [formData.password]);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordStrength.score < 3) {
      setError('Please use a stronger password');
      return;
    }

    setLoading(true);

    const { error } = await signUp(formData.email, formData.password, formData.fullName);

    if (error) {
      setError(error.message);
      showToast('error', 'Registration failed: ' + error.message);
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Failed to sign up with Google:', error);
      showToast('error', 'Failed to sign up with Google. Please try again.');
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

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

  const handlePhoneSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fillDemoData = () => {
    setFormData({
      fullName: 'Demo User',
      email: 'demo@aistudio.com',
      password: 'Demo@123456',
      confirmPassword: 'Demo@123456',
      phone: '',
      otp: '',
    });
    setAgreedToTerms(true);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-6 pt-24">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">

          {/* LEFT SIDE */}
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-4 mb-6">
              <img src="/nnh-logo.png" alt="NNH Logo" className="w-20 h-20 lg:w-24 lg:h-24" />
              <h1 className="text-5xl lg:text-7xl font-bold text-white">
                NNH AI<span className="text-white block">Studio</span>
              </h1>
            </div>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands managing their GMB & YouTube with AI
            </p>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-center space-x-3"><TrendingUp className="w-5 h-5 text-orange-500" /><span>Real-time analytics</span></div>
              <div className="flex items-center space-x-3"><Shield className="w-5 h-5 text-orange-500" /><span>Enterprise security</span></div>
              <div className="flex items-center space-x-3"><Chrome className="w-5 h-5 text-orange-500" /><span>All-in-one AI Platform</span></div>
            </div>
          </motion.div>

          {/* RIGHT SIDE */}
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-neon-orange shadow-neon-orange">

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Create Your Account</h2>
              <p className="text-gray-400">Start managing your business with AI</p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-500 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Google Sign In */}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn} disabled={loading}
              className="w-full mb-6 bg-white text-gray-900 py-3 px-6 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2">
              <Chrome className="w-5 h-5" />
              <span>Sign up with Google</span>
            </motion.button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900/50 text-gray-400">Or register manually</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                  required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-orange transition-all"
                  placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-orange transition-all"
                  placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input type={showPassword ? 'text' : 'password'} name="password"
                  value={formData.password} onChange={handleChange} required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-orange transition-all"
                  placeholder="Create a strong password" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword"
                  value={formData.confirmPassword} onChange={handleChange} required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-orange transition-all"
                  placeholder="Confirm your password" />
              </div>

              <div className="flex items-start space-x-2">
                <input type="checkbox" id="terms" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 mt-1 rounded border-gray-700 bg-gray-800 text-orange-500 focus:ring-orange-500" />
                <label htmlFor="terms" className="text-sm text-gray-400">
                  I agree to the{' '}
                  <Link to="/terms" className="text-orange-500 hover:text-orange-400">Terms of Service</Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-orange-500 hover:text-orange-400">Privacy Policy</Link>
                </label>
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold py-3 px-6 rounded-lg hover:from-orange-600 transition-all disabled:opacity-50">
                {loading ? 'Creating Account...' : 'Create Account'}
              </motion.button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-orange-500 hover:text-orange-400 font-medium">
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Register;