import { FlashTask } from '../types';

class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectTimer: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private readonly url = "wss://example.com/ws";

  connect() {
    if (this.ws) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
      };
      this.ws.onclose = () => {
        this.scheduleReconnect();
      };
      this.ws.onerror = () => {
        this.ws?.close();
      };
      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.emit(message.event, message.payload);
      };
    } catch (error) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    this.ws = null;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }
    this.reconnectAttempts += 1;
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 10000);
    this.reconnectTimer = window.setTimeout(() => {
      this.connect();
    }, delay);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  emit(event: string, data: any) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  send(event: string, data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, payload: data }));
    } else {
      this.scheduleReconnect();
    }
  }
}

export const wsService = new WebSocketService();

export const taskWebSocket = {
  subscribeToTask: (taskId: string, callback: (task: FlashTask) => void) => {
    wsService.on(`task:${taskId}:update`, callback);
  },

  unsubscribeFromTask: (taskId: string, callback: (task: FlashTask) => void) => {
    wsService.off(`task:${taskId}:update`, callback);
  },

  subscribeToAllTasks: (callback: (tasks: FlashTask[]) => void) => {
    wsService.on('tasks:update', callback);
  },

  unsubscribeFromAllTasks: (callback: (tasks: FlashTask[]) => void) => {
    wsService.off('tasks:update', callback);
  },

  pauseTask: (taskId: string) => {
    wsService.send('task:pause', { taskId });
  },

  resumeTask: (taskId: string) => {
    wsService.send('task:resume', { taskId });
  },

  cancelTask: (taskId: string) => {
    wsService.send('task:cancel', { taskId });
  },

  simulateTaskProgress: (taskId: string, task: FlashTask) => {
    wsService.emit(`task:${taskId}:update`, task);
  },
};