import { useState, useEffect } from 'react';
import { registerToastSetter } from '../utils/toast.js';

const TYPE_STYLES = {
  success: { background: '#2c2416', icon: '✓' },
  error:   { background: '#8b1c1c', icon: '✕' },
  info:    { background: '#3d5429', icon: 'ℹ' },
};

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    registerToastSetter((toast) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 3200);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 28,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 400,
      display: 'flex',
      flexDirection: 'column-reverse',
      gap: 8,
      alignItems: 'center',
      pointerEvents: 'none',
    }}>
      {toasts.map(toast => {
        const style = TYPE_STYLES[toast.type] || TYPE_STYLES.success;
        return (
          <div
            key={toast.id}
            className="fade-in"
            style={{
              background: style.background,
              color: '#faf7f0',
              padding: '10px 20px',
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 500,
              boxShadow: '0 4px 20px rgba(44,36,22,0.3)',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 12, opacity: 0.8 }}>{style.icon}</span>
            {toast.message}
          </div>
        );
      })}
    </div>
  );
}
