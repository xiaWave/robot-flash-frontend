import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { FlashTask, FlashTaskStatus } from "../types";

interface TaskState {
  // 任务存储
  tasksById: Record<string, FlashTask>;
  taskIds: string[];
  
  // 当前焦点任务
  focusedTaskId: string | null;
  
  // 过滤和排序
  filters: {
    status?: FlashTaskStatus;
    mode?: FlashTask['mode'];
    search?: string;
  };
  sortBy: 'createdAt' | 'progress' | 'status';
  sortOrder: 'asc' | 'desc';
  
  // 实时更新
  lastUpdateTime: number;
  
  // Actions
  setFocusedTaskId: (taskId: string | null) => void;
  upsertTask: (task: FlashTask) => void;
  removeTask: (taskId: string) => void;
  setTasks: (tasks: FlashTask[]) => void;
  clearTasks: () => void;
  setFilters: (filters: Partial<TaskState['filters']>) => void;
  setSorting: (sortBy: TaskState['sortBy'], sortOrder: TaskState['sortOrder']) => void;
  
  // Selectors
  getTaskById: (taskId: string) => FlashTask | undefined;
  getFilteredTasks: () => FlashTask[];
  getTasksByStatus: (status: FlashTaskStatus) => FlashTask[];
  getFocusedTask: () => FlashTask | undefined;
  getTaskStats: () => {
    total: number;
    pending: number;
    running: number;
    paused: number;
    success: number;
    failed: number;
    cancelled: number;
  };
}

export const useTaskStore = create<TaskState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    tasksById: {},
    taskIds: [],
    focusedTaskId: null,
    filters: {},
    sortBy: 'createdAt',
    sortOrder: 'desc',
    lastUpdateTime: Date.now(),

    // Actions
    setFocusedTaskId: (taskId) => set({ focusedTaskId: taskId }),

    upsertTask: (task) =>
      set((state) => {
        const isNew = !state.tasksById[task.id];
        return {
          tasksById: {
            ...state.tasksById,
            [task.id]: task,
          },
          taskIds: isNew 
            ? [...state.taskIds, task.id]
            : state.taskIds,
          lastUpdateTime: Date.now(),
        };
      }),

    removeTask: (taskId) =>
      set((state) => {
        const newTasksById = { ...state.tasksById };
        delete newTasksById[taskId];
        return {
          tasksById: newTasksById,
          taskIds: state.taskIds.filter(id => id !== taskId),
          focusedTaskId: state.focusedTaskId === taskId ? null : state.focusedTaskId,
          lastUpdateTime: Date.now(),
        };
      }),

    setTasks: (tasks) =>
      set({
        tasksById: tasks.reduce((acc, task) => {
          acc[task.id] = task;
          return acc;
        }, {} as Record<string, FlashTask>),
        taskIds: tasks.map(task => task.id),
        lastUpdateTime: Date.now(),
      }),

    clearTasks: () => ({
      tasksById: {},
      taskIds: [],
      focusedTaskId: null,
      lastUpdateTime: Date.now(),
    }),

    setFilters: (filters) =>
      set((state) => ({
        filters: { ...state.filters, ...filters },
      })),

    setSorting: (sortBy, sortOrder) =>
      set({ sortBy, sortOrder }),

    // Selectors
    getTaskById: (taskId) => get().tasksById[taskId],

    getFilteredTasks: () => {
      const state = get();
      let tasks = state.taskIds.map(id => state.tasksById[id]);

      // Apply filters
      if (state.filters.status) {
        tasks = tasks.filter(task => task.status === state.filters.status);
      }
      if (state.filters.mode) {
        tasks = tasks.filter(task => task.mode === state.filters.mode);
      }
      if (state.filters.search) {
        const search = state.filters.search.toLowerCase();
        tasks = tasks.filter(task => 
          task.deviceIp.toLowerCase().includes(search) ||
          task.deviceUsername.toLowerCase().includes(search) ||
          task.currentStep.toLowerCase().includes(search)
        );
      }

      // Apply sorting
      tasks.sort((a, b) => {
        let aValue: any = a[state.sortBy];
        let bValue: any = b[state.sortBy];
        
        if (state.sortBy === 'createdAt') {
          aValue = new Date(a.startTime).getTime();
          bValue = new Date(b.startTime).getTime();
        }

        if (state.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      return tasks;
    },

    getTasksByStatus: (status) => {
      const state = get();
      return state.taskIds
        .map(id => state.tasksById[id])
        .filter(task => task.status === status);
    },

    getFocusedTask: () => {
      const state = get();
      return state.focusedTaskId ? state.tasksById[state.focusedTaskId] : undefined;
    },

    getTaskStats: () => {
      const state = get();
      const tasks = state.taskIds.map(id => state.tasksById[id]);
      
      return {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        running: tasks.filter(t => t.status === 'running').length,
        paused: tasks.filter(t => t.status === 'paused').length,
        success: tasks.filter(t => t.status === 'success').length,
        failed: tasks.filter(t => t.status === 'failed').length,
        cancelled: tasks.filter(t => t.status === 'cancelled').length,
      };
    },
  }))
);

// 订阅任务更新，用于实时更新UI
export const subscribeToTaskUpdates = (callback: (tasks: FlashTask[]) => void) => {
  return useTaskStore.subscribe(
    (state) => state.taskIds.map(id => state.tasksById[id]),
    callback
  );
};
