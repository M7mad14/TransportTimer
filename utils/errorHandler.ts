import { Alert } from 'react-native';

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public userMessage?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown, context?: string): void => {
  console.error(`Error in ${context || 'unknown context'}:`, error);

  if (error instanceof AppError) {
    Alert.alert('', error.userMessage || error.message);
  } else if (error instanceof Error) {
    Alert.alert('', `حدث خطأ: ${error.message}`);
  } else {
    Alert.alert('', 'حدث خطأ غير متوقع');
  }
};

export const safeExecute = async <T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error) {
    if (errorMessage) {
      Alert.alert('', errorMessage);
    }
    console.error('Safe execute error:', error);
    return null;
  }
};

export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
};

