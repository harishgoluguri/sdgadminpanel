import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';
import { ToastMessage } from '../../types';

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-6 right-1/2 translate-x-1/2 sm:right-6 sm:translate-x-0 z-[100] flex flex-col space-y-3 pointer-events-none items-center sm:items-end">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; removeToast: (id: string) => void }> = ({ toast, removeToast }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  const variants = {
    initial: { opacity: 0, y: -20, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle className="text-green-500 fill-current" size={18} />;
      case 'error': return <AlertCircle className="text-red-500 fill-current" size={18} />;
      default: return <Info className="text-blue-500 fill-current" size={18} />;
    }
  };

  return (
    <motion.div
      layout
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      onClick={() => removeToast(toast.id)}
      className="pointer-events-auto min-w-[320px] rounded-2xl p-4 flex items-center space-x-3 cursor-pointer
        bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/10
        shadow-lg shadow-black/5 hover:shadow-xl transition-shadow"
    >
      <div className="flex-shrink-0 bg-white dark:bg-white/10 rounded-full p-1">
        {getIcon()}
      </div>
      <div className="flex-1">
        <p className="text-[15px] font-medium text-gray-900 dark:text-white">{toast.message}</p>
      </div>
    </motion.div>
  );
};