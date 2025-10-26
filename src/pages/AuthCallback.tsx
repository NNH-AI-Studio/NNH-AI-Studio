import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * هذه الصفحة هي صفحة "مؤقتة" للتعامل مع
 * عودة المستخدم من Google OAuth.
 * * AuthContext (الملف الذي أصلحناه) يستمع لـ onAuthStateChange
 * ويتعامل مع الجلسة تلقائياً.
 * * كل ما نحتاجه هو عرض شاشة تحميل بسيطة
 * ومنح AuthContext ثانية واحدة للعمل.
 */
function AuthCallback() {
  const navigate = useNavigate();
  const { session } = useAuth(); // (نحن نراقب الجلسة من الكونتكست)

  useEffect(() => {
    // إذا اكتشف AuthContext الجلسة بنجاح، اذهب إلى لوحة التحكم
    if (session) {
      navigate('/dashboard', { replace: true });
    }
    
    // كإجراء احترازي، إذا لم يحدث شيء بعد 3 ثوانٍ،
    // أعد المستخدم إلى صفحة الدخول (ربما حدث خطأ ما)
    const timer = setTimeout(() => {
      if (!session) {
        // سنرسل رسالة خطأ مختلفة وأوضح
        navigate('/login#error=Callback%20timeout', { replace: true });
      }
    }, 3000); // زيادة الوقت قليلاً

    return () => clearTimeout(timer);
  }, [session, navigate]); // سيعمل هذا الـ effect كلما تغيرت 'session'

  // اعرض شاشة تحميل بسيطة
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-white">
      <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-white mb-2">Signing in...</h2>
      <p className="text-white">Please wait, we're securely logging you in.</p>
    </div>
  );
}

export default AuthCallback;