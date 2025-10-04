// ============================================================================
// SISTEMA DE PLUGINS/TLS MODULAR PARA XFLOWS
// ============================================================================

import type { ActorRefFrom, AnyActorSystem } from 'xstate';
import type { RulesLogic } from 'json-logic-js';

/**
 * 🌐 Plugin Registry Interface
 * Central repository para todos los plugins disponibles
 */
export interface PluginRegistry {
  // Core categorías de plugins
  actors: Record<string, ActorPluginConfig>;
  ui: Record<string, UIPluginConfig>;
  tools: Record<string, ToolPluginConfig>;
  guards: Record<string, GuardPluginConfig>;
  actions: Record<string, ActionPluginConfig>;
  
  // Metadata de plugins
  metadata: Record<string, PluginMetadata>;
}

/**
 * 📋 Plugin Metadata Base
 */
export interface PluginMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: 'actor' | 'ui' | 'tool' | 'guard' | 'action';
  tags: string[];
  dependencies?: string[];
  configSchema?: any; // JSON Schema para validación
  examples?: PluginExample[];
}

/**
 * 🎯 Plugin Example
 */
export interface PluginExample {
  title: string;
  description: string;
  code: string;
  context?: Record<string, unknown>;
}

// ============================================================================
// ACTOR PLUGINS
// ============================================================================

/**
 * 🎭 Actor Plugin Configuration
 */
export interface ActorPluginConfig {
  type: 'actor';
  name: string;
  description: string;
  configSchema: any;
  factory: (config: ActorPluginConfig) => ActorRefFrom<any>;
  defaultConfig?: Record<string, unknown>;
  examples?: ActorExample[];
}

/**
 * 📝 Actor Example
 */
export interface ActorExample {
  title: string;
  description: string;
  config: any;
  expectedOutput?: any;
}

/**
 * 🌐 HTTP Actor Plugin (Built-in)
 */
export interface HTTPActorConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  auth?: {
    type: 'bearer' | 'basic' | 'api-key';
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
    apiKeyHeader?: string;
  };
}

/**
 * 🔄 Polling Actor Plugin
 */
export interface PollingActorConfig {
  url: string;
  interval: number;
  headers?: Record<string, string>;
  stopCondition?: RulesLogic;
  maxAttempts?: number;
}

/**
 * 📱 WebSocket Actor Plugin
 */
export interface WebSocketActorConfig {
  url: string;
  protocols?: string[];
  onOpen?: string;
  onMessage?: string;
  onClose?: string;
  onError?: string;
  heartbeat?: {
    interval: number;
    message: string;
  };
}

// ============================================================================
// UI PLUGINS
// ============================================================================

/**
 * 🎨 UI Plugin Configuration
 */
export interface UIPluginConfig {
  type: 'ui';
  name: string;
  description: string;
  component: React.ComponentType<any>;
  configSchema: any;
  defaultConfig?: Record<string, unknown>;
  examples?: UIExample[];
}

/**
 * 🖼️ UI Example
 */
export interface UIExample {
  title: string;
  description: string;
  config: any;
  mockData?: Record<string, unknown>;
}

/**
 * 📊 Chart UI Plugin
 */
export interface ChartUIPluginConfig {
  type: 'line' | 'bar' | 'pie' | 'donut' | 'area' | 'scatter';
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
    }>;
  };
  options?: {
    responsive: boolean;
    plugins?: {
      legend?: { position: string };
      title?: { text: string };
    };
  };
}

/**
 * 🗂️ Table UI Plugin
 */
