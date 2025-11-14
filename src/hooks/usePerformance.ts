import { useEffect, useRef, useCallback, useMemo, useState } from 'react';

// 防抖Hook
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

// 节流Hook
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCallRef = useRef<number>(0);
  
  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callback(...args);
      }
    },
    [callback, delay]
  ) as T;

  return throttledCallback;
}

// 内存泄漏防护 - 清理异步操作
export function useAsyncCleanup() {
  const mountedRef = useRef(true);
  const promisesRef = useRef<Promise<any>[]>([]);

  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      
      // 取消所有未完成的Promise
      promisesRef.current.forEach(promise => {
        // 这里可以添加Promise取消逻辑
        // 目前只是标记为未挂载状态
      });
      promisesRef.current = [];
    };
  }, []);

  const safeAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>
  ): Promise<T | null> => {
    try {
      const promise = asyncFn();
      promisesRef.current.push(promise);
      const result = await promise;
      
      if (mountedRef.current) {
        return result;
      }
      return null;
    } catch (error) {
      if (mountedRef.current) {
        throw error;
      }
      return null;
    } finally {
      // 从列表中移除已完成的Promise
      promisesRef.current = promisesRef.current.filter(p => p !== promise);
    }
  }, []);

  return { safeAsync, isMounted: () => mountedRef.current };
}

// 虚拟列表Hook（用于大列表优化）
export function useVirtualList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1).map((item, index) => ({
      item,
      index: visibleRange.startIndex + index,
    }));
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;

  const offsetY = visibleRange.startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
  };
}

// 重渲染优化 - 比较对象变化
export function useDeepCompare<T>(value: T): T {
  const ref = useRef<T>(value);
  const signalRef = useRef<number>(0);

  if (!isEqual(value, ref.current)) {
    ref.current = value;
    signalRef.current += 1;
  }

  return useMemo(() => ref.current, [signalRef.current]);
}

// 简单的深度比较函数
function isEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  
  if (obj1 == null || obj2 == null) return false;
  
  if (typeof obj1 !== typeof obj2) return false;
  
  if (typeof obj1 !== 'object') return obj1 === obj2;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!isEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
}

// 组件渲染性能监控
export function useRenderTracker(componentName: string) {
  const renderCountRef = useRef(0);
  const lastRenderRef = useRef<number>(Date.now());

  useEffect(() => {
    renderCountRef.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderRef.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `${componentName} rendered ${renderCountRef.current} times. ` +
        `Time since last render: ${timeSinceLastRender}ms`
      );
    }
    
    lastRenderRef.current = now;
  });

  return renderCountRef.current;
}

// 内存使用监控
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<any>(null);

  useEffect(() => {
    if ('memory' in performance) {
      const updateMemoryInfo = () => {
        setMemoryInfo({
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
        });
      };

      updateMemoryInfo();
      const interval = setInterval(updateMemoryInfo, 5000);

      return () => clearInterval(interval);
    }
  }, []);

  return memoryInfo;
}

// 批量状态更新优化
export function useBatchUpdate<T>(
  initialState: T,
  batchSize: number = 10,
  delay: number = 16 // ~60fps
) {
  const [state, setState] = useState(initialState);
  const pendingUpdatesRef = useRef<Array<(prev: T) => T>>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const batchedSetState = useCallback((updater: (prev: T) => T) => {
    pendingUpdatesRef.current.push(updater);

    if (pendingUpdatesRef.current.length >= batchSize) {
      flushUpdates();
    } else if (!timeoutRef.current) {
      timeoutRef.current = setTimeout(flushUpdates, delay);
    }
  }, [batchSize, delay]);

  const flushUpdates = useCallback(() => {
    if (pendingUpdatesRef.current.length === 0) return;

    setState(currentState => {
      return pendingUpdatesRef.current.reduce(
        (state, updater) => updater(state),
        currentState
      );
    });

    pendingUpdatesRef.current = [];
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, batchedSetState] as const;
}