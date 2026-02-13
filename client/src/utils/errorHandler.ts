interface ErrorInfo {
  message: string;
  code?: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

class ErrorHandler {
  private static logError(error: Error | unknown, context?: Record<string, unknown>): void {
    const errorInfo: ErrorInfo = {
      message: error instanceof Error ? error.message : String(error),
      code: error instanceof Error ? error.name : undefined,
      timestamp: new Date().toISOString(),
      context,
    };

    if (import.meta.env.DEV) {
      console.error('Error:', errorInfo);
    }

    const errors = this.getStoredErrors();
    errors.push(errorInfo);
    if (errors.length > 100) {
      errors.shift();
    }
    localStorage.setItem('app_errors', JSON.stringify(errors));
  }

  private static getStoredErrors(): ErrorInfo[] {
    try {
      const errors = localStorage.getItem('app_errors');
      return errors ? JSON.parse(errors) : [];
    } catch {
      return [];
    }
  }

  static handleError(error: Error | unknown, context?: Record<string, unknown>): string {
    this.logError(error, context);
    
    if (error instanceof Error) {
      return error.message;
    }
    
    if (typeof error === 'object' && error !== null && 'error' in error) {
      return String((error as { error: string }).error);
    }
    
    return 'An unexpected error occurred';
  }

  static clearErrors(): void {
    localStorage.removeItem('app_errors');
  }
}

export default ErrorHandler;
