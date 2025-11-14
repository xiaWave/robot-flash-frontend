import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // 记录错误到控制台
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // 调用自定义错误处理函数
    this.props.onError?.(error, errorInfo);
    
    // 在生产环境中，可以发送错误报告到监控服务
    if (process.env['NODE_ENV'] === 'production') {
      // 这里可以集成错误监控服务，如 Sentry
      // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined } as unknown as State);
  };

  override render() {
    if (this.state.hasError) {
      // 如果提供了自定义的fallback组件，使用它
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      // 默认的错误UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle className="text-destructive">出现错误</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                抱歉，应用程序遇到了意外错误。请尝试刷新页面或联系技术支持。
              </p>
              
              {process.env['NODE_ENV'] === 'development' && this.state.error && (
                <details className="text-left text-xs bg-muted p-3 rounded-md">
                  <summary className="cursor-pointer font-medium mb-2">错误详情</summary>
                  <pre className="whitespace-pre-wrap text-red-600">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="whitespace-pre-wrap text-red-500 mt-2">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </details>
              )}
              
              <div className="flex gap-2 justify-center">
                <Button onClick={this.handleReset} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重试
                </Button>
                <Button onClick={() => window.location.reload()}>
                  刷新页面
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// 用于特定组件的错误边界Hook
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  const WrappedComponent = (props: T) => {
    const boundaryProps: Props = {
      children: <Component {...props} />,
      ...(fallback !== undefined && { fallback }),
      ...(onError !== undefined && { onError }),
    };

    return <ErrorBoundary {...boundaryProps} />;
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}