import React from 'react';
import { fromPromise } from 'xstate';
import type { RulesLogic } from 'json-logic-js';
import {
  PluginRegistry,
  PluginSystem,
  PluginContext,
  PluginMetadata,
  ActorPluginConfig,
  UIPluginConfig,
  ToolPluginConfig,
  GuardPluginConfig,
  ActionPluginConfig,
  HTTPActorConfig,
  ChartUIPluginConfig,
  TableUIPluginConfig,
  FormUIPluginConfig,
  CalculatorToolConfig,
  TextProcessingToolConfig,
  NotificationActionConfig,
  StorageActionConfig,
  Logger,
  HTTPClient,
  StorageClient,
  NotificationClient
} from './types';

/**
 * 🔌 Plugin System Implementation
 * Sistema modular para extensión de XFlows con plugins
 */
export class XFlowsPluginSystem implements PluginSystem {
  private registry: PluginRegistry = {
    actors: {},
    ui: {},
    tools: {},
    guards: {},
    actions: {},
    metadata: {}
  };

  private context: PluginContext;
  private logger: Logger;

  constructor(context?: Partial<PluginContext>) {
    this.context = this.defaultContext(context);
    this.logger = this.context.logger;
    
    // Register built-in plugins
    this.registerBuiltInPlugins();
    
    this.logger.info('🔌 Plugin System initialized');
  }

  // ============================================================================
  // REGISTRY MANAGEMENT
  // ============================================================================

  registerPlugin(plugin: PluginMetadata): void {
    this.logger.info(`📝 Registering plugin on: ${plugin.id} v${plugin.version}`);
    
    if (this.registry.metadata[plugin.id]) {
      this.logger.warn(`⚠️ Plugin ${plugin.id} already exists, overwriting`);
    }

    this.registry.metadata[plugin.id] = plugin;
    
    // Add to appropriate category registry
    switch (plugin.category) {
      case 'actor':
        // Handler loaded dynamically
        break;
      case 'ui':
        // Handler loaded dynamically
        break;
      case 'tool':
        // Handler loaded dynamically
        break;
      case 'guard':
        this.registerBuiltInGuard(plugin.id);
        break;
      case 'action':
        this.registerBuiltInAction(plugin.id);
        break;
    }
  }

  unregisterPlugin(id: string): void {
    this.logger.info(`🗑️ Unregistering plugin: ${id}`);
    
    const plugin = this.registry.metadata[id];
    if (!plugin) {
      this.logger.warn(`⚠️ Plugin ${id} not found`);
      return;
    }

    delete this.registry.metadata[id];
    
    // Remove from category registry
    switch (plugin.category) {
      case 'actor':
        delete this.registry.actors[id];
        break;
      case 'ui':
        delete this.registry.ui[id];
        break;
      case 'tool':
        delete this.registry.tools[id];
        break;
      case 'guard':
        delete this.registry.guards[id];
        break;
      case 'action':
        delete this.registry.actions[id];
        break;
    }
  }

  getPlugin(id: string): PluginMetadata | undefined {
    return this.registry.metadata[id];
  }

  listPlugins(category?: string): PluginMetadata[] {
    if (category) {
      return Object.values(this.registry.metadata)
        .filter(plugin => plugin.category === category);
    }
    return Object.values(this.registry.metadata);
  }

  // ============================================================================
  // PLUGIN INSTANTIATION
  // ============================================================================

  createActor(id: string, config: any) {
    const plugin = this.registry.actors[id];
    if (!plugin) {
      throw new Error(`❌ Actor plugin '${id}' not found`);
    }

    this.logger.info(`🎭 Creating actor: ${id}`);
    return plugin.factory(config);
  }

  createUI(id: string, config: any): React.ComponentType<any> {
    const plugin = this.registry.ui[id];
    if (!plugin) {
      throw new Error(`❌ UI plugin '${id}' not found`);
    }

    this.logger.info(`🎨 Creating UI component: ${id}`);
    
    // Create component with injected context
    return (props: any) => {
      const Component = plugin.component;
      return React.createElement(Component, {
        ...props,
        ...config,
        pluginContext: this.context
      });
    };
  }

  createTool(id: string, config: any) {
    const plugin = this.registry.tools[id];
    if (!plugin) {
      throw new Error(`❌ Tool plugin '${id}' not found`);
    }

    this.logger.info(`🔧 Creating tool: ${id}`);
    return plugin.factory(config);
  }

  createGuard(id: string, config: any): (context: any, params: any) => boolean {
    const plugin = this.registry.guards[id];
    if (!plugin) {
      throw new Error(`❌ Guard plugin '${id}' not found`);
    }

    this.logger.info(`🛡️ Creating guard: ${id}`);
    return plugin.factory(config);
  }

