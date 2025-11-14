import { apiClient, mockDelay } from '../apiClient';
import { 
  ApiResponse, 
  PaginationParams, 
  PaginatedResponse 
} from '../types';
import {
  DeviceType,
  FlashRecord,
  FlashTask,
  ResourceType,
  User,
  Version,
} from '../../types';

// 认证API
export const authApi = {
  login: async (username: string, password: string): Promise<User> => {
    await mockDelay(500);
    
    // Mock authentication
    if (username === 'admin' && password === 'admin') {
      const user: User = {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      
      // 存储token到localStorage
      localStorage.setItem('auth_token', 'mock-jwt-token');
      
      return user;
    }
    
    throw new Error('用户名或密码错误');
  },

  logout: async (): Promise<void> => {
    await mockDelay(200);
    localStorage.removeItem('auth_token');
  },

  getCurrentUser: async (): Promise<User | null> => {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    
    await mockDelay(200);
    return {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
  },
};

// 设备类型API
export const deviceTypeApi = {
  getList: async ({ page = 1, pageSize = 10 }: PaginationParams): Promise<PaginatedResponse<DeviceType>> => {
    await mockDelay(300);
    
    const mockData: DeviceType[] = [
      { id: '1', name: '工业机器人A', model: 'RB-A1000', manufacturer: 'RobotCorp', createdAt: new Date().toISOString() },
      { id: '2', name: '工业机器人B', model: 'RB-B2000', manufacturer: 'RobotCorp', createdAt: new Date().toISOString() },
      { id: '3', name: '服务机器人C', model: 'SV-C3000', manufacturer: 'ServiceTech', createdAt: new Date().toISOString() },
      { id: '4', name: '协作机器人D', model: 'CO-D4000', manufacturer: 'CoRobot', createdAt: new Date().toISOString() },
      { id: '5', name: '特种机器人E', model: 'SP-E5000', manufacturer: 'SpecialTech', createdAt: new Date().toISOString() },
    ];
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedData = mockData.slice(start, end);
    
    return {
      data: paginatedData,
      total: mockData.length,
      page,
      pageSize,
      totalPages: Math.ceil(mockData.length / pageSize),
    };
  },

  getById: async (id: string): Promise<DeviceType> => {
    await mockDelay(200);
    const mockData = await deviceTypeApi.getList({ page: 1, pageSize: 100 });
    const item = mockData.data.find(item => item.id === id);
    if (!item) throw new Error('设备类型不存在');
    return item;
  },

  create: async (payload: Omit<DeviceType, 'id' | 'createdAt'>): Promise<DeviceType> => {
    await mockDelay(400);
    return {
      id: `device-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
    };
  },

  update: async (id: string, payload: Partial<DeviceType>): Promise<DeviceType> => {
    await mockDelay(400);
    const existing = await deviceTypeApi.getById(id);
    return { ...existing, ...payload };
  },

  delete: async (id: string): Promise<void> => {
    await mockDelay(300);
    // Mock delete
  },
};

// 资源类型API
export const resourceTypeApi = {
  getList: async ({ page = 1, pageSize = 10, category }: PaginationParams): Promise<PaginatedResponse<ResourceType>> => {
    await mockDelay(300);
    
    const mockData: ResourceType[] = [
      { id: '1', name: '控制软件', category: 'software', type: 'control', description: '机器人控制软件', createdAt: new Date().toISOString() },
      { id: '2', name: '监控工具', category: 'software', type: 'monitoring', description: '设备监控工具', createdAt: new Date().toISOString() },
      { id: '3', name: '配置文件', category: 'system', osType: 'Linux', architecture: 'x86_64', description: '系统配置文件', createdAt: new Date().toISOString() },
      { id: '4', name: '固件包', category: 'device', model: 'RB-A1000', manufacturer: 'RobotCorp', description: '设备固件', createdAt: new Date().toISOString() },
      { id: '5', name: '驱动程序', category: 'software', type: 'driver', description: '硬件驱动程序', createdAt: new Date().toISOString() },
    ];
    
    const filtered = category ? mockData.filter(item => item.category === category) : mockData;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedData = filtered.slice(start, end);
    
    return {
      data: paginatedData,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    };
  },

  getById: async (id: string): Promise<ResourceType> => {
    await mockDelay(200);
    const mockData = await resourceTypeApi.getList({ page: 1, pageSize: 100 });
    const item = mockData.data.find(item => item.id === id);
    if (!item) throw new Error('资源类型不存在');
    return item;
  },

  create: async (payload: Omit<ResourceType, 'id' | 'createdAt'>): Promise<ResourceType> => {
    await mockDelay(400);
    return {
      id: `resource-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
    };
  },

  update: async (id: string, payload: Partial<ResourceType>): Promise<ResourceType> => {
    await mockDelay(400);
    const existing = await resourceTypeApi.getById(id);
    return { ...existing, ...payload };
  },

  delete: async (id: string): Promise<void> => {
    await mockDelay(300);
    // Mock delete
  },
};

// 版本管理API
export const versionApi = {
  getList: async ({ page = 1, pageSize = 10 }: PaginationParams): Promise<PaginatedResponse<Version>> => {
    await mockDelay(300);
    
    const mockData: Version[] = [
      { 
        id: '1', 
        versionNumber: 'v1.0.0', 
        releaseDate: '2024-01-15', 
        description: '初始稳定版本', 
        fileSize: '125MB',
        fileName: 'firmware-v1.0.0.bin',
        filePath: '/uploads/firmware-v1.0.0.bin'
      },
      { 
        id: '2', 
        versionNumber: 'v1.1.0', 
        releaseDate: '2024-02-20', 
        description: '性能优化版本，修复了若干bug', 
        fileSize: '128MB',
        fileName: 'firmware-v1.1.0.bin',
        filePath: '/uploads/firmware-v1.1.0.bin'
      },
      { 
        id: '3', 
        versionNumber: 'v2.0.0', 
        releaseDate: '2024-03-10', 
        description: '重大功能更新，新增AI模块', 
        fileSize: '135MB',
        fileName: 'firmware-v2.0.0.bin',
        filePath: '/uploads/firmware-v2.0.0.bin'
      },
      { 
        id: '4', 
        versionNumber: 'v2.1.0', 
        releaseDate: '2024-04-05', 
        description: '安全更新和性能改进', 
        fileSize: '137MB',
        fileName: 'firmware-v2.1.0.bin',
        filePath: '/uploads/firmware-v2.1.0.bin'
      },
    ];
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedData = mockData.slice(start, end);
    
    return {
      data: paginatedData,
      total: mockData.length,
      page,
      pageSize,
      totalPages: Math.ceil(mockData.length / pageSize),
    };
  },

  getById: async (id: string): Promise<Version> => {
    await mockDelay(200);
    const mockData = await versionApi.getList({ page: 1, pageSize: 100 });
    const item = mockData.data.find(item => item.id === id);
    if (!item) throw new Error('版本不存在');
    return item;
  },

  create: async (payload: Omit<Version, 'id'>): Promise<Version> => {
    await mockDelay(400);
    return {
      id: `version-${Date.now()}`,
      ...payload,
    };
  },

  update: async (id: string, payload: Partial<Version>): Promise<Version> => {
    await mockDelay(400);
    const existing = await versionApi.getById(id);
    return { ...existing, ...payload };
  },

  delete: async (id: string): Promise<void> => {
    await mockDelay(300);
    // Mock delete
  },

  upload: async (file: File, metadata: Partial<Version>): Promise<Version> => {
    await mockDelay(2000); // 模拟上传时间
    
    // 模拟上传进度
    const progress = Array.from({ length: 10 }, (_, i) => i * 10);
    for (const p of progress) {
      await new Promise(resolve => setTimeout(resolve, 200));
      // 这里可以触发进度更新事件
    }
    
    return {
      id: `version-${Date.now()}`,
      versionNumber: metadata.versionNumber || 'v1.0.0',
      releaseDate: metadata.releaseDate || new Date().toISOString().split('T')[0],
      description: metadata.description || '',
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      fileName: file.name,
      filePath: `/uploads/${file.name}`,
    };
  },
};

// 刷机记录API
export const flashRecordApi = {
  getList: async ({ page = 1, pageSize = 10 }: PaginationParams): Promise<PaginatedResponse<FlashRecord>> => {
    await mockDelay(300);
    
    const mockData: FlashRecord[] = [
      {
        id: 'record-1',
        deviceTypeId: '1',
        versionId: '1',
        deviceSerialNumber: 'SN001',
        deviceIp: '192.168.1.100',
        devicePort: '22',
        deviceUsername: 'admin',
        status: 'success',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'record-2',
        deviceTypeId: '2',
        versionId: '2',
        deviceSerialNumber: 'SN002',
        deviceIp: '192.168.1.101',
        devicePort: '22',
        deviceUsername: 'admin',
        status: 'failed',
        startTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'record-3',
        deviceTypeId: '1',
        versionId: '3',
        deviceSerialNumber: 'SN003',
        deviceIp: '192.168.1.102',
        devicePort: '22',
        deviceUsername: 'admin',
        status: 'processing',
        startTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'record-4',
        deviceTypeId: '3',
        versionId: '1',
        deviceSerialNumber: 'SN004',
        deviceIp: '192.168.1.103',
        devicePort: '22',
        deviceUsername: 'admin',
        status: 'success',
        startTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 5.5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'record-5',
        deviceTypeId: '2',
        versionId: '2',
        deviceSerialNumber: 'SN005',
        deviceIp: '192.168.1.104',
        devicePort: '22',
        deviceUsername: 'admin',
        status: 'success',
        startTime: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 7.5 * 60 * 60 * 1000).toISOString(),
      },
    ];
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedData = mockData.slice(start, end);
    
    return {
      data: paginatedData,
      total: mockData.length,
      page,
      pageSize,
      totalPages: Math.ceil(mockData.length / pageSize),
    };
  },

  getById: async (id: string): Promise<FlashRecord> => {
    await mockDelay(200);
    const mockData = await flashRecordApi.getList({ page: 1, pageSize: 100 });
    const item = mockData.data.find(item => item.id === id);
    if (!item) throw new Error('刷机记录不存在');
    return item;
  },

  create: async (payload: Omit<FlashRecord, 'id' | 'startTime'>): Promise<FlashRecord> => {
    await mockDelay(500);
    return {
      id: `record-${Date.now()}`,
      ...payload,
      startTime: new Date().toISOString(),
    };
  },

  update: async (id: string, payload: Partial<FlashRecord>): Promise<FlashRecord> => {
    await mockDelay(400);
    const existing = await flashRecordApi.getById(id);
    return { ...existing, ...payload };
  },

  delete: async (id: string): Promise<void> => {
    await mockDelay(300);
    // Mock delete
  },
};

// 任务管理API
export const taskApi = {
  getList: async ({ page = 1, pageSize = 10 }: PaginationParams): Promise<PaginatedResponse<FlashTask>> => {
    await mockDelay(300);
    
    const mockData: FlashTask[] = [
      {
        id: 'task-1',
        mode: 'robot',
        deviceTypeId: '1',
        versionId: '1',
        deviceSerialNumber: 'SN001',
        deviceIp: '192.168.1.100',
        devicePort: '22',
        deviceUsername: 'admin',
        status: 'running',
        progress: 75,
        currentStep: '正在刷写固件...',
        canCancel: true,
        canResume: false,
        startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        logs: [
          '[2024-01-15 10:30:00] 开始连接设备...',
          '[2024-01-15 10:30:05] 设备连接成功',
          '[2024-01-15 10:30:10] 开始下载固件...',
          '[2024-01-15 10:32:00] 固件下载完成',
          '[2024-01-15 10:32:05] 开始刷写固件...',
          '[2024-01-15 10:35:00] 正在刷写固件... 75%',
        ],
      },
      {
        id: 'task-2',
        mode: 'server',
        softwareIds: ['1', '2'],
        deviceIp: '192.168.1.101',
        devicePort: '22',
        deviceUsername: 'root',
        status: 'success',
        progress: 100,
        currentStep: '刷机完成',
        canCancel: false,
        canResume: false,
        startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        logs: [
          '[2024-01-15 09:00:00] 开始连接服务器...',
          '[2024-01-15 09:00:05] 服务器连接成功',
          '[2024-01-15 09:00:10] 开始安装软件...',
          '[2024-01-15 09:15:00] 软件安装完成',
          '[2024-01-15 09:15:05] 配置系统参数...',
          '[2024-01-15 09:20:00] 刷机完成',
        ],
      },
      {
        id: 'task-3',
        mode: 'robot',
        deviceTypeId: '2',
        versionId: '2',
        deviceSerialNumber: 'SN002',
        deviceIp: '192.168.1.102',
        devicePort: '22',
        deviceUsername: 'admin',
        status: 'failed',
        progress: 45,
        currentStep: '连接失败',
        canCancel: false,
        canResume: false,
        startTime: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
        logs: [
          '[2024-01-15 08:00:00] 开始连接设备...',
          '[2024-01-15 08:00:05] 设备连接失败',
          '[2024-01-15 08:00:10] 重试连接...',
          '[2024-01-15 08:00:15] 连接失败，任务终止',
        ],
      },
      {
        id: 'task-4',
        mode: 'server',
        softwareIds: ['3'],
        deviceIp: '192.168.1.103',
        devicePort: '22',
        deviceUsername: 'root',
        status: 'pending',
        progress: 0,
        currentStep: '等待开始',
        canCancel: true,
        canResume: false,
        startTime: new Date().toISOString(),
        logs: [],
      },
    ];
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedData = mockData.slice(start, end);
    
    return {
      data: paginatedData,
      total: mockData.length,
      page,
      pageSize,
      totalPages: Math.ceil(mockData.length / pageSize),
    };
  },

  getById: async (id: string): Promise<FlashTask> => {
    await mockDelay(200);
    const mockData = await taskApi.getList({ page: 1, pageSize: 100 });
    const item = mockData.data.find(item => item.id === id);
    if (!item) throw new Error('任务不存在');
    return item;
  },

  create: async (payload: Omit<FlashTask, 'id' | 'startTime' | 'logs' | 'progress'>): Promise<FlashTask> => {
    await mockDelay(500);
    return {
      id: `task-${Date.now()}`,
      ...payload,
      progress: 0,
      startTime: new Date().toISOString(),
      logs: [`[${new Date().toLocaleString()}] 任务已创建`],
    };
  },

  updateStatus: async (id: string, status: FlashTask['status']): Promise<FlashTask> => {
    await mockDelay(200);
    
    const task = await taskApi.getById(id);
    let updatedTask = { ...task, status };
    
    switch (status) {
      case 'paused':
        updatedTask.currentStep = '已暂停';
        updatedTask.canResume = true;
        updatedTask.canCancel = false;
        updatedTask.logs.push(`[${new Date().toLocaleString()}] 任务已暂停`);
        break;
      case 'running':
        updatedTask.currentStep = '执行中...';
        updatedTask.canResume = false;
        updatedTask.canCancel = true;
        updatedTask.logs.push(`[${new Date().toLocaleString()}] 任务已恢复`);
        break;
      case 'cancelled':
        updatedTask.currentStep = '已取消';
        updatedTask.canCancel = false;
        updatedTask.canResume = false;
        updatedTask.endTime = new Date().toISOString();
        updatedTask.logs.push(`[${new Date().toLocaleString()}] 任务已取消`);
        break;
      case 'success':
        updatedTask.currentStep = '任务完成';
        updatedTask.progress = 100;
        updatedTask.canCancel = false;
        updatedTask.canResume = false;
        updatedTask.endTime = new Date().toISOString();
        updatedTask.logs.push(`[${new Date().toLocaleString()}] 任务成功完成`);
        break;
      case 'failed':
        updatedTask.currentStep = '任务失败';
        updatedTask.canCancel = false;
        updatedTask.canResume = false;
        updatedTask.endTime = new Date().toISOString();
        updatedTask.logs.push(`[${new Date().toLocaleString()}] 任务执行失败`);
        break;
    }
    
    return updatedTask;
  },

  cancel: async (id: string): Promise<FlashTask> => {
    return await taskApi.updateStatus(id, 'cancelled');
  },

  pause: async (id: string): Promise<FlashTask> => {
    return await taskApi.updateStatus(id, 'paused');
  },

  resume: async (id: string): Promise<FlashTask> => {
    return await taskApi.updateStatus(id, 'running');
  },

  delete: async (id: string): Promise<void> => {
    await mockDelay(300);
    // Mock delete
  },
};

// 刷机操作API
export const flashApi = {
  startFlash: async (payload: {
    mode: FlashTask['mode'];
    deviceTypeId?: string;
    versionId?: string;
    softwareIds?: string[];
    deviceIp: string;
    devicePort: string;
    deviceUsername: string;
    devicePassword?: string;
  }): Promise<FlashTask> => {
    await mockDelay(800);
    
    const taskPayload: Omit<FlashTask, 'id' | 'startTime' | 'logs' | 'progress'> = {
      mode: payload.mode,
      deviceIp: payload.deviceIp,
      devicePort: payload.devicePort,
      deviceUsername: payload.deviceUsername,
      status: 'pending',
      currentStep: '等待开始',
      canCancel: true,
      canResume: false,
    };

    if (payload.mode === 'robot') {
      taskPayload.deviceTypeId = payload.deviceTypeId;
      taskPayload.versionId = payload.versionId;
      taskPayload.deviceSerialNumber = `SN${Date.now().toString().slice(-6)}`;
    } else {
      taskPayload.softwareIds = payload.softwareIds;
    }

    return await taskApi.create(taskPayload);
  },

  validateConnection: async (payload: {
    deviceIp: string;
    devicePort: string;
    deviceUsername: string;
    devicePassword?: string;
  }): Promise<{ success: boolean; message: string }> => {
    await mockDelay(1000);
    
    // 模拟连接验证
    if (payload.deviceIp === '192.168.1.999') {
      return { success: false, message: '无法连接到设备' };
    }
    
    return { success: true, message: '连接验证成功' };
  },
};