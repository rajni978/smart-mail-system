import { useEffect } from 'react';
import './Toast.css';

const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => onClose(toast.id), 4500);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      <div className="toast">
        <div className="toast-icon">✉</div>
        <div className="toast-body">
          <div className="toast-title">New message from {toast.sender}</div>
          <div className="toast-text">{toast.subject}</div>
        </div>
        <button className="toast-close" onClick={() => onClose(toast.id)} aria-label="Dismiss">×</button>
      </div>
    </div>
  );
};

export default Toast;
