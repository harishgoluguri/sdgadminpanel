import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, AlertCircle } from 'lucide-react';

interface LoginViewProps {
  onLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validatePin(pin);
  };

  const validatePin = (inputPin: string) => {
    if (inputPin === '1290') {
      onLogin();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setPin('');
      }, 500);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;
    
    if (value.length <= 4) {
      setPin(value);
      setError(false);
    }
  };
  
  // Auto-submit on 4 digits
  useEffect(() => {
    if (pin.length === 4) {
      validatePin(pin);
    }
  }, [pin]);

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          x: shake ? [0, -10, 10, -10, 10, 0] : 0
        }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-apple-lg p-8 md:p-12 text-center border border-gray-100"
      >
        <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-400 border border-gray-100">
          <Lock size={28} strokeWidth={1.5} />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Admin Access</h1>
        <p className="text-gray-500 mb-10 text-[15px]">Enter your 4-digit PIN to continue</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="relative flex justify-center">
            <input 
              type="password" 
              inputMode="numeric"
              value={pin}
              onChange={handleChange}
              placeholder="••••"
              className="w-48 text-center text-5xl tracking-[0.5em] font-bold py-2 border-b-2 border-gray-200 focus:border-black outline-none transition-colors bg-transparent placeholder-gray-200 text-gray-900"
              autoFocus
            />
          </div>
          
          <div className="h-6">
            {error && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm font-medium flex items-center justify-center gap-2"
              >
                <AlertCircle size={14} />
                Incorrect PIN
              </motion.p>
            )}
          </div>

          <button
            type="submit"
            disabled={pin.length !== 4}
            className="w-full bg-black text-white rounded-xl py-3.5 font-medium text-[15px] hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-black/10"
          >
            Access Dashboard
            <ArrowRight size={16} className="ml-2" />
          </button>
        </form>
      </motion.div>
    </div>
  );
};