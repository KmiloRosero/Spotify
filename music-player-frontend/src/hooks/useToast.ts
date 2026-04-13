import { useCallback, useMemo, useRef, useState } from 'react';

export interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'error' | 'info';
}

interface UseToastReturn {
  toasts: ToastMessage[];
  showSuccess: (text: string) => void;
  showError: (text: string) => void;
  showInfo: (text: string) => void;
  removeToast: (id: number) => void;
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timersRef = useRef<Map<number, number>>(new Map());
  const sequenceRef = useRef(0);

  const removeToast = useCallback((id: number) => {
    const timer = timersRef.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (text: string, type: ToastMessage['type']) => {
      sequenceRef.current = (sequenceRef.current + 1) % 1000;
      const id = Date.now() * 1000 + sequenceRef.current;
      setToasts((prev) => {
        const next = [...prev, { id, text, type }];
        if (next.length > 3) {
          return next.slice(next.length - 3);
        }
        return next;
      });

      const timer = window.setTimeout(() => removeToast(id), 3000);
      timersRef.current.set(id, timer);
    },
    [removeToast],
  );

  const showSuccess = useCallback((text: string) => addToast(text, 'success'), [addToast]);
  const showError = useCallback((text: string) => addToast(text, 'error'), [addToast]);
  const showInfo = useCallback((text: string) => addToast(text, 'info'), [addToast]);

  return useMemo(
    () => ({ toasts, showSuccess, showError, showInfo, removeToast }),
    [toasts, showSuccess, showError, showInfo, removeToast],
  );
}
