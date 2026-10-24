import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
const ToastContext = createContext(null);
const icons = { success: CheckCircle2, error: AlertCircle, info: Info };
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);
  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const notify = useCallback((message, type = 'info') => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);
  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toasts.map((t) => { const Icon = icons[t.type]; return (
          <div key={t.id} className={`toast toast--${t.type}`}><Icon size={18} aria-hidden="true" /><span>{t.message}</span>
            <button className="icon-btn" onClick={() => dismiss(t.id)} aria-label="Dismiss notification"><X size={16} /></button></div>); })}
      </div>
    </ToastContext.Provider>
  );
}
export const useToast = () => useContext(ToastContext);
