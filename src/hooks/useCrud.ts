import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PaginationParams, PaginatedResponse } from '../services/types';
import { useErrorHandler } from './useErrorHandler';

// 通用CRUD操作接口
interface CrudApi<T, CreateData = Partial<T>, UpdateData = Partial<T>> {
  getList: (params: PaginationParams) => Promise<PaginatedResponse<T>>;
  getById: (id: string) => Promise<T>;
  create: (data: CreateData) => Promise<T>;
  update: (id: string, data: UpdateData) => Promise<T>;
  delete: (id: string) => Promise<void>;
}

// 通用CRUD hook配置
interface UseCrudConfig<T, CreateData = Partial<T>, UpdateData = Partial<T>> {
  api: CrudApi<T, CreateData, UpdateData>;
  queryKey: string;
  entityName: string;
  onSuccess?: {
    create?: (data: T) => void;
    update?: (data: T) => void;
    delete?: (id: string) => void;
  };
}

// 通用CRUD Hook
export function useCrud<T, CreateData = Partial<T>, UpdateData = Partial<T>>({
  api,
  queryKey,
  entityName,
  onSuccess,
}: UseCrudConfig<T, CreateData, UpdateData>) {
  const { handleError } = useErrorHandler();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<Record<string, any>>({});

  // 列表查询
  const listQuery = useQuery({
    queryKey: [queryKey, { page, pageSize, ...filters }],
    queryFn: () => api.getList({ page, pageSize, ...filters }),
    staleTime: 30_000,
  });

  // 创建
  const createMutation = useMutation({
    mutationFn: (data: CreateData) => api.create(data),
    onSuccess: (data) => {
      toast.success(`${entityName}创建成功`);
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      onSuccess?.create?.(data);
    },
    onError: (error) => {
      handleError(error, `创建${entityName}`);
    },
  });

  // 更新
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateData }) => 
      api.update(id, data),
    onSuccess: (data) => {
      toast.success(`${entityName}更新成功`);
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      onSuccess?.update?.(data);
    },
    onError: (error) => {
      handleError(error, `更新${entityName}`);
    },
  });

  // 删除
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(id),
    onSuccess: (_, id) => {
      toast.success(`${entityName}删除成功`);
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      onSuccess?.delete?.(id);
    },
    onError: (error) => {
      handleError(error, `删除${entityName}`);
    },
  });

  // 详情查询
  const useDetailQuery = (id: string) => {
    return useQuery({
      queryKey: [queryKey, id],
      queryFn: () => api.getById(id),
      enabled: !!id,
      staleTime: 30_000,
    });
  };

  // 操作方法
  const create = useCallback((data: CreateData) => {
    return createMutation.mutateAsync(data);
  }, [createMutation]);

  const update = useCallback((id: string, data: UpdateData) => {
    return updateMutation.mutateAsync({ id, data });
  }, [updateMutation]);

  const deleteItem = useCallback((id: string) => {
    return deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  const refetch = useCallback(() => {
    return listQuery.refetch();
  }, [listQuery]);

  return {
    // 数据状态
    data: listQuery.data?.data || [],
    total: listQuery.data?.total || 0,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    error: listQuery.error,

    // 分页状态
    page,
    pageSize,
    setPage,
    setPageSize,

    // 过滤状态
    filters,
    setFilters,

    // 操作方法
    create,
    update,
    deleteItem,
    refetch,

    // 加载状态
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // 详情查询
    useDetailQuery,
  };
}

// 表单状态管理Hook
export function useCrudForm<T extends Record<string, any>>(
  initialValues: Partial<T> = {}
) {
  const [formData, setFormData] = useState<Partial<T>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  }, [errors]);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field as string]: error }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const resetForm = useCallback((values?: Partial<T>) => {
    setFormData(values || initialValues);
    clearErrors();
    setIsEditing(false);
  }, [initialValues, clearErrors]);

  const validateForm = useCallback((validation: Record<keyof T, (value: any) => string | null>) => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    for (const [field, validator] of Object.entries(validation)) {
      const error = validator(formData[field as keyof T]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [formData]);

  const startEdit = useCallback((data: Partial<T>) => {
    setFormData(data);
    setIsEditing(true);
    clearErrors();
  }, [clearErrors]);

  return {
    // 表单数据
    formData,
    setFormData,
    setFieldValue,
    
    // 错误处理
    errors,
    setFieldError,
    clearErrors,
    
    // 表单状态
    isEditing,
    setIsEditing,
    
    // 操作方法
    resetForm,
    validateForm,
    startEdit,
    
    // 便捷属性
    hasErrors: Object.keys(errors).length > 0,
    isDirty: JSON.stringify(formData) !== JSON.stringify(initialValues),
  };
}