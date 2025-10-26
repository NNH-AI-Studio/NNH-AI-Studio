import { ReactNode, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export default function AccessibleModal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-2xl',
}: AccessibleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useFocusTrap(isOpen, modalRef, {
    initialFocus: closeButtonRef,
    onEscape: onClose,
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className={`bg-black rounded-xl border border-neon-orange shadow-neon-orange w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
          >
            <div className="sticky top-0 bg-black border-b border-neon-orange shadow-neon-orange px-6 py-4 flex items-center justify-between z-10">
              <h3 id="modal-title" className="text-xl font-semibold text-white">{title}</h3>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="p-2 hover:bg-nnh-orange/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-neon-orange focus:ring-offset-2 focus:ring-offset-black"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
