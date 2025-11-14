import React, { memo, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { cn } from '../ui/utils';

// 列表项组件接口
interface ListItemProps<T = any> {
  index: number;
  style: React.CSSProperties;
  data: {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    itemHeight: number;
  };
}

// 虚拟化列表项组件
const ListItem = memo<T>(({ index, style, data }: ListItemProps<T>) => {
  const { items, renderItem } = data;
  const item = items[index];

  return (
    <div style={style} className={cn('border-b border-border last:border-b-0')}>
      {renderItem(item, index)}
    </div>
  );
}) as <T>(props: ListItemProps<T>) => React.ReactElement;

// 虚拟化列表组件接口
interface VirtualListProps<T = any> {
  items: T[];
  itemHeight: number;
  height: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscanCount?: number;
  onScroll?: (scrollOffset: number) => void;
}

// 虚拟化列表组件
export function VirtualList<T>({
  items,
  itemHeight,
  height,
  renderItem,
  className,
  overscanCount = 5,
  onScroll,
}: VirtualListProps<T>) {
  const itemData = useMemo(
    () => ({
      items,
      renderItem,
      itemHeight,
    }),
    [items, renderItem, itemHeight]
  );

  const handleScroll = useMemo(
    () => ({ scrollOffset }: { scrollOffset: number }) => {
      onScroll?.(scrollOffset);
    },
    [onScroll]
  );

  return (
    <div className={cn('border border-border rounded-md', className)}>
      <List
        height={height}
        itemCount={items.length}
        itemSize={itemHeight}
        itemData={itemData}
        overscanCount={overscanCount}
        onScroll={handleScroll}
      >
        {ListItem}
      </List>
    </div>
  );
}

// 分页虚拟列表组件接口
interface PaginatedVirtualListProps<T = any> extends Omit<VirtualListProps<T>, 'items'> {
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
}

// 分页虚拟列表组件
export function PaginatedVirtualList<T>({
  currentPage,
  pageSize,
  total,
  onPageChange,
  loading = false,
  loadingComponent,
  ...virtualListProps
}: PaginatedVirtualListProps<T>) {
  const totalPages = Math.ceil(total / pageSize);

  const handlePageChange = useMemo(
    () => (page: number) => {
      if (page >= 1 && page <= totalPages) {
        onPageChange(page);
      }
    },
    [onPageChange, totalPages]
  );

  return (
    <div className="space-y-4">
      <VirtualList {...virtualListProps} />
      
      {/* 分页控制 */}
      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-muted-foreground">
          显示 {((currentPage - 1) * pageSize) + 1} -{' '}
          {Math.min(currentPage * pageSize, total)} 条，共 {total} 条
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border border-border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
          >
            上一页
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from(
              { length: Math.min(totalPages, 5) },
              (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={cn(
                      'w-8 h-8 text-sm border border-border rounded-md',
                      currentPage === pageNum
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    )}
                  >
                    {pageNum}
                  </button>
                );
              }
            )}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-3 py-1 text-sm border border-border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
          >
            下一页
          </button>
        </div>
      </div>
      
      {loading && loadingComponent}
    </div>
  );
}

// 无限滚动列表组件接口
interface InfiniteVirtualListProps<T = any> extends Omit<VirtualListProps<T>, 'items'> {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  loadingComponent?: React.ReactNode;
  endMessage?: React.ReactNode;
}

// 无限滚动列表组件
export function InfiniteVirtualList<T>({
  items,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  loadingComponent,
  endMessage,
  ...virtualListProps
}: InfiniteVirtualListProps<T>) {
  const handleScroll = useMemo(
    () => ({ scrollOffset, scrollDirection, scrollUpdateWasRequested }: any) => {
      // 当滚动到底部附近时加载更多
      if (!scrollUpdateWasRequested && scrollDirection === 'forward') {
        const { height, itemHeight } = virtualListProps;
        const listHeight = items.length * itemHeight;
        
        if (scrollOffset + height >= listHeight - itemHeight * 2) {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }
      }
    },
    [virtualListProps, items.length, hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  return (
    <div className="space-y-4">
      <VirtualList
        items={items}
        {...virtualListProps}
        onScroll={handleScroll}
      />
      
      {isFetchingNextPage && loadingComponent}
      
      {!hasNextPage && items.length > 0 && endMessage}
    </div>
  );
}