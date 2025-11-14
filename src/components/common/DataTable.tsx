import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { cn } from '../ui/utils';
import { 
  MoreHorizontal, 
  Loader2 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

// 列配置接口
export interface Column<T = any> {
  key: keyof T;
  title: string;
  width?: string | number;
  sortable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

// 操作配置接口
export interface Action<T = any> {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (record: T, index: number) => void;
  disabled?: (record: T) => boolean;
  danger?: boolean;
  hidden?: (record: T) => boolean;
}

// 表格属性接口
interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  actions?: Action<T>[];
  rowKey?: keyof T | ((record: T) => string);
  selection?: {
    selectedRowKeys: string[];
    onChange: (selectedRowKeys: string[], selectedRows: T[]) => void;
  };
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
    showSizeChanger?: boolean;
  };
  scroll?: {
    x?: number;
    y?: number;
  };
  className?: string;
  emptyText?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  actions,
  rowKey = 'id',
  selection,
  pagination,
  scroll,
  className,
  emptyText = '暂无数据',
}: DataTableProps<T>) {
  // 获取行唯一标识
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return String(record[rowKey] ?? index);
  };

  // 处理选择
  const handleSelectRow = (checked: boolean, record: T, index: number) => {
    if (!selection) return;
    
    const rowKey = getRowKey(record, index);
    const newSelectedKeys = checked
      ? [...selection.selectedRowKeys, rowKey]
      : selection.selectedRowKeys.filter(key => key !== rowKey);
    
    const selectedRows = data.filter((record, i) => 
      newSelectedKeys.includes(getRowKey(record, i))
    );
    
    selection.onChange(newSelectedKeys, selectedRows);
  };

  // 处理全选
  const handleSelectAll = (checked: boolean) => {
    if (!selection) return;
    
    const allRowKeys = data.map((record, index) => getRowKey(record, index));
    const newSelectedKeys = checked ? allRowKeys : [];
    
    selection.onChange(newSelectedKeys, checked ? data : []);
  };

  // 是否全选
  const isAllSelected = selection ? 
    data.length > 0 && selection.selectedRowKeys.length === data.length : false;

  // 是否部分选中
  const isIndeterminate = selection ? 
    selection.selectedRowKeys.length > 0 && selection.selectedRowKeys.length < data.length : false;

  return (
    <div className={cn('w-full', className)}>
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
        
        <div className={scroll?.x ? 'overflow-x-auto' : ''}>
          <Table>
            <TableHeader>
              <TableRow>
                {selection && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={(checked) => handleSelectAll(checked === true)}
                      data-indeterminate={isIndeterminate}
                    />
                  </TableHead>
                )}
                
                {columns.map((column) => (
                  <TableHead
                    key={String(column.key)}
                    className={cn(
                      'whitespace-nowrap',
                      column.headerClassName
                    )}
                    style={{ width: column.width }}
                  >
                    {column.title}
                  </TableHead>
                ))}
                
                {actions && actions.length > 0 && (
                  <TableHead className="w-12 text-right">操作</TableHead>
                )}
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      columns.length +
                      (selection ? 1 : 0) +
                      (actions && actions.length > 0 ? 1 : 0)
                    }
                    className="text-center text-muted-foreground py-8"
                  >
                    {emptyText}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((record, index) => {
                  const rowKey = getRowKey(record, index);
                  const isSelected = selection?.selectedRowKeys.includes(rowKey);
                  
                  return (
                    <TableRow
                      key={rowKey}
                      className={cn(
                        'hover:bg-muted/50 transition-colors',
                        isSelected && 'bg-muted'
                      )}
                    >
                      {selection && (
                        <TableCell>
                          <Checkbox
                            checked={isSelected || false}
                            onCheckedChange={(checked) => 
                              handleSelectRow(checked === true, record, index)
                            }
                          />
                        </TableCell>
                      )}
                      
                      {columns.map((column) => {
                        const value = record[column.key];
                        return (
                          <TableCell
                            key={String(column.key)}
                            className={cn(column.className)}
                          >
                            {column.render 
                              ? column.render(value, record, index)
                              : String(value ?? '')
                            }
                          </TableCell>
                        );
                      })}
                      
                      {actions && actions.length > 0 && (
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {actions.map((action) => {
                                if (action.hidden?.(record)) return null;
                                
                                return (
                                  <DropdownMenuItem
                                    key={action.key}
                                    onClick={() => action.onClick(record, index)}
                                    disabled={action.disabled?.(record) || false}
                                    className={cn(
                                      action.danger && 'text-destructive focus:text-destructive'
                                    )}
                                  >
                                    {action.icon}
                                    {action.label}
                                  </DropdownMenuItem>
                                );
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* 分页组件 */}
      {pagination && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            显示 {((pagination.current - 1) * pagination.pageSize) + 1} -{' '}
            {Math.min(pagination.current * pagination.pageSize, pagination.total)} 条，
            共 {pagination.total} 条
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
              disabled={pagination.current === 1}
            >
              上一页
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from(
                { length: Math.min(Math.ceil(pagination.total / pagination.pageSize), 5) },
                (_, i) => {
                  let pageNum;
                  const totalPages = Math.ceil(pagination.total / pagination.pageSize);
                  
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.current <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.current >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = pagination.current - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.current === pageNum ? 'default' : 'outline'}
                      size="sm"
                      className="w-8"
                      onClick={() => pagination.onChange(pageNum, pagination.pageSize)}
                    >
                      {pageNum}
                    </Button>
                  );
                }
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
              disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
            >
              下一页
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}