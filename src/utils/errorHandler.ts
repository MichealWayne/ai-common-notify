/**
 * @author Wayne
 * @Date 2025-08-16 16:38:24
 * @LastEditTime 2025-08-16 17:08:10
 */
/**
 * 统一错误处理工具
 */

export interface ErrorInfo {
  message: string;
  code?: string;
  stack?: string;
}

/**
 * 安全地提取错误信息
 * @param error - 错误对象
 * @returns 格式化的错误信息
 */
export function extractErrorInfo(error: unknown): ErrorInfo {
  if (error instanceof Error) {
    const result: ErrorInfo = {
      message: error.message,
    };
    if ((error as any).code) {
      result.code = (error as any).code;
    }
    if (error.stack) {
      result.stack = error.stack;
    }
    return result;
  }

  if (typeof error === 'string') {
    return { message: error };
  }

  if (error && typeof error === 'object') {
    const errorObj = error as any;
    const result: ErrorInfo = {
      message: errorObj.message || errorObj.toString() || 'Unknown error',
    };
    if (errorObj.code) {
      result.code = errorObj.code;
    }
    if (errorObj.stack) {
      result.stack = errorObj.stack;
    }
    return result;
  }

  return { message: 'Unknown error occurred' };
}

/**
 * 创建标准化的错误响应
 * @param error - 错误对象
 * @param context - 错误上下文
 * @returns 标准化的错误信息
 */
export function createErrorResponse(
  error: unknown,
  context?: string
): { error: string; context?: string } {
  const errorInfo = extractErrorInfo(error);
  const result: { error: string; context?: string } = {
    error: errorInfo.message,
  };
  if (context) {
    result.context = context;
  }
  return result;
}

/**
 * 异步操作的错误包装器
 * @param operation - 异步操作
 * @param errorContext - 错误上下文
 * @returns Promise结果或错误
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  errorContext?: string
): Promise<{ success: true; data: T } | { success: false; error: ErrorInfo; context?: string }> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const result: { success: false; error: ErrorInfo; context?: string } = {
      success: false,
      error: extractErrorInfo(error),
    };
    if (errorContext) {
      result.context = errorContext;
    }
    return result;
  }
}