export interface TableUIPluginConfig {
  columns: Array<{
    key: string;
    title: string;
    type: 'text' | 'number' | 'date' | 'currency' | 'status' | 'action';
    sortable?: boolean;
    filterable?: boolean;
    render?: (value: any, row: any) => React.ReactNode;
  }>;
  data: Record<string, any>[];
  pagination?: boolean;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 🎛️ Form UI Plugin
 */
export interface FormUIPluginConfig {
  fields: Array<{
    name: string;
    type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'date';
    label: string;
    placeholder?: string;
    required?: boolean;
    validation?: RulesLogic;
    options?: Array<{ value: any; label: string }>;
    dependsOn?: string[];
    visible?: RulesLogic;
  }>;
  submitAction?: string;
  resetAction?: string;
  layout?: 'vertical' | 'horizontal' | 'grid';
}

// ============================================================================
// TOOL PLUGINS
// ============================================================================

/**
 * 🔧 Tool Plugin Configuration
 */
export interface ToolPluginConfig {
  type: 'tool';
  name: string;
  description: string;
  configSchema: any;
  factory: (config: ToolPluginConfig) => ToolInstance;
  defaultConfig?: Record<string, unknown>;
  examples?: ToolExample[];
}

/**
 * 🛠️ Tool Instance Interface
 */
export interface ToolInstance {
  id: string;
  name: string;
  description: string;
  execute: (context: Record<string, unknown>, config: any) => Promise<any>;
  validate?: (config: any) => boolean;
  reset?: () => void;
  destroy?: () => void;
}

/**
 * 🧮 Calculator Tool Plugin
 */
export interface CalculatorToolConfig {
  operations: Array<{
    name: string;
    operator: '+' | '-' | '*' | '/' | '%' | '^';
    fields: string[];
    resultField: string;
  }>;
  precision?: number;
}

/**
 * 📝 Text Processing Tool Plugin
 */
export interface TextProcessingToolConfig {
  operations: Array<{
    name: string;
    type: 'uppercase' | 'lowercase' | 'capitalize' | 'trim' | 'replace' | 'split' | 'join';
    input: string;
    output: string;
    options?: any;
  }>;
}

/**
 * 📊 Data Transform Tool Plugin
 */
export interface DataTransformToolConfig {
  operations: Array<{
    name: string;
    type: 'map' | 'filter' | 'reduce' | 'group' | 'sort' | 'aggregate';
    input: string;
    output: string;
    config: any;
  }>;
}

// ============================================================================
// GUARD PLUGINS
// ============================================================================

/**
 * 🛡️ Guard Plugin Configuration
 */
export interface GuardPluginConfig {
  type: 'guard';
  name: string;
  description: string;
  configSchema: any;
  factory: (config: GuardPluginConfig) => (context: any, params: any) => boolean;
  defaultConfig?: Record<string, unknown>;
  examples?: GuardExample[];
}

/**
 * 🔍 Guard Example
 */
export interface GuardExample {
  title: string;
  description: string;
  config: any;
  testContext: Record<string, unknown>;
  expectedResult: boolean;
}

/**
 * 🕒 Time-based Guard Plugin
 */
export interface TimeGuardConfig {
  condition: 'before' | 'after' | 'between' | 'weekday' | 'weekend' | 'businessHours';
  time?: string;
  startTime?: string;
  endTime?: string;
  timezone?: string;
}

/**
 * 📍 Location-based Guard Plugin
 */
export interface LocationGuardConfig {
  condition: 'country' | 'region' | 'city' | 'radius' | 'coordinates';
  value: string | number;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

// ============================================================================
// ACTION PLUGINS
// ============================================================================

/**
 * ⚡ Action Plugin Configuration
 */
export interface ActionPluginConfig {
  type: 'action';
  name: string;
  description: string;
  configSchema: any;
  factory: (config: ActionPluginConfig) => (context: any, params: any) => any;
  defaultConfig?: Record<string, unknown>;
  examples?: ActionExample[];
}

/**
 * 🎯 Action Example
 */
export interface ActionExample {
  title: string;
  description: string;
  config: any;
  inputContext: Record<string, unknown>;
  expectedOutput: Record<string, unknown>;
}

/**
 * 📧 Notification Action Plugin
 */
export interface NotificationActionConfig {
  type: 'email' | 'sms' | 'push' | 'webhook' | 'slack';
  recipients: string[];
  template: string;
  data?: Record<string, unknown>;
}

/**
 * 💾 Storage Action Plugin
 */
export interface StorageActionConfig {
  type: 'localStorage' | 'sessionStorage' | 'indexedDB' | 'cookie' | 'memory';
  operation: 'get' | 'set' | 'remove' | 'clear';
  key: string;
  value?: any;
  expiration?: number;
}

// ============================================================================
// PLUGIN SYSTEM INTERFACE
// ============================================================================

/**
 * 🔌 Plugin System Interface
 */
export interface PluginSystem {
  // Registry management
  registerPlugin(plugin: PluginMetadata): void;
  unregisterPlugin(id: string): void;
  getPlugin(id: string): PluginMetadata | undefined;
  listPlugins(category?: string): PluginMetadata[];
  
  // Plugin instantiation
  createActor(id: string, config: any): ActorRefFrom<any>;
  createUI(id: string, config: any): React.ComponentType<any>;
  createTool(id: string, config: any): ToolInstance;
  createGuard(id: string, config: any): (context: any, params: any) => boolean;
  createAction(id: string, config: any): (context: any, params: any) => any;
  
  // Plugin discovery
  discoverPlugins(): Promise<PluginMetadata[]>;
  installPlugin(id: string, version?: string): Promise<void>;
  updatePlugin(id: string): Promise<void>;
}

/**
 * 🎯 Plugin Context Interface
 */
export interface PluginContext {
  // Core services
  logger: Logger;
  http: HTTPClient;
  storage: StorageClient;
  notifications: NotificationClient;
  
  // Flow context
  flowState: any;
  userContext: Record<string, unknown>;
  environment: 'development' | 'staging' | 'production';
  
  // Plugin utilities
  config: (key: string, defaultValue?: any) => any;
  event: (name: string, data?: any) => void;
  state: (key: string, value?: any) => any;
}

/**
 * 📝 Logger Interface
 */
export interface Logger {
  debug: (message: string, data?: any) => void;
  info: (message: string, data?: any) => void;
  warn: (message: string, data?: any) => void;
  error: (message: string, data?: any) => void;
}

/**
 * 🌐 HTTP Client Interface
 */
export interface HTTPClient {
  get: (url: string, options?: any) => Promise<any>;
  post: (url: string, data?: any, options?: any) => Promise<any>;
  put: (url: string, data?: any, options?: any) => Promise<any>;
  delete: (url: string, options?: any) => Promise<any>;
}

/**
 * 💾 Storage Client Interface
 */
export interface StorageClient {
  get: (key: string) => Promise<any>;
  set: (key: string; value: any) => Promise<void>;
  remove: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}

/**
 * 📱 Notification Client Interface
 */
export interface NotificationClient {
  show: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  subscribe: (event: string, callback: (data: any) => void) => void;
  unsubscribe: (event: string, callback: (data: any) => void) => void;
}
