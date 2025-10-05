/**
 * Plugin Manager Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DefaultPluginManager } from './plugin-manager';
import { DefaultPluginRegistry } from './plugin-registry';
import type { PluginConfig } from '../types';

describe('DefaultPluginManager', () => {
  let manager: DefaultPluginManager;
  let registry: DefaultPluginRegistry;

  beforeEach(() => {
    registry = new DefaultPluginRegistry();
    manager = new DefaultPluginManager(registry);
  });

  describe('constructor', () => {
    it('should create manager with default registry', () => {
      const defaultManager = new DefaultPluginManager();
      expect(defaultManager.registry).toBeDefined();
      expect(defaultManager.registry).toBeInstanceOf(DefaultPluginRegistry);
    });

    it('should create manager with provided registry', () => {
      expect(manager.registry).toBe(registry);
    });
  });

  describe('loadPlugin', () => {
    it('should throw error for unimplemented plugin creation', async () => {
      const config: PluginConfig = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        type: 'actor'
      };

      await expect(manager.loadPlugin(config)).rejects.toThrow(
        "Plugin creation not implemented for 'test-plugin'. Plugins must be implemented separately."
      );
    });

    it('should check dependencies before loading', async () => {
      const config: PluginConfig = {
        id: 'dependent-plugin',
        name: 'Dependent Plugin',
        version: '1.0.0',
        type: 'actor',
        dependencies: ['missing-plugin']
      };

      await expect(manager.loadPlugin(config)).rejects.toThrow(
        "Dependency 'missing-plugin' not found for plugin 'dependent-plugin'"
      );
    });

    it('should return existing plugin if already loaded', async () => {
      // Mock the createPluginInstance method to avoid the error
      const mockPlugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        type: 'actor' as const,
        initialize: vi.fn().mockResolvedValue(undefined),
        destroy: vi.fn().mockResolvedValue(undefined)
      };

      vi.spyOn(manager as any, 'createPluginInstance').mockResolvedValue(mockPlugin);

      const config: PluginConfig = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        type: 'actor'
      };

      // First load
      const plugin1 = await manager.loadPlugin(config);
      expect(plugin1).toBe(mockPlugin);

      // Second load should return the same plugin
      const plugin2 = await manager.loadPlugin(config);
      expect(plugin2).toBe(mockPlugin);
      expect(plugin2).toBe(plugin1);
    });
  });

  describe('unloadPlugin', () => {
    it('should throw error for non-existent plugin', async () => {
      await expect(manager.unloadPlugin('non-existent')).rejects.toThrow(
        "Plugin 'non-existent' not found"
      );
    });

    it('should unload plugin successfully', async () => {
      const mockPlugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        type: 'actor' as const,
        initialize: vi.fn().mockResolvedValue(undefined),
        destroy: vi.fn().mockResolvedValue(undefined)
      };

      registry.register(mockPlugin);

      await manager.unloadPlugin('test-plugin');

      expect(registry.isRegistered('test-plugin')).toBe(false);
    });

    it('should check for dependents before unloading', async () => {
      const mockPlugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        type: 'actor' as const,
        initialize: vi.fn().mockResolvedValue(undefined),
        destroy: vi.fn().mockResolvedValue(undefined)
      };

      registry.register(mockPlugin);

      // Mock findDependents to return dependents
      vi.spyOn(manager as any, 'findDependents').mockReturnValue(['dependent-plugin']);

      await expect(manager.unloadPlugin('test-plugin')).rejects.toThrow(
        "Cannot unload plugin 'test-plugin': dependent-plugin depend on it"
      );
    });
  });

  describe('getPlugin', () => {
    it('should return registered plugin', () => {
      const mockPlugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        type: 'actor' as const,
        initialize: vi.fn().mockResolvedValue(undefined),
        destroy: vi.fn().mockResolvedValue(undefined)
      };

      registry.register(mockPlugin);

      const retrieved = manager.getPlugin('test-plugin');

      expect(retrieved).toBe(mockPlugin);
    });

    it('should return undefined for non-existent plugin', () => {
      const retrieved = manager.getPlugin('non-existent');

      expect(retrieved).toBeUndefined();
    });
  });

  describe('getPluginsByType', () => {
    it('should return plugins filtered by type', () => {
      const actorPlugin = {
        id: 'actor-1',
        name: 'Actor Plugin',
        version: '1.0.0',
        type: 'actor' as const,
        initialize: vi.fn().mockResolvedValue(undefined),
        destroy: vi.fn().mockResolvedValue(undefined)
      };

      const actionPlugin = {
        id: 'action-1',
        name: 'Action Plugin',
        version: '1.0.0',
        type: 'action' as const,
        initialize: vi.fn().mockResolvedValue(undefined),
        destroy: vi.fn().mockResolvedValue(undefined)
      };

      registry.register(actorPlugin);
      registry.register(actionPlugin);

      const actorPlugins = manager.getPluginsByType('actor');
      const actionPlugins = manager.getPluginsByType('action');

      expect(actorPlugins).toHaveLength(1);
      expect(actorPlugins[0]).toBe(actorPlugin);

      expect(actionPlugins).toHaveLength(1);
      expect(actionPlugins[0]).toBe(actionPlugin);
    });

    it('should return empty array for non-existent type', () => {
      const plugins = manager.getPluginsByType('non-existent');

      expect(plugins).toHaveLength(0);
    });
  });

  describe('private methods', () => {
    describe('createPluginInstance', () => {
      it('should throw error indicating plugins must be implemented', async () => {
        const config: PluginConfig = {
          id: 'test-plugin',
          name: 'Test Plugin',
          version: '1.0.0',
          type: 'actor'
        };

        await expect((manager as any).createPluginInstance(config)).rejects.toThrow(
          "Plugin creation not implemented for 'test-plugin'. Plugins must be implemented separately."
        );
      });
    });

    describe('findDependents', () => {
      it('should return empty array for plugins with no dependents', () => {
        const dependents = (manager as any).findDependents('test-plugin');

        expect(dependents).toEqual([]);
      });
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete plugin lifecycle', async () => {
      const mockPlugin = {
        id: 'lifecycle-plugin',
        name: 'Lifecycle Plugin',
        version: '1.0.0',
        type: 'actor' as const,
        initialize: vi.fn().mockResolvedValue(undefined),
        destroy: vi.fn().mockResolvedValue(undefined)
      };

      // Mock createPluginInstance to return our mock plugin
      vi.spyOn(manager as any, 'createPluginInstance').mockResolvedValue(mockPlugin);

      const config: PluginConfig = {
        id: 'lifecycle-plugin',
        name: 'Lifecycle Plugin',
        version: '1.0.0',
        type: 'actor'
      };

      // Load plugin
      const loadedPlugin = await manager.loadPlugin(config);
      expect(loadedPlugin).toBe(mockPlugin);
      expect(mockPlugin.initialize).toHaveBeenCalled();
      expect(registry.isRegistered('lifecycle-plugin')).toBe(true);

      // Get plugin
      const retrievedPlugin = manager.getPlugin('lifecycle-plugin');
      expect(retrievedPlugin).toBe(mockPlugin);

      // Get plugins by type
      const actorPlugins = manager.getPluginsByType('actor');
      expect(actorPlugins).toHaveLength(1);
      expect(actorPlugins[0]).toBe(mockPlugin);

      // Unload plugin
      await manager.unloadPlugin('lifecycle-plugin');
      expect(registry.isRegistered('lifecycle-plugin')).toBe(false);
    });

    it('should handle dependency resolution', async () => {
      const dependencyPlugin = {
        id: 'dependency-plugin',
        name: 'Dependency Plugin',
        version: '1.0.0',
        type: 'actor' as const,
        initialize: vi.fn().mockResolvedValue(undefined),
        destroy: vi.fn().mockResolvedValue(undefined)
      };

      const dependentPlugin = {
        id: 'dependent-plugin',
        name: 'Dependent Plugin',
        version: '1.0.0',
        type: 'action' as const,
        initialize: vi.fn().mockResolvedValue(undefined),
        destroy: vi.fn().mockResolvedValue(undefined)
      };

      // Mock createPluginInstance for both plugins
      vi.spyOn(manager as any, 'createPluginInstance')
        .mockResolvedValueOnce(dependencyPlugin)
        .mockResolvedValueOnce(dependentPlugin);

      // Load dependency first
      const dependencyConfig: PluginConfig = {
        id: 'dependency-plugin',
        name: 'Dependency Plugin',
        version: '1.0.0',
        type: 'actor'
      };

      await manager.loadPlugin(dependencyConfig);

      // Load dependent plugin
      const dependentConfig: PluginConfig = {
        id: 'dependent-plugin',
        name: 'Dependent Plugin',
        version: '1.0.0',
        type: 'action',
        dependencies: ['dependency-plugin']
      };

      await manager.loadPlugin(dependentConfig);

      expect(registry.isRegistered('dependency-plugin')).toBe(true);
      expect(registry.isRegistered('dependent-plugin')).toBe(true);
    });
  });
});
