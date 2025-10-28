import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useAuth } from '../contexts/AuthContext';

export default function UserHome() {
  const { user, signOut } = useAuth();

  const fullName = (user?.user_metadata?.full_name as string) || (user?.user_metadata?.name as string) || user?.email || 'User';
  const avatarUrl = (user?.user_metadata?.avatar_url as string) || (user?.user_metadata?.picture as string) || '';
  const initial = fullName?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />

      <main className="flex-1 pt-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="w-14 h-14 rounded-full object-cover border border-white/20" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xl font-bold">
                  {initial}
                </div>
              )}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Welcome, {fullName}</h1>
                <p className="text-white/70 text-sm">Glad to have you back</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/settings" className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm hover:bg-white/15">Settings</Link>
              <button
                onClick={async () => { await signOut(); }}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold rounded-lg text-sm"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="mb-8">
            <Link to="/dashboard">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-medium"
              >
                Go to Dashboard
              </motion.button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/locations" className="group">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 group-hover:border-white/20 transition-colors">
                <div className="text-lg font-semibold mb-2">Manage Locations</div>
                <p className="text-white/70 text-sm">Add or update your business locations</p>
              </div>
            </Link>
            <Link to="/reviews" className="group">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 group-hover:border-white/20 transition-colors">
                <div className="text-lg font-semibold mb-2">Reviews</div>
                <p className="text-white/70 text-sm">Reply and monitor customer feedback</p>
              </div>
            </Link>
            <Link to="/posts" className="group">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 group-hover:border-white/20 transition-colors">
                <div className="text-lg font-semibold mb-2">Posts</div>
                <p className="text-white/70 text-sm">Create and schedule Google posts</p>
              </div>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
