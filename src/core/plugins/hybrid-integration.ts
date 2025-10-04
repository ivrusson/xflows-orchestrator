import { createMachine } from 'xstate';
import type { HybridFlowConfig } from '../../approaches/approach-3/hybrid-flow-machine';
import type { XFlowsPluginSystem } from './PluginSystem';
import { createPluginSystem } from './PluginSystem';

/**
 * 🔌 Plugin Integration for Hybrid Approach
 * Extends Approach 3 with extensible plugin system
 */

// ============================================================================
// TYPES EXTENSION
// ============================================================================

/**
 * Extends HybridFlowConfig with plugin support
 */
export interface PluginEnhancedFlowConfig extends HybridFlowConfig {
  plugins?: {
    // Plugin instantiation config
    actors?: Record<string, {
      id: string;
      config: any;
      enabled?: boolean;
    }>;
    ui?: Record<string, {
      id: string;
      config: any;
      enabled?: boolean;
    }>;
    tools?: Record<string, {
      id: string;
      config: any;
      enabled?: boolean;
    }>;
    guards?: Record<string, {
      id: string;
      config: any;
      enabled?: boolean;
    }>;
    actions?: Record<string, {
      id: string;
      config: any;
      enabled?: boolean;
    }>;
    
    // Plugin discovery and loading
    autoDiscover?: boolean;
    pluginRegistry?: string; // URL to plugin registry
    cachePlugins?: boolean;
  };
}

/**
 * Plugin-aware state configuration
 */
export interface PluginEnhancedStateConfig {
  // Original HybridFlowConfig properties...
  type?: 'final' | 'compound' | 'atomic';
  meta?: {
    view?: { 
      moduleId: string; 
      component?: string; 
      slot?: string;
      plugin?: string; // Use specific plugin
      pluginConfig?: any; // Plugin-specific config
    };
    description?: string;
    icon?: string;
  };
  
  // Plugin-specific invoke configurations
  pluginInvoke?: Array<{
    id: string;
    pluginId: string;
    pluginType: 'actor' | 'tool';
    config: any;
    timeout?: number;
    retryPolicy?: {
      attempts: number;
      retryDelay: number;
      backoff?: 'linear' | 'exponential';
    };
  }>;
  
  // Plugin-specific UI configurations
  pluginUI?: {
    pluginId: string;
    config: any;
    slot?: string;
    responsive?: boolean;
  };
  
  // Plugin-specific actions
  pluginActions?: Array<{
    actionId: string;
    pluginId: string;
    config: any;
    condition?: any; // JSON Logic condition
  }>;
}

// ============================================================================
// PLUGIN INTEGRATION MACHINE FACTORY
// ============================================================================

/**
 * Creates an XState machine with plugin support
 */
export function createPluginEnhancedMachine(
  config: PluginEnhancedFlowConfig,
  pluginSystem: XFlowsPluginSystem
) {
  const { plugins, ...baseConfig } = config;
  
  // Initialize plugins if configured
  if (plugins) {
    initializePlugins(plugins, pluginSystem);
  }
  
  // Convert config to XState machine with plugin enhancements
  const enhancedStates = convertStatesWithPlugins(baseConfig.states, pluginSystem, plugins);
  
  // Create enhanced actors from plugin configurations
  const enhancedActors = convertActorsWithPlugins(plugins?.actors, pluginSystem);
  
  // Create enhanced guards from plugin configurations  
  const enhancedGuards = convertGuardsWithPlugins(plugins?.guards, pluginSystem);
  
  return createMachine({
    id: config.id,
    initial: config.initial,
    context: config.context,
    states: enhancedStates,
    actors: enhancedActors,
    guards: enhancedGuards
  });
}

// ============================================================================
// PLUGIN CONVERSION HELPERS
// ============================================================================

