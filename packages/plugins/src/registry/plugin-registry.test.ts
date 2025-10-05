/**
 * Plugin Registry Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DefaultPluginRegistry } from './plugin-registry';
import { BasePluginImpl } from '../base/plugin-base';

// Mock plugin for testing
class MockPlugin extends BasePluginImpl {
  constructor(id: string, name: string, version: string, type: string) {
    super(id, name, version, type);
  }

  async initialize(): Promise<void> {
    // Mock initialization
  }

  async destroy(): Promise<void> {
    // Mock destruction
  }
}

describe('DefaultPluginRegistry', () => {
  let registry: DefaultPluginRegistry;

  beforeEach(() => {
    registry = new DefaultPluginRegistry();
  });

  describe('register', () => {
    it('should register a plugin successfully', () => {
      const plugin = new MockPlugin('test-plugin', 'Test Plugin', '1.0.0', 'actor');

      expect(() => registry.register(plugin)).not.toThrow();
      expect(registry.isRegistered('test-plugin')).toBe(true);
    });

    it('should throw error when registering duplicate plugin', () => {
      const plugin1 = new MockPlugin('test-plugin', 'Test Plugin 1', '1.0.0', 'actor');
      const plugin2 = new MockPlugin('test-plugin', 'Test Plugin 2', '2.0.0', 'action');

      registry.register(plugin1);

      expect(() => registry.register(plugin2)).toThrow("Plugin with id 'test-plugin' is already registered");
    });

    it('should register multiple plugins with different IDs', () => {
      const plugin1 = new MockPlugin('plugin-1', 'Plugin 1', '1.0.0', 'actor');
      const plugin2 = new MockPlugin('plugin-2', 'Plugin 2', '1.0.0', 'action');

      registry.register(plugin1);
      registry.register(plugin2);

      expect(registry.isRegistered('plugin-1')).toBe(true);
      expect(registry.isRegistered('plugin-2')).toBe(true);
      expect(registry.getPluginCount()).toBe(2);
    });
  });

  describe('unregister', () => {
    it('should unregister a plugin successfully', () => {
      const plugin = new MockPlugin('test-plugin', 'Test Plugin', '1.0.0', 'actor');
      registry.register(plugin);

      registry.unregister('test-plugin');

      expect(registry.isRegistered('test-plugin')).toBe(false);
      expect(registry.getPluginCount()).toBe(0);
    });

    it('should handle unregistering non-existent plugin gracefully', () => {
      expect(() => registry.unregister('non-existent')).not.toThrow();
      expect(registry.getPluginCount()).toBe(0);
    });

    it('should call destroy on plugin when unregistering', async () => {
      const plugin = new MockPlugin('test-plugin', 'Test Plugin', '1.0.0', 'actor');
      const destroySpy = vi.spyOn(plugin, 'destroy');
      
      registry.register(plugin);
      registry.unregister('test-plugin');

      expect(destroySpy).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should return registered plugin', () => {
      const plugin = new MockPlugin('test-plugin', 'Test Plugin', '1.0.0', 'actor');
      registry.register(plugin);

      const retrieved = registry.get('test-plugin');

      expect(retrieved).toBe(plugin);
      expect(retrieved?.id).toBe('test-plugin');
      expect(retrieved?.name).toBe('Test Plugin');
    });

    it('should return undefined for non-existent plugin', () => {
      const retrieved = registry.get('non-existent');

      expect(retrieved).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return all plugins when no type specified', () => {
      const plugin1 = new MockPlugin('plugin-1', 'Plugin 1', '1.0.0', 'actor');
      const plugin2 = new MockPlugin('plugin-2', 'Plugin 2', '1.0.0', 'action');
      const plugin3 = new MockPlugin('plugin-3', 'Plugin 3', '1.0.0', 'guard');

      registry.register(plugin1);
      registry.register(plugin2);
      registry.register(plugin3);

      const allPlugins = registry.getAll();

      expect(allPlugins).toHaveLength(3);
      expect(allPlugins).toContain(plugin1);
      expect(allPlugins).toContain(plugin2);
      expect(allPlugins).toContain(plugin3);
    });

    it('should return plugins filtered by type', () => {
      const actorPlugin = new MockPlugin('actor-1', 'Actor Plugin', '1.0.0', 'actor');
      const actionPlugin = new MockPlugin('action-1', 'Action Plugin', '1.0.0', 'action');
      const guardPlugin = new MockPlugin('guard-1', 'Guard Plugin', '1.0.0', 'guard');

      registry.register(actorPlugin);
      registry.register(actionPlugin);
      registry.register(guardPlugin);

      const actorPlugins = registry.getAll('actor');
      const actionPlugins = registry.getAll('action');
      const guardPlugins = registry.getAll('guard');

      expect(actorPlugins).toHaveLength(1);
      expect(actorPlugins[0]).toBe(actorPlugin);

      expect(actionPlugins).toHaveLength(1);
      expect(actionPlugins[0]).toBe(actionPlugin);

      expect(guardPlugins).toHaveLength(1);
      expect(guardPlugins[0]).toBe(guardPlugin);
    });

    it('should return empty array when no plugins match type', () => {
      const plugin = new MockPlugin('test-plugin', 'Test Plugin', '1.0.0', 'actor');
      registry.register(plugin);

      const actionPlugins = registry.getAll('action');

      expect(actionPlugins).toHaveLength(0);
    });
  });

  describe('isRegistered', () => {
    it('should return true for registered plugin', () => {
      const plugin = new MockPlugin('test-plugin', 'Test Plugin', '1.0.0', 'actor');
      registry.register(plugin);

      expect(registry.isRegistered('test-plugin')).toBe(true);
    });

    it('should return false for non-registered plugin', () => {
      expect(registry.isRegistered('non-existent')).toBe(false);
    });
  });

  describe('getPluginCount', () => {
    it('should return correct count of registered plugins', () => {
      expect(registry.getPluginCount()).toBe(0);

      const plugin1 = new MockPlugin('plugin-1', 'Plugin 1', '1.0.0', 'actor');
      registry.register(plugin1);
      expect(registry.getPluginCount()).toBe(1);

      const plugin2 = new MockPlugin('plugin-2', 'Plugin 2', '1.0.0', 'action');
      registry.register(plugin2);
      expect(registry.getPluginCount()).toBe(2);

      registry.unregister('plugin-1');
      expect(registry.getPluginCount()).toBe(1);
    });
  });

  describe('clear', () => {
    it('should clear all plugins and call destroy on each', async () => {
      const plugin1 = new MockPlugin('plugin-1', 'Plugin 1', '1.0.0', 'actor');
      const plugin2 = new MockPlugin('plugin-2', 'Plugin 2', '1.0.0', 'action');
      
      const destroySpy1 = vi.spyOn(plugin1, 'destroy');
      const destroySpy2 = vi.spyOn(plugin2, 'destroy');

      registry.register(plugin1);
      registry.register(plugin2);

      registry.clear();

      expect(registry.getPluginCount()).toBe(0);
      expect(destroySpy1).toHaveBeenCalled();
      expect(destroySpy2).toHaveBeenCalled();
    });

    it('should handle clear on empty registry', () => {
      expect(() => registry.clear()).not.toThrow();
      expect(registry.getPluginCount()).toBe(0);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complex plugin management workflow', () => {
      // Register multiple plugins
      const actorPlugin = new MockPlugin('http-actor', 'HTTP Actor', '1.0.0', 'actor');
      const actionPlugin = new MockPlugin('http-action', 'HTTP Action', '1.0.0', 'action');
      const guardPlugin = new MockPlugin('json-guard', 'JSON Guard', '1.0.0', 'guard');

      registry.register(actorPlugin);
      registry.register(actionPlugin);
      registry.register(guardPlugin);

      expect(registry.getPluginCount()).toBe(3);
      expect(registry.getAll('actor')).toHaveLength(1);
      expect(registry.getAll('action')).toHaveLength(1);
      expect(registry.getAll('guard')).toHaveLength(1);

      // Unregister one plugin
      registry.unregister('http-action');

      expect(registry.getPluginCount()).toBe(2);
      expect(registry.isRegistered('http-action')).toBe(false);
      expect(registry.isRegistered('http-actor')).toBe(true);
      expect(registry.isRegistered('json-guard')).toBe(true);

      // Get specific plugin
      const retrievedActor = registry.get('http-actor');
      expect(retrievedActor).toBe(actorPlugin);

      // Clear all
      registry.clear();
      expect(registry.getPluginCount()).toBe(0);
      expect(registry.getAll()).toHaveLength(0);
    });

    it('should handle plugin lifecycle correctly', async () => {
      const plugin = new MockPlugin('lifecycle-plugin', 'Lifecycle Plugin', '1.0.0', 'actor');
      const initSpy = vi.spyOn(plugin, 'initialize');
      const destroySpy = vi.spyOn(plugin, 'destroy');

      // Register plugin
      registry.register(plugin);
      expect(registry.isRegistered('lifecycle-plugin')).toBe(true);

      // Unregister plugin (should call destroy)
      registry.unregister('lifecycle-plugin');
      expect(destroySpy).toHaveBeenCalled();
      expect(registry.isRegistered('lifecycle-plugin')).toBe(false);
    });
  });
});
