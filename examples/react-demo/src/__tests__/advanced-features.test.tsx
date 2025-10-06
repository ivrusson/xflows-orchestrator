import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest';
import { DefaultPluginManager } from '@xflows/plugins';
import { HttpActionPlugin, type HttpActionConfig } from '@xflows/plugin-http';
import { cache } from '@xflows/core';

// Test data types
interface MockResponse {
  success: boolean;
  data?: unknown;
  status?: string;
  code?: string;
  userId?: number;
  error?: string;
}

// Mock fetch for HTTP plugin tests
const mockFetch = vi.fn() as MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe('XFlows Advanced Features Integration Tests', () => {
  let pluginManager: DefaultPluginManager;
  let httpPlugin: HttpActionPlugin;

  beforeEach(() => {
    // Reset mocks and cache
    vi.clearAllMocks();
    cache.clear();
    
    // Setup plugin manager
    pluginManager = new DefaultPluginManager();
    httpPlugin = new HttpActionPlugin();
    pluginManager.registry.register(httpPlugin);
  });

  describe('HTTP Plugin Advanced Features', () => {
    it('should handle caching with cacheTtlMs', async () => {
      const mockResponse: MockResponse = { success: true, data: { id: 123 } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as unknown as Response);

      const config: HttpActionConfig = {
        endpoint: '/api/test',
        method: 'GET',
        cacheTtlMs: 60000
      };

      const context: Record<string, unknown> = { userId: 123 };
      const event: Record<string, unknown> = {};

      // First call - should make HTTP request
      const result1 = await httpPlugin.execute(config, context, event);
      expect(result1).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const result2 = await httpPlugin.execute(config, context, event);
      expect(result2).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1, not 2
    });

    it('should handle custom cache keys', async () => {
      const mockResponse: MockResponse = { success: true, data: { id: 456 } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as unknown as Response);

      const config: HttpActionConfig = {
        endpoint: '/api/test',
        method: 'GET',
        cacheTtlMs: 60000,
        cacheKey: 'custom-test-key'
      };

      const context: Record<string, unknown> = {};
      const event: Record<string, unknown> = {};

      await httpPlugin.execute(config, context, event);
      
      // Verify cache has the custom key
      expect(cache.get('custom-test-key')).toEqual(mockResponse);
    });

    it('should validate response status codes', async () => {
      const mockResponse: MockResponse = { success: true };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as unknown as Response);

      const config: HttpActionConfig = {
        endpoint: '/api/test',
        method: 'GET',
        expect: {
          status: 200
        }
      };

      const context: Record<string, unknown> = {};
      const event: Record<string, unknown> = {};

      const result = await httpPlugin.execute(config, context, event);
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when status validation fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as unknown as Response);

      const config: HttpActionConfig = {
        endpoint: '/api/test',
        method: 'GET',
        expect: {
          status: 200
        }
      };

      const context: Record<string, unknown> = {};
      const event: Record<string, unknown> = {};

      await expect(httpPlugin.execute(config, context, event)).rejects.toThrow('Response validation failed: Expected status 200, got 404');
    });

    it('should handle custom error detection logic', async () => {
      const mockResponse: MockResponse = { success: false, error: 'Custom error' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockResponse,
      } as unknown as Response);

      const config: HttpActionConfig = {
        endpoint: '/api/test',
        method: 'POST',
        expect: {
          isError: (_response: Response, data: unknown) => {
            return (data as Record<string, unknown>)?.success === false;
          }
        }
      };

      const context: Record<string, unknown> = {};
      const event: Record<string, unknown> = {};

      await expect(httpPlugin.execute(config, context, event)).rejects.toThrow('HTTP 200: OK');
    });

    it('should map results to context using mapResult', async () => {
      const mockResponse: MockResponse = { 
        success: true,
        status: 'verified',
        code: 'ABC123',
        userId: 789
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as unknown as Response);

      const config: HttpActionConfig = {
        endpoint: '/api/verify',
        method: 'POST',
        mapResult: {
          'session.verificationStatus': '$.status',
          'session.verificationCode': '$.code',
          'user.id': '$.userId'
        }
      };

      const context: Record<string, unknown> = {};
      const event: Record<string, unknown> = {};

      await httpPlugin.execute(config, context, event);
      
      expect(context).toEqual({
        session: {
          verificationStatus: 'verified',
          verificationCode: 'ABC123'
        },
        user: {
          id: 789
        }
      });
    });

    it('should handle retry logic with exponential backoff', async () => {
      const mockResponse: MockResponse = { success: true, data: 'success' };

      // First two calls fail, third succeeds
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse,
        } as unknown as Response);

      const config: HttpActionConfig = {
        endpoint: '/api/test',
        method: 'GET',
        retry: {
          max: 2,
          backoffMs: 100,
          backoffMultiplier: 2
        }
      };

      const context: Record<string, unknown> = {};
      const event: Record<string, unknown> = {};

      const result = await httpPlugin.execute(config, context, event);
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should not retry on 4xx client errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Bad Request' })
      } as unknown as Response);

      const config: HttpActionConfig = {
        endpoint: '/api/test',
        method: 'GET',
        retry: {
          max: 2,
          backoffMs: 100
        }
      };

      const context: Record<string, unknown> = {};
      const event: Record<string, unknown> = {};

      await expect(httpPlugin.execute(config, context, event)).rejects.toThrow('HTTP 400: Bad Request');
      expect(mockFetch).toHaveBeenCalledTimes(1); // Should not retry
    });
  });

  describe('Template Parsing Integration', () => {
    it('should parse templates in HTTP request body', async () => {
      const mockResponse: MockResponse = { success: true };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as unknown as Response);

      const config: HttpActionConfig = {
        endpoint: '/api/users/{{context.userId}}',
        method: 'POST',
        body: {
          name: '{{event.userName}}',
          email: '{{event.userEmail}}',
          metadata: {
            source: '{{context.source}}',
            timestamp: '{{event.timestamp}}'
          }
        }
      };

      const context: Record<string, unknown> = { 
        userId: 123, 
        source: 'web-app' 
      };
      const event: Record<string, unknown> = { 
        userName: 'John Doe', 
        userEmail: 'john@example.com',
        timestamp: '2024-01-01T00:00:00Z'
      };

      await httpPlugin.execute(config, context, event);

      expect(mockFetch).toHaveBeenCalledWith('/api/users/123', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          metadata: {
            source: 'web-app',
            timestamp: '2024-01-01T00:00:00Z'
          }
        }),
      });
    });

    it('should parse templates in HTTP headers', async () => {
      const mockResponse: MockResponse = { success: true };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as unknown as Response);

      const config: HttpActionConfig = {
        endpoint: '/api/test',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer {{context.token}}',
          'X-User-ID': '{{context.userId}}',
          'X-Request-ID': '{{event.requestId}}'
        }
      };

      const context: Record<string, unknown> = { 
        token: 'abc123',
        userId: 456
      };
      const event: Record<string, unknown> = { 
        requestId: 'req-789'
      };

      await httpPlugin.execute(config, context, event);

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer abc123',
          'X-User-ID': '456',
          'X-Request-ID': 'req-789'
        },
      });
    });
  });

  describe('Combined Advanced Features', () => {
    it('should work with caching, validation, mapping, and retry together', async () => {
      const mockResponse: MockResponse = { 
        status: 'verified',
        code: 'ABC123',
        userId: 123,
        success: true
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as unknown as Response);

      const config: HttpActionConfig = {
        endpoint: '/api/verify/{{context.userId}}',
        method: 'POST',
        cacheTtlMs: 60000,
        cacheKey: 'verify-user-{{context.userId}}',
        expect: {
          status: 200,
          isError: (_response: Response, data: unknown) => (data as Record<string, unknown>)?.success === false
        },
        mapResult: {
          'session.verificationStatus': '$.status',
          'session.verificationCode': '$.code',
          'user.id': '$.userId'
        },
        retry: {
          max: 1,
          backoffMs: 100
        },
        body: {
          user: '{{context.userName}}',
          timestamp: '{{event.timestamp}}'
        }
      };

      const context: Record<string, unknown> = { 
        userId: 123,
        userName: 'John Doe'
      };
      const event: Record<string, unknown> = { 
        timestamp: '2024-01-01T00:00:00Z'
      };

      const result = await httpPlugin.execute(config, context, event);
      
      expect(result).toEqual(mockResponse);

      // Verify mapping worked
      expect(context).toEqual({
        userId: 123,
        userName: 'John Doe',
        session: {
          verificationStatus: 'verified',
          verificationCode: 'ABC123'
        },
        user: {
          id: 123
        }
      });

      // Verify caching worked
      expect(cache.get('verify-user-123')).toEqual(mockResponse);

      // Verify template parsing worked
      expect(mockFetch).toHaveBeenCalledWith('/api/verify/123', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: 'John Doe',
          timestamp: '2024-01-01T00:00:00Z'
        }),
      });
    });
  });

  describe('Error Handling with Advanced Features', () => {
    it('should handle errors gracefully with onError: ignore', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const config: HttpActionConfig = {
        endpoint: '/api/failing-endpoint',
        method: 'GET',
        onError: 'ignore',
        retry: {
          max: 1,
          backoffMs: 100
        }
      };

      const context: Record<string, unknown> = {};
      const event: Record<string, unknown> = {};

      const result = await httpPlugin.execute(config, context, event);
      expect(result).toBeNull(); // Should return null on error with ignore strategy
    });

    it('should throw error with onError: fail', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const config: HttpActionConfig = {
        endpoint: '/api/failing-endpoint',
        method: 'GET',
        onError: 'fail',
        retry: {
          max: 1,
          backoffMs: 100
        }
      };

      const context: Record<string, unknown> = {};
      const event: Record<string, unknown> = {};

      await expect(httpPlugin.execute(config, context, event)).rejects.toThrow('Network error');
    });
  });
});
