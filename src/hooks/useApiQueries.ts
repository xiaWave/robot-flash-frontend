import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { PaginationParams } from '../services/types';
import * as api from '../services/api';

// 查询键配置
export const QUERY_KEYS = {
  // 认证
  currentUser: ['currentUser'],
  
  // 设备类型
  deviceTypes: (params: PaginationParams) => ['deviceTypes', params],
  deviceType: (id: string) => ['deviceTypes', id],
  
  // 资源类型
  resourceTypes: (params: PaginationParams) => ['resourceTypes', params],
  resourceType: (id: string) => ['resourceTypes', id],
  
  // 版本
  versions: (params: PaginationParams) => ['versions', params],
  version: (id: string) => ['versions', id],
  
  // 刷机记录
  flashRecords: (params: PaginationParams) => ['flashRecords', params],
  flashRecord: (id: string) => ['flashRecords', id],
  
  // 任务
  tasks: (params: PaginationParams) => ['tasks', params],
  task: (id: string) => ['tasks', id],
} as const;

// 设备类型查询
export const useDeviceTypesQuery = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.deviceTypes(params),
    queryFn: () => api.deviceTypeApi.getList(params),
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000, // 5分钟
  });
};

export const useDeviceTypeQuery = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.deviceType(id),
    queryFn: () => api.deviceTypeApi.getById(id),
    enabled: !!id,
    staleTime: 30_000,
  });
};

// 资源类型查询
export const useResourceTypesQuery = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.resourceTypes(params),
    queryFn: () => api.resourceTypeApi.getList(params),
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useResourceTypeQuery = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.resourceType(id),
    queryFn: () => api.resourceTypeApi.getById(id),
    enabled: !!id,
    staleTime: 30_000,
  });
};

// 版本查询
export const useVersionsQuery = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.versions(params),
    queryFn: () => api.versionApi.getList(params),
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useVersionQuery = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.version(id),
    queryFn: () => api.versionApi.getById(id),
    enabled: !!id,
    staleTime: 30_000,
  });
};

// 刷机记录查询
export const useFlashRecordsQuery = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.flashRecords(params),
    queryFn: () => api.flashRecordApi.getList(params),
    staleTime: 10_000, // 刷机记录变化较快，缩短缓存时间
    gcTime: 2 * 60 * 1000,
  });
};

export const useFlashRecordQuery = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.flashRecord(id),
    queryFn: () => api.flashRecordApi.getById(id),
    enabled: !!id,
    staleTime: 10_000,
  });
};

// 任务查询
export const useTasksQuery = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.tasks(params),
    queryFn: () => api.taskApi.getList(params),
    staleTime: 5_000, // 任务状态变化很快，使用更短的缓存时间
    gcTime: 1 * 60 * 1000,

  });
};

export const useTaskQuery = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.task(id),
    queryFn: () => api.taskApi.getById(id),
    enabled: !!id,
    staleTime: 5_000,

  });
};

// 当前用户查询
export const useCurrentUserQuery = () => {
  return useQuery({
    queryKey: QUERY_KEYS.currentUser,
    queryFn: () => api.authApi.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 用户信息缓存5分钟
    retry: 1,
  });
};

// 通用预加载Hook
export const usePrefetchQueries = () => {
  const queryClient = useQueryClient();

  const prefetchDeviceTypes = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.deviceTypes({ page: 1, pageSize: 100 }),
      queryFn: () => api.deviceTypeApi.getList({ page: 1, pageSize: 100 }),
      staleTime: 30_000,
    });
  }, [queryClient]);

  const prefetchVersions = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.versions({ page: 1, pageSize: 100 }),
      queryFn: () => api.versionApi.getList({ page: 1, pageSize: 100 }),
      staleTime: 30_000,
    });
  }, [queryClient]);

  const prefetchResourceTypes = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.resourceTypes({ page: 1, pageSize: 100 }),
      queryFn: () => api.resourceTypeApi.getList({ page: 1, pageSize: 100 }),
      staleTime: 30_000,
    });
  }, [queryClient]);

  const prefetchTasks = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.tasks({ page: 1, pageSize: 20 }),
      queryFn: () => api.taskApi.getList({ page: 1, pageSize: 20 }),
      staleTime: 5_000,
    });
  }, [queryClient]);

  return {
    prefetchDeviceTypes,
    prefetchVersions,
    prefetchResourceTypes,
    prefetchTasks,
  };
};

// 通用失效Hook
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();

  const invalidateDeviceTypes = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['deviceTypes'] });
  }, [queryClient]);

  const invalidateVersions = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['versions'] });
  }, [queryClient]);

  const invalidateResourceTypes = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['resourceTypes'] });
  }, [queryClient]);

  const invalidateFlashRecords = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['flashRecords'] });
  }, [queryClient]);

  const invalidateTasks = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  }, [queryClient]);

  return {
    invalidateDeviceTypes,
    invalidateVersions,
    invalidateResourceTypes,
    invalidateFlashRecords,
    invalidateTasks,
  };
};