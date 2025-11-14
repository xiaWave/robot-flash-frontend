import { 
  ApiResponse, 
  ApiError, 
  NetworkError, 
  AuthenticationError, 
  PermissionError, 
  ValidationError, 
  ServerError 
} from './types';

// API配置
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
};

// 请求拦截器
const requestInterceptor = (config: RequestInit): RequestInit => {
  // 添加认证头
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  // 添加默认头
  config.headers = {
    'Content-Type': 'application/json',
    ...config.headers,
  };

  return config;
};

// 响应拦截器
const responseInterceptor = async (response: Response): Promise<ApiResponse> => {
  const contentType = response.headers.get('content-type');
  
  if (!response.ok) {
    const errorData = contentType?.includes('application/json') 
      ? await response.json().catch(() => ({}))
      : {};

    throw createApiError(response.status, errorData.message || response.statusText);
  }

  // 如果没有内容，返回成功响应
  if (response.status === 204) {
    return { success: true, meta: { timestamp: new Date().toISOString() } };
  }

  const data = contentType?.includes('application/json') 
    ? await response.json() 
    : await response.text();

  // 包装响应数据
  const result: ApiResponse = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  // 如果数据中包含分页信息，提取到meta中
  if (data && typeof data === 'object' && ('total' in data || 'page' in data)) {
    result.meta = {
      ...result.meta,
      total: data.total,
      page: data.page,
      pageSize: data.pageSize,
      totalPages: data.totalPages,
    };
  }

  return result;
};

// 创建API错误
const createApiError = (status: number, message: string): ApiError => {
  switch (status) {
    case 400:
      return new ValidationError(message);
    case 401:
      return new AuthenticationError(message);
    case 403:
      return new PermissionError(message);
    case 404:
      return new ApiError(message, 'NOT_FOUND');
    case 422:
      return new ValidationError(message);
    case 500:
    case 502:
    case 503:
    case 504:
      return new ServerError(message);
    default:
      return new ApiError(message, 'UNKNOWN_ERROR');
  }
};

// 重试机制
const retryRequest = async (
  fn: () => Promise<Response>,
  retries: number = API_CONFIG.retries,
  delay: number = API_CONFIG.retryDelay
): Promise<Response> => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    // 只在网络错误或5xx错误时重试
    if (error instanceof NetworkError || (error as any)?.status >= 500) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryRequest(fn, retries - 1, delay * 2);
    }
    
    throw error;
  }
};

// 统一的HTTP方法
export const apiClient = {
  get: async <T = any>(url: string, config?: RequestInit): Promise<ApiResponse<T>> => {
    const fullUrl = `${API_CONFIG.baseURL}${url}`;
    const finalConfig = requestInterceptor({ ...config, method: 'GET' });
    
    try {
      const response = await retryRequest(() => fetch(fullUrl, finalConfig));
      return await responseInterceptor(response);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new NetworkError(error instanceof Error ? error.message : '网络请求失败');
    }
  },

  post: async <T = any>(url: string, data?: any, config?: RequestInit): Promise<ApiResponse<T>> => {
    const fullUrl = `${API_CONFIG.baseURL}${url}`;
    const finalConfig = requestInterceptor({
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    
    try {
      const response = await retryRequest(() => fetch(fullUrl, finalConfig));
      return await responseInterceptor(response);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new NetworkError(error instanceof Error ? error.message : '网络请求失败');
    }
  },

  put: async <T = any>(url: string, data?: any, config?: RequestInit): Promise<ApiResponse<T>> => {
    const fullUrl = `${API_CONFIG.baseURL}${url}`;
    const finalConfig = requestInterceptor({
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
    
    try {
      const response = await retryRequest(() => fetch(fullUrl, finalConfig));
      return await responseInterceptor(response);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new NetworkError(error instanceof Error ? error.message : '网络请求失败');
    }
  },

  patch: async <T = any>(url: string, data?: any, config?: RequestInit): Promise<ApiResponse<T>> => {
    const fullUrl = `${API_CONFIG.baseURL}${url}`;
    const finalConfig = requestInterceptor({
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
    
    try {
      const response = await retryRequest(() => fetch(fullUrl, finalConfig));
      return await responseInterceptor(response);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new NetworkError(error instanceof Error ? error.message : '网络请求失败');
    }
  },

  delete: async <T = any>(url: string, config?: RequestInit): Promise<ApiResponse<T>> => {
    const fullUrl = `${API_CONFIG.baseURL}${url}`;
    const finalConfig = requestInterceptor({ ...config, method: 'DELETE' });
    
    try {
      const response = await retryRequest(() => fetch(fullUrl, finalConfig));
      return await responseInterceptor(response);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new NetworkError(error instanceof Error ? error.message : '网络请求失败');
    }
  },
};

// 模拟延迟工具（用于开发环境）
export const mockDelay = (ms: number = 300) => 
  new Promise(resolve => setTimeout(resolve, ms));