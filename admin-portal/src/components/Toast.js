import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

/**
 * Toast — replaces alert()
 *
 * Props:
 *   isOpen   : boolean
 *   message  : string
 *   type     : "success" | "error" | "info"  (default "success")
 *   onClose  : () => void
 *   duration : number in ms (default 3000, 0 = no auto-close)
 */
export default function Toast({ isOpen, message, type = 'success', onClose, duration = 3000 }) {
    useEffect(() => {
        if (isOpen && duration > 0) {
            const t = setTimeout(onClose, duration);
            return () => clearTimeout(t);
        }
    }, [isOpen, duration, onClose]);

    if (!isOpen) return null;

    const styles = {
        success: {
            icon: <CheckCircle size={20} className="text-emerald-500 shrink-0" />,
            bar: 'bg-emerald-500',
            border: 'border-emerald-100',
        },
        error: {
            icon: <XCircle size={20} className="text-red-500 shrink-0" />,
            bar: 'bg-red-500',
            border: 'border-red-100',
        },
        info: {
            icon: <AlertCircle size={20} className="text-blue-500 shrink-0" />,
            bar: 'bg-blue-500',
            border: 'border-blue-100',
        },
    };

    const s = styles[type] || styles.success;

    return (
        <div className="fixed top-6 right-6 z-50 animate-slide-in">
            <div className={`bg-white border ${s.border} rounded-2xl shadow-xl flex items-start gap-3 p-4 min-w-[280px] max-w-sm`}>
                {s.icon}
                <p className="text-sm text-gray-700 font-medium flex-1 leading-snug">{message}</p>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition mt-0.5">
                    <X size={16} />
                </button>
            </div>
            {/* Progress bar */}
            {duration > 0 && (
                <div className="h-1 rounded-full mt-1 overflow-hidden bg-gray-100">
                    <div
                        className={`h-full ${s.bar} rounded-full`}
                        style={{ animation: `shrink ${duration}ms linear forwards` }}
                    />
                </div>
            )}
        </div>
    );
}
