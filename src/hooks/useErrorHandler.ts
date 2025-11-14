import { toast } from 'sonner';
import { 
  ApiError, 
  NetworkError, 
  AuthenticationError, 
  PermissionError, 
  ValidationError, 
  ServerError 
} from '../services/types';

export const useErrorHandler = () => {
  const handleError = (error: unknown, context?: string) => {
    console.error(`Error in ${context}:`, error);

    if (error instanceof ApiError) {
      switch (error.constructor) {
        case NetworkError:
          toast.error('网络连接失败', {
            description: '请检查网络连接后重试',
            duration: 5000,
          });
          break;
          
        case AuthenticationError:
          toast.error('认证失败', {
            description: '请重新登录',
            duration: 3000,
          });
          // 可以在这里触发登出逻辑
          break;
          
        case PermissionError:
          toast.error('权限不足', {
            description: error.message,
            duration: 4000,
          });
          break;
          
        case ValidationError:
          toast.error('数据验证失败', {
            description: error.message,
            duration: 4000,
          });
          break;
          
        case ServerError:
          toast.error('服务器错误', {
            description: '请稍后重试或联系管理员',
            duration: 5000,
          });
          break;
          
        default:
          toast.error('操作失败', {
            description: error.message,
            duration: 4000,
          });
      }
    } else if (error instanceof Error) {
      toast.error('未知错误', {
        description: error.message,
        duration: 4000,
      });
    } else {
      toast.error('未知错误', {
        description: '发生了未知错误，请重试',
        duration: 3000,
      });
    }
  };

  const handleAsyncError = async <T>(
    asyncFn: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, context);
      return null;
    }
  };

  return {
    handleError,
    handleAsyncError,
  };
};