  createAction(id: string, config: any): (context: any, params: any) => any {
    const plugin = this.registry.actions[id];
    if (!plugin) {
      throw new Error(`❌ Action plugin '${id}' not found`);
    }

    this.logger.info(`⚡ Creating action: ${id}`);
    return plugin.factory(config);
  }

  // ============================================================================
  // PLUGIN DISCOVERY & INSTALLATION
  // ============================================================================

  async discoverPlugins(): Promise<PluginMetadata[]> {
    this.logger.info('🔍 Discovering available plugins...');
    
    // In a real implementation, this would scan npm registry or plugin store
    const discoveredPlugins: PluginMetadata[] = [
      {
        id: 'aws-s3-tool',
        name: 'AWS S3 Upload Tool',
        description: 'Upload files to AWS S3 buckets',
        version: '1.2.0',
        author: 'XFlows Team',
        category: 'tool',
        tags: ['aws', 's3', 'upload', 'storage'],
        examples: [
          {
            title: 'Upload document',
            description: 'Upload a PDF document to S3',
            code: JSON.stringify({
              bucket: 'my-bucket',
              key: 'documents/{{context.userId}}/{{context.filename}}',
              file: '{{context.file}}'
            })
          }
        ]
      },
      {
        id: 'google-sheets-ui',
        name: 'Google Sheets Table',
        description: 'Display data in Google Sheets-like table',
        version: '2.1.0',
        author: 'XFlows Team',
        category: 'ui',
        tags: ['google', 'sheets', 'table', 'spreadsheet'],
        examples: [
          {
            title: 'Customer data table',
            description: 'Display customer records in editable table',
            code: JSON.stringify({
              columns: ['name', 'email', 'phone', 'status'],
              editable: true,
              filters: true,
              datasource: '{{context.customers}}'
            })
          }
        ]
      }
    ];

    this.logger.info(`✅ Discovered ${discoveredPlugins.length} plugins`);
    return discoveredPlugins;
  }

  async installPlugin(id: string, version?: string): Promise<void> {
    this.logger.info(`📦 Installing plugin: ${id}${version ? `@${version}` : ''}`);
    
    // In a real implementation, this would download and install from registry
    throw new Error('🔧 Plugin installation not implemented yet');
  }

  async updatePlugin(id: string): Promise<void> {
    this.logger.info(`🔄 Updating plugin: ${id}`);
    
    // In a real implementation, this would update existing plugin
    throw new Error('🔧 Plugin update not implemented yet');
  }

  // ============================================================================
  // BUILT-IN PLUGINS REGISTRATION
  // ============================================================================

  private registerBuiltInPlugins(): void {
    this.logger.info('🏗️ Registering built-in plugins...');

    // Register HTTP Actor
    this.registerHTTPActor();
    
    // Register UI Components
    this.registerUIComponents();
    
    // Register Tools
    this.registerTools();
    
    // Register Guards
    this.registerGuards();
    
    // Register Actions
    this.registerActions();
    
    this.logger.info('✅ Built-in plugins registered');
  }

  private registerHTTPActor(): void {
    const plugin: ActorPluginConfig = {
      type: 'actor',
      name: 'HTTP Request Actor',
      description: 'Make HTTP requests with retry logic and authentication',
      configSchema: {
        type: 'object',
        properties: {
          url: { type: 'string' },
          method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
          headers: { type: 'object' },
          body: { type: 'object' },
          timeout: { type: 'number', default: 30000 },
          retries: { type: 'number', default: 3 },
          retryDelay: { type: 'number', default: 1000 }
        },
        required: ['url', 'method']
      },
      factory: (config: HTTPActorConfig) => {
        return fromPromise(this.httpRequest(config));
      },
      examples: [
        {
          title: 'Get user profile',
          description: 'Fetch user data from API',
          config: {
            url: '/api/users/{{context.userId}}',
            method: 'GET',
            headers: { 'Authorization': 'Bearer {{context.token}}' }
          }
        }
      ]
    };

    this.registry.actors['http'] = plugin;
    this.registry.metadata['http'] = {
      id: 'http',
      name: 'HTTP Request Actor',
      description: 'Make HTTP requests with retry logic and authentication',
      version: '1.0.0',
      author: 'XFlows Team',
      category: 'actor',
      tags: ['http', 'api', 'request', 'network']
    };
  }

