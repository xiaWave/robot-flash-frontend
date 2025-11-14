// 基础实体接口
interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

// 设备类型接口
export interface DeviceType extends BaseEntity {
  name: string;
  model: string;
  manufacturer: string;
  description?: string;
  specifications?: Record<string, any>;
  imageUrl?: string;
}

// 资源分类枚举
export type ResourceCategory = 'device' | 'software' | 'system' | 'config';

// 资源类型接口
export interface ResourceType extends BaseEntity {
  name: string;
  category: ResourceCategory;
  description?: string;
  
  // 终端设备相关
  model?: string;
  manufacturer?: string;
  specifications?: Record<string, any>;
  
  // 软件相关
  version?: string;
  type?: string;
  supportedOs?: string[];
  dependencies?: string[];
  
  // 系统相关
  osType?: string;
  architecture?: string;
  requirements?: Record<string, any>;
  
  // 配置相关
  configType?: string;
  schema?: Record<string, any>;
  
  // 通用
  fileSize?: string;
  filePath?: string;
  downloadUrl?: string;
}

// 版本接口
export interface Version extends BaseEntity {
  versionNumber: string;
  releaseDate: string;
  description: string;
  changelog?: string;
  
  // 文件信息
  fileName?: string;
  filePath?: string;
  fileSize?: string;
  fileMd5?: string;
  downloadUrl?: string;
  
  // 兼容性
  supportedDevices?: string[];
  minSystemVersion?: string;
  maxSystemVersion?: string;
  
  // 元数据
  isBeta?: boolean;
  isStable?: boolean;
  tags?: string[];
}

// 刷机状态枚举
export type FlashRecordStatus = 'success' | 'failed' | 'processing' | 'cancelled' | 'pending';

// 刷机记录接口
export interface FlashRecord extends BaseEntity {
  deviceTypeId: string;
  versionId: string;
  deviceSerialNumber: string;
  deviceIp: string;
  devicePort: string;
  deviceUsername: string;
  
  status: FlashRecordStatus;
  progress: number;
  currentStep: string;
  
  startTime: string;
  endTime?: string;
  duration?: number; // 毫秒
  
  // 结果信息
  errorMessage?: string;
  logs: string[];
  
  // 元数据
  operator?: string;
  notes?: string;
}

// 用户角色枚举
export type UserRole = 'admin' | 'operator' | 'viewer';

// 用户状态枚举
export type UserStatus = 'active' | 'inactive' | 'suspended';

// 用户接口
export interface User extends BaseEntity {
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  fullName?: string;
  avatar?: string;
  phone?: string;
  lastLoginAt?: string;
  permissions?: string[];
}

// 分页参数接口
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

// 分页响应接口
export interface PaginationData<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 刷机模式枚举
export type FlashMode = 'robot' | 'server';

// 任务状态枚举
export type FlashTaskStatus = 'pending' | 'running' | 'paused' | 'success' | 'failed' | 'cancelled';

// 任务步骤枚举
export type TaskStep = 
  | '等待开始'
  | '连接设备'
  | '验证连接'
  | '下载固件'
  | '刷写固件'
  | '验证结果'
  | '完成任务'
  | '任务失败'
  | '已取消'
  | '已暂停';

// 任务接口
export interface FlashTask extends BaseEntity {
  mode: FlashMode;
  
  // 机器人模式相关
  deviceTypeId?: string;
  versionId?: string;
  deviceSerialNumber?: string;
  
  // 服务器模式相关
  softwareIds?: string[];
  
  // 通用信息
  deviceIp: string;
  devicePort: string;
  deviceUsername: string;
  devicePassword?: string;
  
  // 状态信息
  status: FlashTaskStatus;
  progress: number;
  currentStep: string;
  
  // 时间信息
  startTime: string;
  endTime?: string;
  estimatedDuration?: number; // 预估耗时（毫秒）
  
  // 操作信息
  logs: string[];
  canCancel: boolean;
  canResume: boolean;
  canRetry: boolean;
  
  // 错误信息
  errorMessage?: string;
  errorCode?: string;
  
  // 元数据
  operator?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  tags?: string[];
}

// API响应基础接口
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    version?: string;
  };
}

// 表单验证规则接口
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

// 表单字段配置接口
export interface FormField<T = any> {
  name: keyof T;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'file';
  placeholder?: string;
  description?: string;
  validation?: ValidationRule;
  options?: Array<{ label: string; value: any }>;
  disabled?: boolean;
  hidden?: boolean;
}

// 列表列配置接口
export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  width?: string | number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

// 操作按钮配置接口
export interface ActionConfig<T = any> {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (record: T, index: number) => void;
  disabled?: (record: T) => boolean;
  hidden?: (record: T) => boolean;
  danger?: boolean;
  confirm?: {
    title: string;
    description?: string;
    okText?: string;
    cancelText?: string;
  };
}

// 通知类型枚举
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// 通知接口
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// 系统配置接口
export interface SystemConfig {
  siteName: string;
  siteDescription?: string;
  logoUrl?: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  features: {
    enableNotifications: boolean;
    enableDebugMode: boolean;
  };
  limits: {
    maxFileSize: number;
    maxConcurrentTasks: number;
    taskTimeout: number;
  };
}

// WebSocket消息类型
export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  timestamp: string;
  id?: string;
}

// 事件类型枚举
export type EventType = 
  | 'task:created'
  | 'task:updated'
  | 'task:deleted'
  | 'task:status:changed'
  | 'system:notification'
  | 'user:login'
  | 'user:logout';

// 导出所有类型的联合类型
export type Entity = DeviceType | ResourceType | Version | FlashRecord | FlashTask | User;
export type Status = FlashRecordStatus | FlashTaskStatus | UserStatus;
export type Category = ResourceCategory | UserRole | FlashMode | NotificationType;