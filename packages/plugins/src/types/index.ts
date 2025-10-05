/**
 * Plugin System Types
 * Core interfaces for the plugin architecture
 */

export interface PluginConfig {
  id: string;
  name: string;
  version: string;
  description?: string;
  type: PluginType;
  dependencies?: string[];
}

export type PluginType = 'actor' | 'action' | 'guard' | 'ui-component' | 'tool';

export interface BasePlugin {
  id: string;
  name: string;
  version: string;
  type: PluginType;
  initialize(): Promise<void>;
  destroy(): Promise<void>;
}

export interface ActorPlugin extends BasePlugin {
  type: 'actor';
  createActor(config: ActorPluginConfig): Promise<unknown>;
}

export interface ActionPlugin extends BasePlugin {
  type: 'action';
  execute(config: ActionPluginConfig, context: Record<string, unknown>, event: Record<string, unknown>): Promise<unknown>;
}

export interface GuardPlugin extends BasePlugin {
  type: 'guard';
  evaluate(config: GuardPluginConfig, context: Record<string, unknown>, event: Record<string, unknown>): Promise<boolean>;
}

export interface UIComponentPlugin extends BasePlugin {
  type: 'ui-component';
  render(config: UIComponentPluginConfig, props: Record<string, unknown>): Promise<unknown>;
}

export interface ToolPlugin extends BasePlugin {
  type: 'tool';
  execute(config: ToolPluginConfig, input: unknown): Promise<unknown>;
}

export interface ActorPluginConfig {
  src: string;
  input?: unknown;
  onDone?: string;
  onError?: string;
}

export interface ActionPluginConfig {
  target?: string;
  value?: unknown;
  message?: string;
  event?: string;
  data?: unknown;
}

export interface GuardPluginConfig {
  expression?: unknown;
  condition?: string;
}

export interface UIComponentPluginConfig {
  componentName: string;
  props?: Record<string, unknown>;
  fallback?: unknown;
}

export interface ToolPluginConfig {
  toolName: string;
  parameters?: Record<string, unknown>;
}

export interface PluginRegistry {
  register(plugin: BasePlugin): void;
  unregister(pluginId: string): void;
  get(pluginId: string): BasePlugin | undefined;
  getAll(type?: PluginType): BasePlugin[];
  isRegistered(pluginId: string): boolean;
}

export interface PluginManager {
  registry: PluginRegistry;
  loadPlugin(config: PluginConfig): Promise<BasePlugin>;
  unloadPlugin(pluginId: string): Promise<void>;
  getPlugin(pluginId: string): BasePlugin | undefined;
  getPluginsByType(type: PluginType): BasePlugin[];
}
