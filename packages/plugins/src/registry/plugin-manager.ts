/**
 * Plugin Manager
 * Main orchestrator for plugin lifecycle management
 */

import type { BasePlugin, PluginConfig, PluginManager, PluginRegistry, PluginType } from '../types';
import { DefaultPluginRegistry } from '../registry/plugin-registry';

export class DefaultPluginManager implements PluginManager {
  public registry: PluginRegistry;

  constructor(registry?: PluginRegistry) {
    this.registry = registry || new DefaultPluginRegistry();
  }

  async loadPlugin(config: PluginConfig): Promise<BasePlugin> {
    // Check if plugin is already loaded
    if (this.registry.isRegistered(config.id)) {
      return this.registry.get(config.id)!;
    }

    // Check dependencies
    if (config.dependencies) {
      for (const depId of config.dependencies) {
        if (!this.registry.isRegistered(depId)) {
          throw new Error(`Dependency '${depId}' not found for plugin '${config.id}'`);
        }
      }
    }

    // Create plugin instance (this would be dynamic loading in real implementation)
    const plugin = await this.createPluginInstance(config);
    
    // Initialize plugin
    await plugin.initialize();
    
    // Register plugin
    this.registry.register(plugin);
    
    return plugin;
  }

  async unloadPlugin(pluginId: string): Promise<void> {
    const plugin = this.registry.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin '${pluginId}' not found`);
    }

    // Check if other plugins depend on this one
    const dependents = this.findDependents(pluginId);
    if (dependents.length > 0) {
      throw new Error(`Cannot unload plugin '${pluginId}': ${dependents.join(', ')} depend on it`);
    }

    // Unregister plugin
    this.registry.unregister(pluginId);
  }

  getPlugin(pluginId: string): BasePlugin | undefined {
    return this.registry.get(pluginId);
  }

  getPluginsByType(type: PluginType): BasePlugin[] {
    return this.registry.getAll(type);
  }

  private async createPluginInstance(config: PluginConfig): Promise<BasePlugin> {
    // This is a placeholder - in real implementation, this would dynamically load plugins
    // For now, we'll throw an error indicating plugins need to be implemented
    throw new Error(`Plugin creation not implemented for '${config.id}'. Plugins must be implemented separately.`);
  }

  private findDependents(_pluginId: string): string[] {
    const dependents: string[] = [];
    const allPlugins = this.registry.getAll();
    
    for (const _plugin of allPlugins) {
      // This would check plugin dependencies in real implementation
      // For now, return empty array
    }
    
    return dependents;
  }
}
