/**
 * Simple in-memory cache implementation
 */

export interface CacheConfig {
  ttlMs: number;
  key?: string;
  invalidate?: string[];
}

export interface CacheEntry<T = unknown> {
  value: T;
  timestamp: number;
  ttlMs: number;
}

export class Cache {
  private cache = new Map<string, CacheEntry<unknown>>();

  /**
   * Generate cache key from config and context
   */
  generateKey(config: unknown, context: unknown, customKey?: string): string {
    if (customKey) {
      return customKey;
    }
    
    // Create a hash from config and relevant context
    const configStr = JSON.stringify(config);
    const contextStr = JSON.stringify(context);
    return `cache_${this.hashString(configStr + contextStr)}`;
  }

  /**
   * Get value from cache
   */
  get<T = unknown>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Set value in cache
   */
  set<T = unknown>(key: string, value: T, ttlMs: number): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttlMs
    });
  }

  /**
   * Invalidate cache entries matching pattern
   */
  invalidate(pattern: string): void {
    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Simple hash function
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

// Singleton cache instance
export const cache = new Cache();
