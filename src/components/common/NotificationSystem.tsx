import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../ui/utils';

// 通知类型定义
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: number;
}

// 通知上下文
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

// 通知提供者组件
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).slice(2, 11);
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
      duration: notification.duration ?? 5000,
    };

    setNotifications(prev => [...prev, newNotification]);

    // 自动移除通知
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
      }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

// 使用通知的Hook
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// 快捷通知方法
export function useNotificationHelpers() {
  const { addNotification } = useNotifications();

  return {
    success: (title: string, message?: string, options?: Partial<Notification>) =>
      addNotification({ 
        type: 'success', 
        title, 
        ...(message !== undefined && { message }), 
        ...options 
      }),
    
    error: (title: string, message?: string, options?: Partial<Notification>) =>
      addNotification({ 
        type: 'error', 
        title, 
        ...(message !== undefined && { message }), 
        duration: 0, 
        ...options 
      }),
    
    warning: (title: string, message?: string, options?: Partial<Notification>) =>
      addNotification({ 
        type: 'warning', 
        title, 
        ...(message !== undefined && { message }), 
        ...options 
      }),
    
    info: (title: string, message?: string, options?: Partial<Notification>) =>
      addNotification({ 
        type: 'info', 
        title, 
        ...(message !== undefined && { message }), 
        ...options 
      }),
  };
}

// 通知图标映射
const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

// 通知颜色样式
const styleMap = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

// 单个通知组件
function NotificationItem({ notification, onRemove }: { 
  notification: Notification; 
  onRemove: (id: string) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const Icon = iconMap[notification.type];

  useEffect(() => {
    // 进入动画
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(notification.id), 300);
  };

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-lg border shadow-sm max-w-md w-full',
        'transform transition-all duration-300 ease-in-out',
        styleMap[notification.type],
        isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm leading-tight">{notification.title}</h4>
        {notification.message && (
          <p className="text-sm opacity-90 mt-1 leading-relaxed">
            {notification.message}
          </p>
        )}
        
        {notification.action && (
          <button
            onClick={notification.action.onClick}
            className="text-sm font-medium underline mt-2 hover:no-underline"
          >
            {notification.action.label}
          </button>
        )}
      </div>
      
      <button
        onClick={handleRemove}
        className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// 通知容器组件
function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {notifications.map(notification => (
        <div key={notification.id} className="pointer-events-auto">
          <NotificationItem
            notification={notification}
            onRemove={removeNotification}
          />
        </div>
      ))}
    </div>
  );
}

// 通知位置变体
export const NotificationPositions = {
  'top-right': 'fixed top-4 right-4',
  'top-left': 'fixed top-4 left-4',
  'bottom-right': 'fixed bottom-4 right-4',
  'bottom-left': 'fixed bottom-4 left-4',
  'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2',
  'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2',
} as const;

// 自定义通知容器（支持不同位置）
export function CustomNotificationContainer({ 
  position = 'top-right',
  maxItems = 5 
}: {
  position?: keyof typeof NotificationPositions;
  maxItems?: number;
}) {
  const { notifications, removeNotification } = useNotifications();
  
  const visibleNotifications = notifications.slice(-maxItems);

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className={cn(NotificationPositions[position], 'z-50 space-y-2 pointer-events-none')}>
      {visibleNotifications.map(notification => (
        <div key={notification.id} className="pointer-events-auto">
          <NotificationItem
            notification={notification}
            onRemove={removeNotification}
          />
        </div>
      ))}
    </div>
  );
}