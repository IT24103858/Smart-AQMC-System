import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
    id: string;
    message: string;
    type: NotificationType;
}

interface NotificationContextType {
    showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = useCallback((message: string, type: NotificationType = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setNotifications((prev) => [...prev, { id, message, type }]);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 4000);
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}

            {/* Notification Container */}
            <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                {notifications.map((n) => (
                    <div
                        key={n.id}
                        className={`
              flex items-center gap-3 px-5 py-4 min-w-[320px] max-w-[400px]
              rounded-[20px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)]
              border pointer-events-auto
              animate-in slide-in-from-right-10 fade-in duration-300
              ${n.type === 'success' ? 'bg-emerald-500 border-emerald-400' : 'bg-white border-slate-100'}
            `}
                    >
                        <div className={`
              size-10 rounded-full flex items-center justify-center shrink-0
              ${n.type === 'success' ? 'bg-white/20 text-white' : ''}
              ${n.type === 'error' ? 'bg-rose-50 text-rose-500' : ''}
              ${n.type === 'info' ? 'bg-sky-50 text-sky-500' : ''}
            `}>
                            <span className="material-symbols-outlined text-[20px]">
                                {n.type === 'success' ? 'check_circle' : n.type === 'error' ? 'error' : 'info'}
                            </span>
                        </div>

                        <div className="flex flex-col">
                            <span className={`text-[14px] font-bold leading-tight ${n.type === 'success' ? 'text-white' : 'text-slate-800'}`}>
                                {n.type === 'success' ? 'Action Successful' : n.type === 'error' ? 'Action Failed' : 'Notification'}
                            </span>
                            <span className={`text-[12px] font-medium mt-0.5 ${n.type === 'success' ? 'text-emerald-50' : 'text-slate-400'}`}>
                                {n.message}
                            </span>
                        </div>

                        <button
                            onClick={() => setNotifications(prev => prev.filter(item => item.id !== n.id))}
                            className={`ml-auto size-8 flex items-center justify-center rounded-full transition-all ${n.type === 'success' ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-50 text-slate-300'}`}
                        >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};
