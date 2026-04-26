import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmationModal({ 
    isOpen, 
    title, 
    message, 
    onConfirm, 
    onCancel, 
    confirmText = 'Confirm', 
    cancelText = 'Cancel',
    type = 'info'
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    const colors = {
        danger: 'bg-rose-500 hover:bg-rose-600 shadow-rose-200',
        warning: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200',
        info: 'bg-primary hover:bg-primary-dark shadow-primary/20'
    };

    const icons = {
        danger: 'delete_forever',
        warning: 'warning',
        info: 'help'
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
                <div className="p-8 pb-4 text-center">
                    <div className={`size-16 mx-auto mb-6 flex items-center justify-center rounded-2xl ${type === 'danger' ? 'bg-rose-50' : type === 'warning' ? 'bg-amber-50' : 'bg-primary/5'}`}>
                        <span className={`material-symbols-outlined text-[32px] ${type === 'danger' ? 'text-rose-500' : type === 'warning' ? 'text-amber-500' : 'text-primary'}`}>
                            {icons[type]}
                        </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight mb-2">{title}</h3>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed px-4">{message}</p>
                </div>
                
                <div className="p-8 pt-6 flex gap-3">
                    <button 
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 text-[13px] font-bold text-slate-400 hover:bg-slate-50 rounded-xl transition-all"
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-3 text-[13px] font-black text-white rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-widest ${colors[type]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
