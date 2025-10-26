import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  // تم حذف: const [timeoutReached, setTimeoutReached] = useState(false);
  // تم حذف: useEffect للـ timeout

  // 1. إذا كان التحميل قيد التقدم، اعرض شاشة التحميل
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-orange shadow-neon-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
          <p className="text-white/40 text-sm mt-2">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // 2. إذا انتهى التحميل (loading أصبح false) ولا يوجد مستخدم، وجه إلى صفحة تسجيل الدخول
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. إذا انتهى التحميل وهناك مستخدم، اعرض المحتوى
  return <>{children}</>;
}

export default ProtectedRoute;