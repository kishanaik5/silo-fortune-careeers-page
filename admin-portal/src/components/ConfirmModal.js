import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

/**
 * ConfirmModal — replaces window.confirm()
 *
 * Props:
 *   isOpen      : boolean
 *   title       : string
 *   message     : string
 *   confirmText : string  (default "Confirm")
 *   cancelText  : string  (default "Cancel")
 *   type        : "warning" | "info" | "danger"  (default "warning")
 *   onConfirm   : () => void
 *   onCancel    : () => void
 */
export default function ConfirmModal({
    isOpen,
    title = 'Are you sure?',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning',
    onConfirm,
    onCancel,
}) {
    if (!isOpen) return null;

    const colors = {
        warning: {
            icon: <AlertTriangle size={28} className="text-amber-500" />,
            iconBg: 'bg-amber-50',
            btn: 'bg-amber-500 hover:bg-amber-600 text-white',
        },
        danger: {
            icon: <AlertTriangle size={28} className="text-red-500" />,
            iconBg: 'bg-red-50',
            btn: 'bg-red-500 hover:bg-red-600 text-white',
        },
        info: {
            icon: <Info size={28} className="text-blue-500" />,
            iconBg: 'bg-blue-50',
            btn: 'bg-blue-500 hover:bg-blue-600 text-white',
        },
    };

    const c = colors[type] || colors.warning;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onCancel}
            />
            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 flex flex-col items-center gap-4 animate-fade-in">
                <div className={`p-4 rounded-full ${c.iconBg}`}>
                    {c.icon}
                </div>
                <h2 className="text-lg font-bold text-gray-900 text-center">{title}</h2>
                {message && (
                    <p className="text-sm text-gray-500 text-center leading-relaxed">{message}</p>
                )}
                <div className="flex gap-3 w-full mt-2">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-2.5 rounded-xl font-semibold transition ${c.btn}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
