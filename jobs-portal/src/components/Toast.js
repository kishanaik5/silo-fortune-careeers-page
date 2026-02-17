import React, { useEffect } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

const Toast = ({ message, type = 'error', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    if (!message) return null;

    const isError = type === 'error';

    return (
        <div className={`fixed top-24 right-5 z-[100] flex items-start gap-4 p-4 rounded-xl border shadow-2xl backdrop-blur-xl animate-slide-in-right max-w-md w-full transition-all duration-300 transform hover:scale-[1.02] ${isError
            ? 'bg-red-500/95 border-red-400 text-white shadow-red-500/20'
            : 'bg-emerald-500/95 border-emerald-400 text-white shadow-emerald-500/20'
            }`}>
            <div className="mt-0.5">
                {isError ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-sm mb-1">{isError ? 'Error' : 'Success'}</h4>
                <p className="text-sm opacity-90">{message}</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X size={16} />
            </button>
        </div>
    );
};

export default Toast;
