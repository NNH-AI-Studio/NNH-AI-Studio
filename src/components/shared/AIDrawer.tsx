import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface AIDrawerProps {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children?: ReactNode;
}

export default function AIDrawer({ isOpen, title = 'AI Assistant', onClose, children }: AIDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50"
        >
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <motion.aside
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="absolute right-0 top-0 h-full w-[380px] md:w-[420px] bg-black border-l border-white/10 shadow-xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-white font-semibold">{title}</h3>
              <button onClick={onClose} className="p-2 rounded hover:bg-white/5">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-56px)]">
              {children}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
