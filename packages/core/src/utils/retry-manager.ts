/**
 * Retry logic with exponential backoff
 */

export interface RetryConfig {
  max: number;
  backoffMs: number;
  backoffMultiplier?: number;
  maxBackoffMs?: number;
}

export class RetryManager {
  /**
   * Execute function with retry logic
   */
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    retryConfig: RetryConfig,
    onRetry?: (attempt: number, error: Error) => void
  ): Promise<T> {
    let lastError: Error;
    let backoffMs = retryConfig.backoffMs;
    const multiplier = retryConfig.backoffMultiplier || 2;
    const maxBackoffMs = retryConfig.maxBackoffMs || 10000;

    for (let attempt = 0; attempt <= retryConfig.max; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === retryConfig.max || !this.shouldRetry(lastError)) {
          throw lastError;
        }

        if (onRetry) {
          onRetry(attempt + 1, lastError);
        }

        // Wait before retry
        await this.delay(backoffMs);
        
        // Increase backoff for next attempt
        backoffMs = Math.min(backoffMs * multiplier, maxBackoffMs);
      }
    }

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    throw lastError!;
  }

  /**
   * Check if error should trigger retry
   */
  shouldRetry(error: Error): boolean {
    // Retry on network errors, timeouts, and 5xx server errors
    if (error.message.includes('fetch')) {
      return true; // Network error
    }
    
    if (error.message.includes('timeout')) {
      return true; // Timeout error
    }
    
    if (error.message.includes('HTTP 5')) {
      return true; // Server error
    }
    
    // Don't retry on 4xx client errors
    if (error.message.includes('HTTP 4')) {
      return false;
    }
    
    return true; // Default to retry
  }

  /**
   * Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const retryManager = new RetryManager();
