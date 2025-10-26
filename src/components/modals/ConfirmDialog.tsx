import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  loading = false
}: ConfirmDialogProps) {
  const colors = {
    danger: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/50',
      text: 'text-red-500',
      button: 'bg-red-500 hover:bg-red-600'
    },
    warning: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/50',
      text: 'text-yellow-500',
      button: 'bg-yellow-500 hover:bg-yellow-600'
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/50',
      text: 'text-blue-500',
      button: 'bg-blue-500 hover:bg-blue-600'
    }
  };

  const colorScheme = colors[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-neon-orange shadow-neon-orange rounded-2xl max-w-md w-full p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorScheme.bg} border ${colorScheme.border}`}>
                  <AlertTriangle className={`w-6 h-6 ${colorScheme.text}`} />
                </div>
                <button
                  onClick={onClose}
                  className="text-white/60 hover:text-white transition-colors"
                  disabled={loading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
              <p className="text-white/70 mb-6">{message}</p>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-nnh-orange/10 hover:bg-nnh-orange/20 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className={`flex-1 px-4 py-3 ${colorScheme.button} text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-neon-orange shadow-neon-orange border-t-white rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ConfirmDialog;
