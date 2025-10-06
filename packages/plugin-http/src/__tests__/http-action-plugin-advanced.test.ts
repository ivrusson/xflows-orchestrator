/**
 * Test for advanced HTTP features
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HttpActionPlugin } from '../src/http-action-plugin';
import { cache } from '@xflows/core';

// Mock response type
interface MockResponse {
  ok: boolean;
  status: number;
  statusText?: string;
  json: () => Promise<unknown>;
}

describe('HttpActionPlugin Advanced Features', () => {
  let plugin: HttpActionPlugin;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    plugin = new HttpActionPlugin();
    mockFetch = vi.fn();
    global.fetch = mockFetch as unknown as typeof fetch;
    
    // Clear cache before each test
    cache.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Caching', () => {
    it('should cache HTTP responses when cacheTtlMs is configured', async () => {
      const mockResponse: MockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ data: 'test' })
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const config = {
        endpoint: '/api/test',
        method: 'GET',
        cacheTtlMs: 60000
      };

      const context = {};
      const event = {};

      // First call - should make HTTP request
      const result1 = await plugin.execute(config, context, event);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result1).toEqual({ data: 'test' });

      // Second call - should use cache
      const result2 = await plugin.execute(config, context, event);
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1, not 2
      expect(result2).toEqual({ data: 'test' });
    });

    it('should use custom cache key when provided', async () => {
      const mockResponse: MockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ data: 'test' })
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const config = {
        endpoint: '/api/test',
        method: 'GET',
        cacheTtlMs: 60000,
        cacheKey: 'custom-key'
      };

      const context = {};
      const event = {};

      await plugin.execute(config, context, event);
      
      // Verify cache has the custom key
      expect(cache.get('custom-key')).toEqual({ data: 'test' });
    });
  });

  describe('Response Validation', () => {
    it('should validate response status code', async () => {
      const mockResponse: MockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ data: 'test' })
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const config = {
        endpoint: '/api/test',
        method: 'GET',
        expect: {
          status: 200
        }
      };

      const context = {};
      const event = {};

      const result = await plugin.execute(config, context, event);
      expect(result).toEqual({ data: 'test' });
    });

    it('should throw error when status code validation fails', async () => {
      const mockResponse: MockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: vi.fn()
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const config = {
        endpoint: '/api/test',
        method: 'GET',
        expect: {
          status: 200
        }
      };

      const context = {};
      const event = {};

      await expect(plugin.execute(config, context, event)).rejects.toThrow('HTTP 404: Not Found');
    });

    it('should validate response schema', async () => {
      const mockResponse: MockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ 
          status: 'verified',
          code: 'ABC123'
        })
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const config = {
        endpoint: '/api/verify',
        method: 'POST',
        expect: {
          status: 200,
          schema: 'QuickQuoteVerifyResponse'
        }
      };

      const context = {};
      const event = {};

      const result = await plugin.execute(config, context, event);
      expect(result).toEqual({ 
        status: 'verified',
        code: 'ABC123'
      });
    });
  });

  describe('Result Mapping', () => {
    it('should map response data to context using mapResult', async () => {
      const mockResponse: MockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ 
          status: 'verified',
          code: 'ABC123'
        })
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const config = {
        endpoint: '/api/verify',
        method: 'POST',
        mapResult: {
          'session.verificationStatus': '$.status',
          'session.verificationCode': '$.code'
        }
      };

      const context: Record<string, unknown> = {};
      const event = {};

      await plugin.execute(config, context, event);
      
      expect(context).toEqual({
        session: {
          verificationStatus: 'verified',
          verificationCode: 'ABC123'
        }
      });
    });
  });

  describe('Retry Logic', () => {
    it('should retry failed requests with exponential backoff', async () => {
      const mockResponse: MockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ data: 'success' })
      };

      // First two calls fail, third succeeds
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockResponse);

      const config = {
        endpoint: '/api/test',
        method: 'GET',
        retry: {
          max: 2,
          backoffMs: 100,
          backoffMultiplier: 2
        }
      };

      const context = {};
      const event = {};

      const result = await plugin.execute(config, context, event);
      expect(result).toEqual({ data: 'success' });
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should not retry on 4xx client errors', async () => {
      const mockResponse: MockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: vi.fn()
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const config = {
        endpoint: '/api/test',
        method: 'GET',
        retry: {
          max: 2,
          backoffMs: 100
        }
      };

      const context = {};
      const event = {};

      await expect(plugin.execute(config, context, event)).rejects.toThrow('HTTP 400: Bad Request');
      expect(mockFetch).toHaveBeenCalledTimes(1); // Should not retry
    });
  });

  describe('Combined Features', () => {
    it('should work with caching, validation, mapping, and retry together', async () => {
      const mockResponse: MockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ 
          status: 'verified',
          code: 'ABC123',
          userId: 123
        })
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const config = {
        endpoint: '/api/verify',
        method: 'POST',
        cacheTtlMs: 60000,
        cacheKey: 'verify-user-123',
        expect: {
          status: 200,
          schema: 'QuickQuoteVerifyResponse'
        },
        mapResult: {
          'session.verificationStatus': '$.status',
          'session.verificationCode': '$.code',
          'user.id': '$.userId'
        },
        retry: {
          max: 1,
          backoffMs: 100
        }
      };

      const context: Record<string, unknown> = {};
      const event = {};

      const result = await plugin.execute(config, context, event);
      
      expect(result).toEqual({ 
        status: 'verified',
        code: 'ABC123',
        userId: 123
      });

      expect(context).toEqual({
        session: {
          verificationStatus: 'verified',
          verificationCode: 'ABC123'
        },
        user: {
          id: 123
        }
      });

      // Verify caching
      expect(cache.get('verify-user-123')).toEqual({ 
        status: 'verified',
        code: 'ABC123',
        userId: 123
      });
    });
  });
});
