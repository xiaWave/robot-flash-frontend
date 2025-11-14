import React, { useEffect } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { NotificationProvider } from './NotificationSystem';
import { PerformanceMonitor } from './PerformanceMonitor';
import { useNotificationHelpers } from './NotificationSystem';

// 全局错误处理器组件
export function GlobalErrorHandler({ children }: { children: React.ReactNode }) {
  const { error } = useNotificationHelpers();

  const handleError = (caughtError: Error, errorInfo: React.ErrorInfo) => {
    console.error('Global error caught:', caughtError, errorInfo);
    
    // 显示用户友好的错误消息
    error(
      '系统错误',
      caughtError.message || '发生了未知错误，请刷新页面重试',
      { duration: 0 } // 不自动消失
    );

    // 在开发环境中显示详细错误
    if (import.meta.env.DEV) {
      console.group('🐛 Debug Information');
      console.error('Error:', caughtError);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  };

  return (
    <ErrorBoundary onError={handleError}>
      {children}
      <PerformanceMonitor enabled={import.meta.env.DEV} />
    </ErrorBoundary>
  );
}



// 网络状态监控
export function NetworkStatusMonitor() {
  const { info, warning } = useNotificationHelpers();

  useEffect(() => {
    const handleOnline = () => {
      info('网络已连接', '您已重新连接到网络');
    };

    const handleOffline = () => {
      warning('网络已断开', '请检查您的网络连接');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 初始网络状态检查
    if (!navigator.onLine) {
      warning('网络已断开', '请检查您的网络连接');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [info, warning]);

  return null;
}

// 页面可见性API处理
export function PageVisibilityHandler({ children }: { children: React.ReactNode }) {
  const { info } = useNotificationHelpers();

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // 页面重新可见时，可以刷新数据
        console.log('Page became visible');
        // TODO: 触发数据刷新
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [info]);

  return <>{children}</>;
}

// 组合所有全局处理器
export function GlobalProviders({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <GlobalErrorHandler>
        <PageVisibilityHandler>
          <NetworkStatusMonitor />
          {children}
        </PageVisibilityHandler>
      </GlobalErrorHandler>
    </NotificationProvider>
  );
}