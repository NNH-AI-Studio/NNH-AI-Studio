import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { createContext, useContext, useState, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

const toastIcons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const toastColors = {
  success: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
  error: 'from-red-500/20 to-rose-500/20 border-red-500/30',
  warning: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
  info: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
};

const iconColors = {
  success: 'text-green-400',
  error: 'text-red-400',
  warning: 'text-yellow-400',
  info: 'text-blue-400',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (type: ToastType, message: string, duration = 5000) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = { id, type, message, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] space-y-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = toastIcons[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 100, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.8 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 25,
                }}
                className="pointer-events-auto"
              >
                <motion.div
                  layout
                  className={`
                    min-w-[300px] max-w-md p-4 rounded-lg
                    bg-gradient-to-r backdrop-blur-sm
                    border shadow-2xl
                    flex items-start gap-3
                    ${toastColors[toast.type]}
                  `}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 15,
                    }}
                  >
                    <Icon className={`w-6 h-6 flex-shrink-0 ${iconColors[toast.type]}`} />
                  </motion.div>

                  <div className="flex-1">
                    <p className="text-white font-medium leading-relaxed">
                      {toast.message}
                    </p>
                  </div>

                  <button
                    onClick={() => removeToast(toast.id)}
                    className="text-white/60 hover:text-white transition-colors flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {toast.duration && toast.duration > 0 && (
                    <motion.div
                      className={`absolute bottom-0 left-0 h-1 ${
                        toast.type === 'success'
                          ? 'bg-green-400'
                          : toast.type === 'error'
                          ? 'bg-red-400'
                          : toast.type === 'warning'
                          ? 'bg-yellow-400'
                          : 'bg-blue-400'
                      }`}
                      initial={{ width: '100%' }}
                      animate={{ width: '0%' }}
                      transition={{ duration: toast.duration / 1000, ease: 'linear' }}
                    />
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
