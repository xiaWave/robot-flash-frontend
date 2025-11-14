import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../ui/utils';

// 基础加载动画组件
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <Loader2 
      className={cn('animate-spin text-primary', sizeClasses[size], className)} 
    />
  );
}

// 带文字的加载组件
interface LoadingTextProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingText({ 
  text = '加载中...', 
  size = 'md', 
  className 
}: LoadingTextProps) {
  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <LoadingSpinner size={size} />
      <span className={cn('text-muted-foreground', textSizes[size])}>
        {text}
      </span>
    </div>
  );
}

// 全屏加载组件
interface FullScreenLoadingProps {
  text?: string;
  subtitle?: string;
}

export function FullScreenLoading({ 
  text = '加载中', 
  subtitle 
}: FullScreenLoadingProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" className="mx-auto" />
        <div className="space-y-2">
          <h3 className="text-lg font-medium">{text}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// 骨架屏组件
interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export function Skeleton({ className, children, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    >
      {children}
    </div>
  );
}

// 卡片骨架屏
export function CardSkeleton() {
  return (
    <div className="border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-3 w-1/6" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

// 表格骨架屏
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* 表头 */}
      <div className="border-b border-border bg-muted/50 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4" />
          ))}
        </div>
      </div>
      
      {/* 表格行 */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="border-b border-border last:border-b-0 p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// 列表骨架屏
interface ListSkeletonProps {
  items?: number;
}

export function ListSkeleton({ items = 3 }: ListSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// 页面内容骨架屏
export function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      
      {/* 操作栏 */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* 内容区域 */}
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

// 进度条加载组件
interface ProgressLoadingProps {
  progress?: number;
  text?: string;
  showPercentage?: boolean;
}

export function ProgressLoading({ 
  progress = 0, 
  text = '处理中', 
  showPercentage = true 
}: ProgressLoadingProps) {
  return (
    <div className="space-y-2">
      {text && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">{text}</span>
          {showPercentage && (
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-secondary rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}