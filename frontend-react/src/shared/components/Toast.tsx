import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, 5000);
        return () => clearTimeout(timer);
    }, [id, onClose]);

    const styles = {
        success: 'bg-green-50 text-green-800 border-green-200',
        error: 'bg-red-50 text-red-800 border-red-200',
        info: 'bg-blue-50 text-blue-800 border-blue-200',
        warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    };

    const icons = {
        success: '✅ ',
        error: '❌ ',
        info: 'ℹ️ ',
        warning: '⚠️ ',
    };

    return (
        <div className={`flex items-center p-4 mb-3 rounded-lg border shadow-sm animate-slide-up ${styles[type]} min-w-[300px]`}>
            <span className="mr-3 text-xl">{icons[type]}</span>
            <div className="text-sm font-medium">{message}</div>
            <button onClick={() => onClose(id)} className="ml-auto text-gray-400 hover:text-gray-600">
                &times;
            </button>
        </div>
    );
};

export default Toast;