function initializePlugins(
  plugins: NonNullable<PluginEnhancedFlowConfig['plugins']>,
  pluginSystem: XFlowsPluginSystem
) {
    // Initialize actors
    if (plugins.actors) {
      for (const key in plugins.actors) {
        if (plugins.actors.hasOwnProperty(key)) {
          const actorConfig = plugins.actors[key];
          if (actorConfig.enabled !== false) {
            try {
              const actor = pluginSystem.createActor(actorConfig.id, actorConfig.config);
              pluginSystem.registerPlugin({
                id: `dynamic-actor-${key}`,
                name: `${actorConfig.id} Actor`,
                description: 'Dynamic actor instantiation',
                version: '1.0.0',
                author: 'XFlows System',
                category: 'actor',
                tags: ['dynamic', 'runtime']
              });
            } catch (error) {
              console.error(`❌ Failed to initialize actor ${actorConfig.id}:`, error);
            }
          }
        }
      }
    }
  
  // Initialize tools
  if (plugins.tools) {
    Object.entries(plugins.tools).forEach(([key, toolConfig]) => {
      if (toolConfig.enabled !== false) {
        try {
          const tool = pluginSystem.createTool(toolConfig.id, toolConfig.config);
          pluginSystem.registerPlugin({
            id: `dynamic-tool-${key}`,
            name: `${toolConfig.id} Tool`,
            description: `Dynamic tool instantiation`,
            version: '1.0.0',
            author: 'XFlows System',
            category: 'tool',
            tags: ['dynamic', 'runtime']
          });
        } catch (error) {
          console.error(`❌ Failed to initialize tool ${toolConfig.id}:`, error);
        }
      }
    });
  }
  
  // Initialize guards
  if (plugins.guards) {
    Object.entries(plugins.guards).forEach(([key, guardConfig]) => {
      if (guardConfig.enabled !== false) {
        try {
          const guard = pluginSystem.createGuard(guardConfig.id, guardConfig.config);
          pluginSystem.registerPlugin({
            id: `dynamic-guard-${key}`,
            name: `${guardConfig.id} Guard`,
            description: `Dynamic guard instantiation`,
            version: '1.0.0',
            author: 'XFlows System',
            category: 'guard',
            tags: ['dynamic', 'runtime']
          });
        } catch (error) {
          console.error(`❌ Failed to initialize guard ${guardConfig.id}:`, error);
        }
      }
    });
  }
  
  // Initialize actions
  if (plugins.actions) {
    Object.entries(plugins.actions).forEach(([key, actionConfig]) => {
      if (actionConfig.enabled !== false) {
        try {
          const action = pluginSystem.createAction(actionConfig.id, actionConfig.config);
          pluginSystem.registerPlugin({
            id: `dynamic-action-${key}`,
            name: `${actionConfig.id} Action`,
            description: `Dynamic action instantiation`,
            version: '1.0.0',
            author: 'XFlows System',
            category: 'action',
            tags: ['dynamic', 'runtime']
          });
        } catch (error) {
          console.error(`❌ Failed to initialize action ${actionConfig.id}:`, error);
        }
      }
    });
  }
}

function convertStatesWithPlugins(
  states: Record<string, any>,
  pluginSystem: XFlowsPluginSystem,
  plugins?: NonNullable<PluginEnhancedFlowConfig['plugins']>
): Record<string, any> {
  const convertedStates: Record<string, any> = {};
  
  Object.entries(states).forEach(([stateId, stateConfig]) => {
    const enhancedStateConfig = {
      ...stateConfig
    };
    
    // Convert plugin invoke configurations
    if (stateConfig.pluginInvoke) {
      enhancedStateConfig.invoke = stateConfig.pluginInvoke.map((pluginInvoke: any) => ({
        id: pluginInvoke.id,
        src: pluginSystem.createActor(pluginInvoke.pluginId, pluginInvoke.config),
        input: pluginInvoke.config,
        timeout: pluginInvoke.timeout || 30000,
        retryPolicy: pluginInvoke.retryPolicy || { attempts: 3, retryDelay: 1000 }
      }));
    }
    
    // Convert plugin UI configurations
    if (stateConfig.pluginUI) {
      const UIComponent = pluginSystem.createUI(stateConfig.pluginUI.pluginId, stateConfig.pluginUI.config);
      enhancedStateConfig.meta = {
        ...enhancedStateConfig.meta,
        view: {
          ...enhancedStateConfig.meta?.view,
          pluginComponent: UIComponent,
          pluginConfig: stateConfig.pluginUI.config
        }
      };
    }
    
    // Convert plugin actions
    if (stateConfig.pluginActions) {
      enhancedStateConfig.pluginActions = stateConfig.pluginActions.map((pluginAction: any) => {
        const action = pluginSystem.createAction(pluginAction.pluginId, pluginAction.config);
        return {
          action: () => action,
          condition: pluginAction.condition
        };
      });
    }
    
    convertedStates[stateId] = enhancedStateConfig;
  });
  
  return convertedStates;
}

