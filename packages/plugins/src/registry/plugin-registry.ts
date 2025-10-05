/**
 * Plugin Registry
 * Manages plugin registration and retrieval
 */

import type { BasePlugin, PluginRegistry, PluginType } from '../types';

export class DefaultPluginRegistry implements PluginRegistry {
  private plugins: Map<string, BasePlugin> = new Map();

  register(plugin: BasePlugin): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin with id '${plugin.id}' is already registered`);
    }
    this.plugins.set(plugin.id, plugin);
  }

  unregister(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.destroy();
      this.plugins.delete(pluginId);
    }
  }

  get(pluginId: string): BasePlugin | undefined {
    return this.plugins.get(pluginId);
  }

  getAll(type?: PluginType): BasePlugin[] {
    const allPlugins = Array.from(this.plugins.values());
    if (type) {
      return allPlugins.filter(plugin => plugin.type === type);
    }
    return allPlugins;
  }

  isRegistered(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  getPluginCount(): number {
    return this.plugins.size;
  }

  clear(): void {
    for (const plugin of this.plugins.values()) {
      plugin.destroy();
    }
    this.plugins.clear();
  }
}
