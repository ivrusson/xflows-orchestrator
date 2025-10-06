/**
 * HTTP Action Plugin Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpActionPlugin } from '../src/http-action-plugin';
import { TemplateParser } from '@xflows/core';

// Mock fetch
global.fetch = vi.fn();

describe('HttpActionPlugin', () => {
  let plugin: HttpActionPlugin;

  beforeEach(() => {
    plugin = new HttpActionPlugin();
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(plugin.id).toBe('http-action');
      expect(plugin.name).toBe('HTTP Action Plugin');
      expect(plugin.version).toBe('1.0.0');
      expect(plugin.type).toBe('action');
    });
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      await expect(plugin.initialize()).resolves.toBeUndefined();
    });
  });

  describe('destroy', () => {
    it('should destroy successfully', async () => {
      await expect(plugin.destroy()).resolves.toBeUndefined();
    });
  });

  describe('execute', () => {
    it('should execute successful HTTP request', async () => {
      const mockResponse = { success: true, data: 'test' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const config = {
        endpoint: '/api/test',
        method: 'POST',
        body: { test: 'data' },
        headers: { 'Content-Type': 'application/json' },
        updateContext: 'responseData'
      };
      const context = { existing: 'data' };
      const event = { type: 'TEST_EVENT' };

      const result = await plugin.execute(config, context, event);

      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ test: 'data' })
      });
      expect(result).toEqual(mockResponse);
      expect(context.responseData).toEqual(mockResponse);
    });

    it('should handle HTTP errors with fail strategy', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const config = {
        endpoint: '/api/test',
        method: 'GET',
        onError: 'fail' as const
      };
      const context = {};
      const event = {};

      await expect(plugin.execute(config, context, event)).rejects.toThrow('HTTP 404: Not Found');
    });

    it('should handle HTTP errors with ignore strategy', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const config = {
        endpoint: '/api/test',
        method: 'GET',
        onError: 'ignore' as const
      };
      const context = {};
      const event = {};

      const result = await plugin.execute(config, context, event);

      expect(result).toBeNull();
    });

    it('should use default method when not specified', async () => {
      const mockResponse = { success: true };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const config = {
        endpoint: '/api/test',
        body: { test: 'data' }
      };
      const context = {};
      const event = {};

      await plugin.execute(config, context, event);

      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ test: 'data' })
      });
    });

    it('should parse templates in body and headers', async () => {
      const mockResponse = { success: true };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const config = {
        endpoint: '/api/test',
        method: 'POST',
        body: { 
          userId: '{{context.userId}}', 
          timestamp: '{{Date.now()}}',
          eventType: '{{event.type}}'
        },
        headers: { 
          'Authorization': 'Bearer {{context.token}}',
          'X-User-ID': '{{context.userId}}'
        }
      };
      const context = { 
        userId: '123', 
        token: 'abc123' 
      };
      const event = { type: 'USER_ACTION' };

      await plugin.execute(config, context, event);

      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer abc123',
          'X-User-ID': '123'
        },
        body: expect.stringContaining('"userId":"123"')
      });
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const config = {
        endpoint: '/api/test',
        method: 'GET',
        onError: 'fail' as const
      };
      const context = {};
      const event = {};

      await expect(plugin.execute(config, context, event)).rejects.toThrow('Network error');
    });

    it('should handle JSON parsing errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      const config = {
        endpoint: '/api/test',
        method: 'GET',
        onError: 'fail' as const
      };
      const context = {};
      const event = {};

      await expect(plugin.execute(config, context, event)).rejects.toThrow('Invalid JSON');
    });

    it('should not update context when updateContext is not specified', async () => {
      const mockResponse = { success: true };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const config = {
        endpoint: '/api/test',
        method: 'GET'
      };
      const context = { existing: 'data' };
      const event = {};

      await plugin.execute(config, context, event);

      expect(context).toEqual({ existing: 'data' });
    });

    it('should handle empty body', async () => {
      const mockResponse = { success: true };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const config = {
        endpoint: '/api/test',
        method: 'GET'
      };
      const context = {};
      const event = {};

      await plugin.execute(config, context, event);

      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(undefined)
      });
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete API workflow', async () => {
      const mockResponse = {
        id: '123',
        status: 'success',
        data: { message: 'Created successfully' }
      };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const config = {
        endpoint: '/api/users',
        method: 'POST',
        body: {
          name: '{{context.user.name}}',
          email: '{{context.user.email}}',
          timestamp: '{{Date.now()}}'
        },
        headers: {
          'Authorization': 'Bearer {{context.token}}',
          'Content-Type': 'application/json'
        },
        updateContext: 'createdUser'
      };
      const context = {
        user: { name: 'John', email: 'john@example.com' },
        token: 'abc123'
      };
      const event = { type: 'CREATE_USER' };

      const result = await plugin.execute(config, context, event);

      expect(result).toEqual(mockResponse);
      expect(context.createdUser).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith('/api/users', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer abc123',
          'Content-Type': 'application/json'
        },
        body: expect.stringContaining('"name":"John"')
      });
    });

    it('should handle error recovery workflow', async () => {
      // First call fails
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const config = {
        endpoint: '/api/test',
        method: 'POST',
        body: { test: 'data' },
        onError: 'ignore' as const,
        updateContext: 'errorData'
      };
      const context = { existing: 'data' };
      const event = {};

      const result = await plugin.execute(config, context, event);

      expect(result).toBeNull();
      expect(context.errorData).toBeUndefined();
      expect(context.existing).toBe('data');
    });

    it('should handle different HTTP methods', async () => {
      const mockResponse = { success: true };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

      for (const method of methods) {
        const config = {
          endpoint: '/api/test',
          method: method as any,
          body: method !== 'GET' ? { test: 'data' } : undefined
        };
        const context = {};
        const event = {};

        await plugin.execute(config, context, event);

        expect(global.fetch).toHaveBeenCalledWith('/api/test', {
          method: method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: method !== 'GET' ? JSON.stringify({ test: 'data' }) : JSON.stringify(undefined)
        });
      }
    });
  });
});