function convertActorsWithPlugins(
  actorConfigs?: Record<string, any>,
  pluginSystem?: XFlowsPluginSystem
): Record<string, any> {
  if (!actorConfigs || !pluginSystem) return {};
  
  const actors: Record<string, any> = {};
  
  Object.entries(actorConfigs).forEach(([key, config]) => {
    if (config.enabled !== false) {
      actors[key] = pluginSystem.createActor(config.id, config.config);
    }
  });
  
  return actors;
}

function convertGuardsWithPlugins(
  guardConfigs?: Record<string, any>,
  pluginSystem?: XFlowsPluginSystem
): Record<string, any> {
  if (!guardConfigs || !pluginSystem) return {};
  
  const guards: Record<string, any> = {};
  
  Object.entries(guardConfigs).forEach(([key, config]) => {
    if (config.enabled !== false) {
      guards[key] = pluginSystem.createGuard(config.id, config.config);
    }
  });
  
  return guards;
}

// ============================================================================
// EXAMPLE: PLUGIN-ENHANCED INSURANCE FLOW
// ============================================================================

/**
 * Example of enhanced insurance flow with plugins
 */
export function createPluginEnhancedInsuranceFlow() {
  const pluginSystem = createPluginSystem();
  
  const config: PluginEnhancedFlowConfig = {
    id: 'pluginInsuranceSales',
    initial: 'quote.enhanced-validation',
    context: {
      dossierId: null,
      riskScore: 0,
      session: { channel: 'web' },
      pluginContext: {
        userId: null,
        company: 'Super Insurance Corp'
      }
    },
    
    states: {
      // Enhanced validation with AWS Textract
      'quote.enhanced-validation': {
        type: 'atomic',
        meta: {
          view: { 
            moduleId: 'mfe-enhanced-validation',
            description: 'Validación avanzada con plugins'
          },
          icon: '🔌'
        },
        
        // Plugin invoke for document analysis
        pluginInvoke: [{
          id: 'documentAnalyzer',
          pluginId: 'aws-textract',
          pluginType: 'tool',
          config: {
            sourceDocument: '{{context.idDocumentUrl}}',
            documentType: 'identity-document',
            analyzeIds: true
          },
          timeout: 30000,
          retryPolicy: {
            attempts: 3,
            retryDelay: 2000,
            backoff: 'exponential'
          }
        }],
        
        // Plugin UI for cloud watch metrics
        pluginUI: {
          pluginId: 'aws-cloudwatch',
          config: {
            region: 'us-east-1',
            namespace: 'SuperInsurance/Validation',
            metrics: [
              { name: 'DocumentProcessingTime', statistic: 'Average' },
              { name: 'ValidationSuccessRate', statistic: 'Average' }
            ]
          }
        },
        
        on: {
          DOCUMENT_VALIDATED: {
            target: 'risk.ai-assessment',
            actions: ['logDocumentValidation', 'trackAnalytics']
          },
          VALIDATION_FAILED: {
            target: 'quote.error',
            actions: ['sendNotification']
          }
        }
      },
      
      // Enhanced risk assessment with AI
      'risk.ai-assessment': {
        type: 'atomic',
        meta: {
          view: { moduleId: 'mfe-ai-assessment' },
          description: 'Evaluación de riesgo con IA'
        },
        
        // Plugin actions for analytics tracking
        pluginActions: [{
          actionId: 'riskAnalysisStarted',
          pluginId: 'google-analytics',
          config: {
            eventName: 'risk_analysis_started',
            properties: {
              custom_parameters: {
                policy_type: '{{context.quote.type}}',
                coverage_amount: '{{context.quote.coverageAmount}}',
                user_age: '{{context.applicant.age}}'
              }
            }
          }
        }],
        
        on: {
          RISK_ANALYZED: {
            target: 'notification.slack-review',
            actions: ['calculatePremium', 'generateReport']
          }
        }
      },
      
      // Slack notification for manual review
      'notification.slack-review': {
        type: 'atomic',
        meta: {
          view: { moduleId: 'mfe-slack-notification' },
          description: 'Notificación a Slack para revisión'
        },
        
        // Plugin action for Slack notification
        pluginActions: [{
          actionId: 'notifySlack',
          pluginId: 'slack',
          config: {
            channel: '#insurance-reviews',
            username: 'XFlows Insurance Bot',
            iconEmoji: ':shield:',
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: '🎯 *Nueva solicitud de seguro*\n*Cliente:* {{context.applicant.name}}\n*Tipo:* {{context.quote.type}}\n*Monto:* ${{context.quote.coverageAmount}}\n*Riesgo:* {{context.riskScore}}%'
                }
              }
            ]
          }
        }],
        
        on: {
          APPROVED: 'policy.creation',
          REJECTED: 'quote.rejection',
          NEEDS_MORE_INFO: 'quote.additional-data'
        }
      },
      
      // Final policy creation with database
      'policy.creation': {
        type: 'atomic',
        meta: {
          view: { moduleId: 'mfe-policy-creation' },
          description: 'Creación de póliza en base de datos'
        },
        
        // Plugin invoke for database operations
        pluginInvoke: [{
          id: 'createPolicyRecord',
          pluginId: 'mysql',
          pluginType: 'tool',
          config: {
            operation: 'INSERT',
            query: 'INSERT INTO policies (user_id, policy_number, premium, start_date, status) VALUES (?, ?, ?, ?, ?)',
            parameters: {
              user_id: '{{context.applicant.id}}',
              policy_number: 'POL-{{dossierId}}',
              premium: '{{context.quote.premium}}',
              start_date: '{{context.effectiveDate}}',
              status: 'ACTIVE'
            }
          }
        }],
        
        pluginActions: [{
          actionId: 'sendWelcomeEmail',
          pluginId: 'sendgrid',
          config: {
            templateId: 'welcome-insurance-template',
            dynamicTemplateData: {
              userName: '{{context.applicant.name}}',
              policyNumber: 'POL-{{dossierId}}',
              premium: '${{context.quote.premium}}/mes',
              company: 'Super Insurance Corp'
            }
          }
        }],
        
        on: {
          POLICY_CREATED: 'completed',
          DB_ERROR: 'policy.error'
        }
      },
      
      // Error states
      'quote.error': {
        type: 'final',
        meta: { view: { moduleId: 'mfe-error' } }
      },
      
      'quote.rejection': {
        type: 'final',
        meta: { view: { moduleId: 'mfe-rejection' } }
      },
      
      'policy.error': {
        type: 'final',
        meta: { view: { moduleId: 'mfe-error' } }
      },
      
      'completed': {
        type: 'final',
        meta: { view: { moduleId: 'mfe-success' } }
      }
    },
    
    // Plugin configurations
    plugins: {
      actors: {
        'http-requests': {
          id: 'http',
          config: {
            timeout: 30000,
            retries: 3,
            retryDelay: 1000
          },
          enabled: true
        }
      },
      
      tools: {
        'document-analyzer': {
          id: 'aws-textract',
          config: {
            region: 'us-east-1',
            maxFileSize: 10485760, // 10MB
            allowedTypes: ['pdf', 'png', 'jpg']
          },
          enabled: true
        },
        'database-ops': {
          id: 'mysql',
          config: {
            connectionPool: {
              max: 10,
              min: 2,
              idle: 10000
            },
            timeout: 30000
          },
          enabled: true
        }
      },
      
      guards: {
        'business-hours': {
          id: 'time-based',
          config: {
            condition: 'businessHours',
            timezone: 'America/Mexico_City'
          },
          enabled: true
        },
        'rate-limit': {
          id: 'rate-limit',
          config: {
            maxRequests: 100,
            windowMs: 3600000 // 1 hour
          },
          enabled: true
        }
      },
      
      actions: {
        'analytics': {
          id: 'google-analytics',
          config: {
            propertyId: 'GA-PROPERTY-ID',
            userId: '{{context.session.userId}}'
          },
          enabled: true
        },
        'notifications': {
          id: 'slack',
          config: {
            webhookUrl: 'SLACK-WEBHOOK-URL',
            channel: '#general',
            username: 'XFlows Bot'
          },
          enabled: true
        }
      },
      
      ui: {
        'metrics': {
          id: 'aws-cloudwatch',
          config: {
            refreshInterval: 30000,
            maxDataPoints: 100
          },
          enabled: true
        },
        'maps': {
          id: 'mapbox',
          config: {
            accessToken: 'MAPBOX-ACCESS-TOKEN',
            mapStyle: 'streets-v11'
          },
          enabled: false // Disabled by default
        }
      },
      
      // Plugin discovery settings
      autoDiscover: true,
      pluginRegistry: 'https://plugins.xflows.com/registry',
      cachePlugins: true
    }
  };
  
  return createPluginEnhancedMachine(config, pluginSystem);
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  createPluginEnhancedMachine,
  createPluginEnhancedInsuranceFlow,
  PluginEnhancedFlowConfig,
  PluginEnhancedStateConfig
};
