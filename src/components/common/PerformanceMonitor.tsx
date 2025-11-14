import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Activity, Cpu, HardDrive, Zap, TrendingUp, TrendingDown } from 'lucide-react';

// 性能指标接口
interface PerformanceMetrics {
  fps: number;
  memory: {
    used: number;
    total: number;
    limit: number;
  };
  renderTime: number;
  componentRenders: Record<string, number>;
  networkRequests: {
    total: number;
    pending: number;
    failed: number;
  };
  timestamp: number;
}

// 性能监控组件
export function PerformanceMonitor({ enabled = false }: { enabled?: boolean }) {
  const [isVisible, setIsVisible] = useState(enabled);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const renderCountRef = useRef<Record<string, number>>({});

  // FPS计算
  useEffect(() => {
    let animationId: number;
    
    const calculateFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();
      const delta = currentTime - lastTime.current;
      
      if (delta >= 1000) {
        const currentFps = Math.round((frameCount.current * 1000) / delta);
        setFps(currentFps);
        frameCount.current = 0;
        lastTime.current = currentTime;
      }
      
      animationId = requestAnimationFrame(calculateFPS);
    };
    
    if (isVisible) {
      animationId = requestAnimationFrame(calculateFPS);
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isVisible]);

  // 收集性能指标
  useEffect(() => {
    if (!isVisible) return;

    const collectMetrics = () => {
      const memoryInfo = (performance as any).memory;
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const newMetrics: PerformanceMetrics = {
        fps,
        memory: memoryInfo ? {
          used: memoryInfo.usedJSHeapSize,
          total: memoryInfo.totalJSHeapSize,
          limit: memoryInfo.jsHeapSizeLimit,
        } : { used: 0, total: 0, limit: 0 },
        renderTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
        componentRenders: renderCountRef.current,
        networkRequests: {
          total: 0, // 这里可以通过拦截器获取
          pending: 0,
          failed: 0,
        },
        timestamp: Date.now(),
      };
      
      setMetrics(newMetrics);
    };

    const interval = setInterval(collectMetrics, 2000);
    return () => clearInterval(interval);
  }, [isVisible, fps]);

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-40"
        onClick={() => setIsVisible(true)}
      >
        <Activity className="w-4 h-4 mr-2" />
        性能监控
      </Button>
    );
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getFpsStatus = (fps: number) => {
    if (fps >= 50) return { label: '优秀', color: 'text-green-600', icon: TrendingUp };
    if (fps >= 30) return { label: '良好', color: 'text-yellow-600', icon: TrendingUp };
    return { label: '较差', color: 'text-red-600', icon: TrendingDown };
  };

  const getMemoryStatus = (used: number, total: number) => {
    const usage = (used / total) * 100;
    if (usage < 50) return { label: '正常', color: 'text-green-600' };
    if (usage < 80) return { label: '警告', color: 'text-yellow-600' };
    return { label: '危险', color: 'text-red-600' };
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 w-96 max-h-[80vh] overflow-auto">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              性能监控面板
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {metrics ? (
            <>
              {/* FPS 指标 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">帧率 (FPS)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{metrics.fps}</span>
                    <Badge 
                      variant="outline" 
                      className={getFpsStatus(metrics.fps).color}
                    >
                      {getFpsStatus(metrics.fps).label}
                    </Badge>
                  </div>
                </div>
                <Progress 
                  value={Math.min(100, (metrics.fps / 60) * 100)} 
                  className="h-2"
                />
              </div>

              {/* 内存使用 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">内存使用</span>
                  </div>
                  <Badge 
                    variant="outline"
                    className={getMemoryStatus(metrics.memory.used, metrics.memory.total).color}
                  >
                    {getMemoryStatus(metrics.memory.used, metrics.memory.total).label}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>使用: {formatBytes(metrics.memory.used)}</span>
                    <span>总计: {formatBytes(metrics.memory.total)}</span>
                  </div>
                  <Progress 
                    value={(metrics.memory.used / metrics.memory.total) * 100} 
                    className="h-2"
                  />
                </div>
              </div>

              {/* 渲染时间 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">渲染时间</span>
                  </div>
                  <span className="text-sm font-mono">
                    {metrics.renderTime.toFixed(2)}ms
                  </span>
                </div>
              </div>

              {/* 网络请求 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium">网络请求</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-bold text-blue-600">{metrics.networkRequests.total}</div>
                    <div className="text-muted-foreground">总计</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-yellow-600">{metrics.networkRequests.pending}</div>
                    <div className="text-muted-foreground">进行中</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-red-600">{metrics.networkRequests.failed}</div>
                    <div className="text-muted-foreground">失败</div>
                  </div>
                </div>
              </div>

              {/* 组件渲染统计 */}
              {Object.keys(metrics.componentRenders).length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">组件渲染次数</div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {Object.entries(metrics.componentRenders)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([component, count]) => (
                        <div key={component} className="flex justify-between text-xs">
                          <span className="text-muted-foreground truncate max-w-[200px]">
                            {component}
                          </span>
                          <span className="font-mono">{count}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* 更新时间 */}
              <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                更新时间: {new Date(metrics.timestamp).toLocaleTimeString()}
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Activity className="w-8 h-8 mx-auto mb-2 animate-spin" />
              加载性能数据...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// 性能监控Hook
export function usePerformanceTracker(componentName: string) {
  const renderCount = useRef(0);
  const renderTimes = useRef<number[]>([]);

  useEffect(() => {
    renderCount.current++;
    const renderStart = performance.now();
    
    return () => {
      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStart;
      renderTimes.current.push(renderTime);
      
      // 只保留最近50次的渲染时间
      if (renderTimes.current.length > 50) {
        renderTimes.current.shift();
      }
    };
  });

  const getStats = () => ({
    renderCount: renderCount.current,
    averageRenderTime: renderTimes.current.length > 0
      ? renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length
      : 0,
    lastRenderTime: renderTimes.current[renderTimes.current.length - 1] || 0,
  });

  return {
    componentName,
    ...getStats(),
  };
}

// 性能警告Hook
export function usePerformanceWarnings() {
  const [warnings, setWarnings] = useState<string[]>([]);

  const checkPerformance = (metrics: PerformanceMetrics) => {
    const newWarnings: string[] = [];

    // FPS检查
    if (metrics.fps < 30) {
      newWarnings.push('帧率过低，可能影响用户体验');
    }

    // 内存检查
    const memoryUsage = (metrics.memory.used / metrics.memory.total) * 100;
    if (memoryUsage > 80) {
      newWarnings.push('内存使用率过高，可能导致页面崩溃');
    }

    // 渲染时间检查
    if (metrics.renderTime > 100) {
      newWarnings.push('渲染时间过长，建议优化组件');
    }

    setWarnings(newWarnings);
  };

  return { warnings, checkPerformance };
}