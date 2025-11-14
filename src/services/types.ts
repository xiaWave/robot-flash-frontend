// 统一的API响应格式
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
    total?: number;
    page?: number;
    pageSize?: number;
    timestamp: string;
  };
}

// 分页参数
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  category?: string;
}

// 分页响应
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// API错误类
export class ApiError extends Error {
  constructor(
    message: string,
    public code: string = 'UNKNOWN_ERROR',
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 网络错误类
export class NetworkError extends ApiError {
  constructor(message: string = '网络连接失败') {
    super(message, 'NETWORK_ERROR');
  }
}

// 认证错误类
export class AuthenticationError extends ApiError {
  constructor(message: string = '认证失败') {
    super(message, 'AUTHENTICATION_ERROR');
  }
}

// 权限错误类
export class PermissionError extends ApiError {
  constructor(message: string = '权限不足') {
    super(message, 'PERMISSION_ERROR');
  }
}

// 验证错误类
export class ValidationError extends ApiError {
  constructor(message: string = '数据验证失败', public fields?: Record<string, string>) {
    super(message, 'VALIDATION_ERROR');
  }
}

// 服务器错误类
export class ServerError extends ApiError {
  constructor(message: string = '服务器内部错误') {
    super(message, 'SERVER_ERROR');
  }
}