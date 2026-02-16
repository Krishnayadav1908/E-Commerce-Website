import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const ToastContext = createContext({
  addToast: () => {},
});

const buildToast = ({ title, message, variant = "info", duration = 3500 }) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title,
  message,
  variant,
  duration,
});

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback((options) => {
    const toast = buildToast(options);
    setToasts((prev) => [toast, ...prev].slice(0, 4));

    const timer = setTimeout(() => removeToast(toast.id), toast.duration);
    timersRef.current.set(toast.id, timer);

    return toast.id;
  }, [removeToast]);

  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-[90vw] max-w-sm flex-col gap-3 sm:right-6 sm:top-6"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-animate-in pointer-events-auto overflow-hidden rounded-2xl border bg-white/90 shadow-[0_10px_30px_rgba(15,23,42,0.18)] backdrop-blur ${
              toast.variant === "success"
                ? "border-emerald-200"
                : toast.variant === "error"
                ? "border-rose-200"
                : toast.variant === "warning"
                ? "border-amber-200"
                : "border-slate-200"
            }`}
          >
            <div className="flex items-start gap-3 px-4 py-3">
              <div
                className={`mt-1 h-2.5 w-2.5 rounded-full ${
                  toast.variant === "success"
                    ? "bg-emerald-500"
                    : toast.variant === "error"
                    ? "bg-rose-500"
                    : toast.variant === "warning"
                    ? "bg-amber-500"
                    : "bg-slate-400"
                }`}
              />
              <div className="flex-1">
                {toast.title && (
                  <p className="text-sm font-semibold text-slate-900">
                    {toast.title}
                  </p>
                )}
                {toast.message && (
                  <p className="text-xs text-slate-600">{toast.message}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="rounded-full px-2 text-xs font-semibold text-slate-400 transition hover:text-slate-700"
                aria-label="Dismiss notification"
              >
                x
              </button>
            </div>
            <div
              className={`toast-progress ${
                toast.variant === "success"
                  ? "bg-emerald-400"
                  : toast.variant === "error"
                  ? "bg-rose-400"
                  : toast.variant === "warning"
                  ? "bg-amber-400"
                  : "bg-slate-300"
              }`}
              style={{ animationDuration: `${toast.duration}ms` }}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