  private registerUIComponents(): void {
    // Chart UI Plugin
    const chartPlugin: UIPluginConfig = {
      type: 'ui',
      name: 'Chart Visualization',
      description: 'Display data in various chart types',
      component: (props: any) => React.createElement('div', { 
        className: 'chart-container',
        'data-plugin': 'chart',
        'data-config': JSON.stringify(props.config)
      }, `📊 Chart: ${props.config?.type || 'unknown'}`),
      configSchema: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['line', 'bar', 'pie', 'donut', 'area'] }
        }
      },
      examples: [
        {
          title: 'Sales Chart',
          description: 'Show sales over time',
          config: { type: 'line', data: '{{context.salesData}}' }
        }
      ]
    };

    // Table UI Plugin
    const tablePlugin: UIPluginConfig = {
      type: 'ui',
      name: 'Data Table',
      description: 'Display tabular data with sorting and filtering',
      component: (props: any) => React.createElement('div', { 
        className: 'table-container',
        'data-plugin': 'table',
        'data-columns': props.config?.columns?.length || 0,
        'data-rows': props.config?.data?.length || 0
      }, `📋 Table: ${props.config?.columns?.length || 0} columns, ${props.config?.data?.length || 0} rows`),
      configSchema: {
        type: 'object',
        properties: {
          columns: { type: 'array' },
          data: { type: 'array' },
          pagination: { type: 'boolean' }
        }
      }
    };

    this.registry.ui['chart'] = chartPlugin;
    this.registry.ui['table'] = tablePlugin;

    // Register metadata
    this.registry.metadata['chart'] = {
      id: 'chart', name: 'Chart Visualization', version: '1.0.0',
      author: 'XFlows Team', category: 'ui', tags: ['chart', 'visualization', 'data']
    };
    this.registry.metadata['table'] = {
      id: 'table', name: 'Data Table', version: '1.0.0',
      author: 'XFlows Team', category: 'ui', tags: ['table', 'data', 'grid']
    };
  }

  private registerTools(): void {
    // Calculator Tool
    const calculatorPlugin: ToolPluginConfig = {
      type: 'tool',
      name: 'Calculator Tool',
      description: 'Perform mathematical calculations on context data',
      configSchema: {
        type: 'object',
        properties: {
          operations: { type: 'array' },
          precision: { type: 'number', default: 2 }
        }
      },
      factory: (config: CalculatorToolConfig) => ({
        id: 'calculator',
        name: 'Calculator',
        description: 'Perform calculations',
        async execute(ctx: any, cfg: CalculatorToolConfig) {
          return cfg.operations.map(op => ({
            operation: op.name,
            result: this.calculateOperation(op, ctx)
          }));
        }
      })
    };

    this.registry.tools['calculator'] = calculatorPlugin;
    this.registry.metadata['calculator'] = {
      id: 'calculator', name: 'Calculator Tool', version: '1.0.0',
      author: 'XFlows Team', category: 'tool', tags: ['math', 'calculation', 'compute']
    };
  }

  private registerGuards(): void {
    // These are registered via registerBuiltInGuard
    this.registerBuiltInGuard('time-based');
    this.registerBuiltInGuard('location-based');
    this.registerBuiltInGuard('rate-limit');
  }

  private registerActions(): void {
    // These are registered via registerBuiltInAction
    this.registerBuiltInAction('notification');
    this.registerBuiltInAction('storage');
    this.registerBuiltInAction('analytics');
  }

  private registerBuiltInGuard(id: string): void {
    const guards: Record<string, GuardPluginConfig> = {
      'time-based': {
        type: 'guard',
        name: 'Time-based Guard',
        description: 'Check time-based conditions',
        configSchema: {
          type: 'object',
          properties: {
            condition: { type: 'string', enum: ['before', 'after', 'between', 'businessHours'] },
            time: { type: 'string' }
          }
        },
        factory: (config: any) => (ctx: any) => {
          const now = new Date();
          // Implementation would check actual time conditions
          return config.condition === 'businessHours' ? 
            now.getHours() >= 9 && now.getHours() <= 17 : true;
        }
      },
      'location-based': {
        type: 'guard',
        name: 'Location Guard',
        description: 'Check location-based conditions',
        configSchema: {
          type: 'object',
          properties: {
            country: { type: 'string' },
            region: { type: 'string' }
          }
        },
        factory: (config: any) => (ctx: any) => {
          return ctx.userLocation?.country === config.country;
        }
      },
      'rate-limit': {
        type: 'guard',
        name: 'Rate Limit Guard',
        description: 'Implement rate limiting',
        configSchema: {
          type: 'object',
          properties: {
            maxRequests: { type: 'number' },
            windowMs: { type: 'number' }
          }
        },
        factory: (config: any) => (ctx: any) => {
          // Implementation would track requests per user/IP
          return true; // Placeholder
        }
      }
    };

    const guard = guards[id];
    if (guard) {
      this.registry.guards[id] = guard;
      this.registry.metadata[id] = {
        id, name: guard.name, description: guard.description,
        version: '1.0.0', author: 'XFlows Team', category: 'guard',
        tags: ['guard', 'condition', 'validation']
      };
    }
  }

  private registerBuiltInAction(id: string): void {
    const actions: Record<string, ActionPluginConfig> = {
      'notification': {
        type: 'action',
        name: 'Send Notification',
        description: 'Send notifications via various channels',
        configSchema: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['email', 'sms', 'push', 'webhook'] },
            recipients: { type: 'array' },
            message: { type: 'string' }
          }
        },
        factory: (config: NotificationActionConfig) => async (ctx: any) => {
          this.context.notifications.show(`${config.type}: ${config.message}`, 'info');
          return { sent: true, timestamp: Date.now() };
        }
      },
      'storage': {
        type: 'action',
        name: 'Storage Action',
        description: 'Store/retrieve data from various storage systems',
        configSchema: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['localStorage', 'sessionStorage', 'cookie'] },
            operation: { type: 'string', enum: ['get', 'set', 'remove'] },
            key: { type: 'string' },
            value: { type: 'string' }
          }
        },
        factory: (config: StorageActionConfig) => async (ctx: any) => {
          if (config.operation === 'set') {
            await this.context.storage.set(config.key, config.value);
          } else if (config.operation === 'get') {
            return await this.context.storage.get(config.key);
          }
          return { success: true };
        }
      },
      'analytics': {
        type: 'action',
        name: 'Analytics Tracking',
        description: 'Track events and metrics',
        configSchema: {
          type: 'object',
          properties: {
            event: { type: 'string' },
            properties: { type: 'object' },
            userId: { type: 'string' }
          }
        },
        factory: (config: any) => async (ctx: any) => {
          this.logger.info(`📊 Analytics: ${config.event}`, config.properties);
          return { tracked: true };
        }
      }
    };

    const action = actions[id];
    if (action) {
      this.registry.actions[id] = action;
      this.registry.metadata[id] = {
        id, name: action.name, description: action.description,
        version: '1.0.0', author: 'XFlows Team', category: 'action',
        tags: ['action', 'automation', 'side-effect']
      };
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private async httpRequest(config: HTTPActorConfig): Promise<any> {
    this.logger.info(`🌐 HTTP ${config.method} ${config.url}`);
    
    // In a real implementation, this would use fetch or axios
    return {
      success: true,
      data: { message: `Mock ${config.method} response` },
      status: 200
    };
  }

  private calculateOperation(operation: any, context: any): number {
    // Implementation would evaluate the mathematical operation
    return Math.random() * 100; // Placeholder
  }

  private defaultContext(context?: Partial<PluginContext>): PluginContext {
    return {
      logger: {
        debug: (msg, data) => console.log(`[DEBUG] ${msg}`, data),
        info: (msg, data) => console.log(`[INFO] ${msg}`, data),
        warn: (msg, data) => console.warn(`[WARN] ${msg}`, data),
        error: (msg, data) => console.error(`[ERROR] ${msg}`, data)
      },
      http: {
        get: (url, opts) => fetch(url, { method: 'GET', ...opts }).then(r => r.json()),
        post: (url, data, opts) => fetch(url, { method: 'POST', body: JSON.stringify(data), ...opts }).then(r => r.json()),
        put: (url, data, opts) => fetch(url, { method: 'PUT', body: JSON.stringify(data), ...opts }).then(r => r.json()),
        delete: (url, opts) => fetch(url, { method: 'DELETE', ...opts }).then(r => r.json())
      },
      storage: {
        get: (key) => Promise.resolve(localStorage.getItem(key)),
        set: (key, value) => Promise.resolve(localStorage.setItem(key, JSON.stringify(value))),
        remove: (key) => Promise.resolve(localStorage.removeItem(key)),
        clear: () => Promise.resolve(localStorage.clear())
      },
      notifications: {
        show: (msg, type) => console.log(`[NOTIFICATION ${type}] ${msg}`),
        subscribe: () => {},
        unsubscribe: () => {}
      },
      flowState: {},
      userContext: {},
      environment: 'development',
      config: (key, def) => def,
      event: (name, data) => console.log(`[EVENT] ${name}`, data),
      state: (key, value) => value,
      ...context
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const createPluginSystem = (context?: Partial<PluginContext>): PluginSystem => {
  return new XFlowsPluginSystem(context);
};

export const defaultPluginSystem = createPluginSystem();
