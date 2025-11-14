import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  resourceTypeApi,
  deviceTypeApi,
  versionApi,
  flashRecordApi,
  taskApi,
} from "../../services/api";
import { PaginationParams } from "../../types";

const QUERY_KEYS = {
  resources: (params: PaginationParams & { category?: string }) => [
    "resources",
    params,
  ],
  deviceTypes: (params: PaginationParams) => ["device-types", params],
  versions: (params: PaginationParams) => ["versions", params],
  flashRecords: (params: PaginationParams) => ["flash-records", params],
  tasks: (params: PaginationParams) => ["tasks", params],
  taskById: (id: string) => ["tasks", id],
};

export const useResourceListQuery = (
  params: PaginationParams & { category?: string }
) => {
  return useQuery({
    queryKey: QUERY_KEYS.resources(params),
    queryFn: () => resourceTypeApi.getList(params),
    staleTime: 30_000,
  });
};

export const useCreateResourceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resourceTypeApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });
};

export const useDeviceListQuery = (params: PaginationParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.deviceTypes(params),
    queryFn: () => deviceTypeApi.getList(params),
    staleTime: 30_000,
  });
};

export const useVersionListQuery = (params: PaginationParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.versions(params),
    queryFn: () => versionApi.getList(params),
    staleTime: 30_000,
  });
};

export const useFlashRecordQuery = (params: PaginationParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.flashRecords(params),
    queryFn: () => flashRecordApi.getList(params),
    staleTime: 30_000,
  });
};

export const useTaskListQuery = (params: PaginationParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.tasks(params),
    queryFn: () => taskApi.getList(params),
    staleTime: 5_000,
  });
};

export const useTaskByIdQuery = (taskId: string | null) => {
  return useQuery({
    enabled: Boolean(taskId),
    queryKey: QUERY_KEYS.taskById(taskId ?? "placeholder"),
    queryFn: () => (taskId ? taskApi.getById(taskId) : Promise.resolve(null)),
  });
};

export type ResourceListResponse = Awaited<
  ReturnType<typeof resourceTypeApi.getList>
>;
export type DeviceListResponse = Awaited<
  ReturnType<typeof deviceTypeApi.getList>
>;
export type VersionListResponse = Awaited<
  ReturnType<typeof versionApi.getList>
>;
export type FlashRecordListResponse = Awaited<
  ReturnType<typeof flashRecordApi.getList>
>;
export type TaskListResponse = Awaited<
  ReturnType<typeof taskApi.getList>
>;
