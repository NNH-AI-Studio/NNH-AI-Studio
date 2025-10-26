import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
// (ملاحظة: لم نعد بحاجة إلى GoogleAuthService هنا)

function GoogleCallback() {
  const navigate = useNavigate();
  const location = useLocation(); // سنستخدم هذا لقراءة الـ hash
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting Google Business Account...');

  useEffect(() => {
    // اقرأ البارامترات من الـ hash (ما بعد علامة #)
    const hashParams = new URLSearchParams(location.hash.substring(1)); // .substring(1) لإزالة #

    if (hashParams.has('success')) {
      setStatus('success');
      setMessage('Success! Connected Google Business account.');
      
      // امسح الـ hash من الرابط
      window.history.replaceState({}, document.title, '/accounts');
      // أعد توجيه المستخدم إلى صفحة الحسابات بعد عرض رسالة النجاح
      setTimeout(() => navigate('/accounts', { replace: true }), 1500);

    } else if (hashParams.has('error')) {
      setStatus('error');
      setMessage(hashParams.get('error') || 'Failed to connect Google account');
      
      // امسح الـ hash من الرابط
      window.history.replaceState({}, document.title, '/accounts');
      // أعد توجيه المستخدم إلى صفحة الحسابات بعد عرض رسالة الخطأ
      setTimeout(() => navigate('/accounts', { replace: true }), 2500);

    } else {
      // حالة وصول المستخدم إلى هذه الصفحة عن طريق الخطأ
      setStatus('error');
      setMessage('Invalid callback URL. Returning to accounts.');
      window.history.replaceState({}, document.title, '/accounts');
      setTimeout(() => navigate('/accounts', { replace: true }), 2500);
    }

  }, [navigate, location]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-black border border-neon-orange shadow-neon-orange rounded-xl p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Connecting Account</h2>
            <p className="text-white">{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Success!</h2>
            <p className="text-white">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Connection Failed</h2>
            <p className="text-white">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default GoogleCallback;