import styles from './Toast.module.css';
import type { ToastMessage } from '../../hooks/useToast';

type Props = {
  toasts: ToastMessage[];
  onRemove: (id: number) => void;
};

function iconForType(type: ToastMessage['type']): string {
  if (type === 'success') return '✅';
  if (type === 'error') return '❌';
  return 'ℹ';
}

export function Toast({ toasts, onRemove }: Props) {
  const ordered = [...toasts].reverse();

  return (
    <div className={styles.container}>
      {ordered.map((t) => {
        const typeClass =
          t.type === 'success' ? styles.success : t.type === 'error' ? styles.error : styles.info;
        return (
          <div
            key={t.id}
            className={`${styles.toast} ${typeClass}`}
          >
            <div className={styles.icon} aria-hidden="true">
              {iconForType(t.type)}
            </div>
            <div className={styles.message}>{t.text}</div>
            <button type="button" className={styles.close} onClick={() => onRemove(t.id)} aria-label="Cerrar">
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
