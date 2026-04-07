import React, { useEffect } from 'react';

const typeStyles = {
    success: {
        bg: 'bg-green-50 border-green-400',
        icon: '✅',
        text: 'text-green-800',
        bar: 'bg-green-400',
    },
    error: {
        bg: 'bg-red-50 border-red-400',
        icon: '❌',
        text: 'text-red-800',
        bar: 'bg-red-400',
    },
    warning: {
        bg: 'bg-amber-50 border-amber-400',
        icon: '⚠️',
        text: 'text-amber-800',
        bar: 'bg-amber-400',
    },
    info: {
        bg: 'bg-blue-50 border-blue-400',
        icon: 'ℹ️',
        text: 'text-blue-800',
        bar: 'bg-blue-400',
    },
};

const ToastItem = ({ toast, onRemove }) => {
    const styles = typeStyles[toast.type] || typeStyles.info;

    return (
        <div
            className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-md animate-slide-down ${styles.bg} min-w-[280px] max-w-sm`}
            role="alert"
        >
            <span className="text-lg mt-0.5 flex-shrink-0">{styles.icon}</span>
            <p className={`flex-1 text-sm font-medium ${styles.text}`}>{toast.message}</p>
            <button
                onClick={() => onRemove(toast.id)}
                className={`flex-shrink-0 text-lg leading-none opacity-60 hover:opacity-100 ${styles.text}`}
                aria-label="Dismiss"
            >
                ×
            </button>
        </div>
    );
};

const ToastContainer = ({ toasts, onRemove }) => {
    if (!toasts || toasts.length === 0) return null;

    return (
        <div
            className="fixed top-4 right-4 z-50 flex flex-col gap-2"
            aria-live="assertive"
            aria-atomic="false"
        >
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
};

export { ToastItem };
export default ToastContainer;
