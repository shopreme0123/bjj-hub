'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Check, X, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // 3秒後に自動で消える
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <Check size={18} />;
      case 'error':
        return <AlertCircle size={18} />;
      case 'info':
        return <Info size={18} />;
    }
  };

  const getStyle = (type: ToastType) => {
    switch (type) {
      case 'success':
        return { bg: 'rgba(34, 197, 94, 0.9)', icon: '#22c55e' };
      case 'error':
        return { bg: 'rgba(239, 68, 68, 0.9)', icon: '#ef4444' };
      case 'info':
        return { bg: 'rgba(59, 130, 246, 0.9)', icon: '#3b82f6' };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* トースト表示エリア */}
      <div className="fixed top-4 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4">
        {toasts.map(toast => {
          const style = getStyle(toast.type);
          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-slide-down max-w-sm w-full"
              style={{ background: style.bg, backdropFilter: 'blur(10px)' }}
            >
              <div className="text-white">
                {getIcon(toast.type)}
              </div>
              <span className="text-white text-sm font-medium flex-1">{toast.message}</span>
              <button 
                onClick={() => removeToast(toast.id)}
                className="text-white/60 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
