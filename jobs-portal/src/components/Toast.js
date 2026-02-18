import React, { useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

const Toast = ({ message, type = 'error', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    if (!message) return null;

    const getToastClasses = (toastType) => {
        switch (toastType) {
            case 'success':
                return 'bg-emerald-500/95 border-emerald-400 text-white shadow-emerald-500/20';
            case 'error':
                return 'bg-red-500/95 border-red-400 text-white shadow-red-500/20';
            case 'info':
                return 'bg-blue-500/95 border-blue-400 text-white shadow-blue-500/20';
            default:
                return 'bg-gray-800/95 border-gray-700 text-white shadow-gray-500/20';
        }
    };

    const getIcon = (toastType) => {
        switch (toastType) {
            case 'success':
                return <CheckCircle size={20} />;
            case 'error':
                return <AlertCircle size={20} />;
            case 'info':
                return <Info size={20} />;
            default:
                return <AlertCircle size={20} />; // Default to alert for unknown types
        }
    };

    const getTitle = (toastType) => {
        switch (toastType) {
            case 'success':
                return 'Success';
            case 'error':
                return 'Error';
            case 'info':
                return 'Info';
            default:
                return 'Notification';
        }
    };
    return (
        <div className={`fixed top-24 right-5 z-[100] flex items-start gap-4 p-4 rounded-xl border shadow-2xl backdrop-blur-xl animate-slide-in-right max-w-md w-full transition-all duration-300 transform hover:scale-[1.02] ${getToastClasses(type)}`}>
            <div className="mt-0.5">
                {getIcon(type)}
            </div>
            <div className="flex-1">
                <h3 className="font-bold text-lg">
                    {type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Notice'}
                </h3>
                <p className="text-sm opacity-90">{message}</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X size={16} />
            </button>
        </div>
    );
};

export default Toast;
