import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast floating container */}
      <div className="fixed top-6 right-6 z-55 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl shadow-xl border text-xs font-bold transition-all duration-355 ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-250 text-emerald-800 animate-in fade-in"
                : toast.type === "error"
                ? "bg-red-55 border-red-200 text-red-800 animate-in fade-in"
                : "bg-teal-50 border-teal-200 text-teal-800 animate-in fade-in"
            }`}
            style={{ animation: "toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === "success" && <CheckCircle className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0" />}
              {toast.type === "error" && <AlertCircle className="h-4.5 w-4.5 text-red-600 flex-shrink-0" />}
              {toast.type === "info" && <Info className="h-4.5 w-4.5 text-teal-600 flex-shrink-0" />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-black/5 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      
      {/* CSS Animation injection */}
      <style>{`
        @keyframes toastSlideIn {
          from {
            transform: translateX(1.5rem);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
