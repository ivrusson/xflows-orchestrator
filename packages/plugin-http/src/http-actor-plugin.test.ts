/**
 * HTTP Actor Plugin Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpActorPlugin } from '../src/http-actor-plugin';
import { TemplateParser } from '@xflows/core';

// Mock fetch
global.fetch = vi.fn();

describe('HttpActorPlugin', () => {
  let plugin: HttpActorPlugin;

  beforeEach(() => {
    plugin = new HttpActorPlugin();
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(plugin.id).toBe('http-actor');
      expect(plugin.name).toBe('HTTP Actor Plugin');
      expect(plugin.version).toBe('1.0.0');
      expect(plugin.type).toBe('actor');
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

  describe('createActor', () => {
    it('should create HTTP actor function', async () => {
      const mockResponse = { success: true, data: 'test' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const config = {
        endpoint: '/api/test',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000,
        retries: 3
      };

      const actor = await plugin.createActor(config);
      expect(typeof actor).toBe('object');
      expect(actor).toBeDefined();
    });

    it('should execute HTTP request through actor', async () => {
      const mockResponse = { success: true, data: 'test' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const config = {
        endpoint: '/api/test',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      };

      const actor = await plugin.createActor(config);
      const input = { test: 'data' };

      const result = await actor({ input });

      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ test: 'data' })
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle HTTP errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const config = {
        endpoint: '/api/test',
        method: 'GET'
      };

      const actor = await plugin.createActor(config);
      const input = {};

      await expect(actor({ input })).rejects.toThrow('HTTP 404: Not Found');
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const config = {
        endpoint: '/api/test',
        method: 'GET'
      };

      const actor = await plugin.createActor(config);
      const input = {};

      await expect(actor({ input })).rejects.toThrow('Network error');
    });

    it('should use default method when not specified', async () => {
      const mockResponse = { success: true };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const config = {
        endpoint: '/api/test'
      };

      const actor = await plugin.createActor(config);
      const input = { test: 'data' };

      await actor({ input });

      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ test: 'data' })
      });
    });

    it('should handle timeout', async () => {
      // Mock AbortController
      const mockAbortController = {
        abort: vi.fn(),
        signal: {}
      };
      global.AbortController = vi.fn(() => mockAbortController) as any;
      global.setTimeout = vi.fn((callback) => {
        callback();
        return 123 as any;
      });
      global.clearTimeout = vi.fn();

      (global.fetch as any).mockRejectedValueOnce(new Error('Aborted'));

      const config = {
        endpoint: '/api/test',
        method: 'GET',
        timeout: 1000
      };

      const actor = await plugin.createActor(config);
      const input = {};

      await expect(actor({ input })).rejects.toThrow('Aborted');
    });

    it('should parse templates in input', async () => {
      const mockResponse = { success: true };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const config = {
        endpoint: '/api/users/{{context.userId}}',
        method: 'GET',
        headers: { 'Authorization': 'Bearer {{context.token}}' }
      };

      const actor = await plugin.createActor(config);
      const input = {
        context: { userId: '123', token: 'abc123' }
      };

      await actor({ input });

      expect(global.fetch).toHaveBeenCalledWith('/api/users/123', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer abc123'
        },
        body: JSON.stringify({
          context: { userId: '123', token: 'abc123' }
        })
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
        headers: {
          'Authorization': 'Bearer {{context.token}}',
          'Content-Type': 'application/json'
        },
        timeout: 30000,
        retries: 3
      };

      const actor = await plugin.createActor(config);
      const input = {
        context: { token: 'abc123' },
        userData: {
          name: 'John',
          email: 'john@example.com'
        }
      };

      const result = await actor({ input });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith('/api/users', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer abc123',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          context: { token: 'abc123' },
          userData: {
            name: 'John',
            email: 'john@example.com'
          }
        })
      });
    });

    it('should handle retry logic', async () => {
      // First call fails, second succeeds
      (global.fetch as any)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });

      const config = {
        endpoint: '/api/test',
        method: 'GET',
        retries: 2
      };

      const actor = await plugin.createActor(config);
      const input = {};

      const result = await actor({ input });

      expect(result).toEqual({ success: true });
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
