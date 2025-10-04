import React, { useState, useEffect } from 'react';
import { createPluginSystem } from '../plugins/PluginSystem';
import { createPluginEnhancedMachine } from '../plugins/hybrid-integration';
import { awsS3ToolPlugin, awsCloudWatchUIPlugin, awsSESPlugin } from '../plugins/examples/AWSPlugins';
import { googleAnalyticsPlugin, googleSheetsUIPlugin, slackPlugin } from '../plugins/examples/ThirdPartyPlugins';

/**
 * 🎪 Plugin Demo Component
 * Demuestra el sistema de plugins integrado con Approach 3
 */
export const PluginDemo: React.FC = () => {
  const [pluginSystem, setPluginSystem] = useState(null);
  const [plugins, setPlugins] = useState([]);
  const [selectedPlugin, setSelectedPlugin] = useState(null);
  const [pluginMachine, setPluginMachine] = useState(null);
  const [currentState, setCurrentState] = useState('');
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    // Initialize plugin system
    const system = createPluginSystem();
    setPluginSystem(system);
    
    // Register demo plugins
    registerDemoPlugins(system);
    
    // List available plugins
    const availablePlugins = system.listPlugins();
    setPlugins(availablePlugins);
    
    // Create plugin-enhanced machine
    const machine = createPluginEnhancedMachine(demoFlowConfig, system);
    setPluginMachine(machine);
    
    addLog('🔌 Plugin system initialized');
    addLog(`📦 Registered ${availablePlugins.length} plugins`);
  }, []);

  const registerDemoPlugins = (system: any) => {
    // AWS Plugins
    system.registerPlugin(awsS3ToolPlugin.metadata || {
      id: 'aws-s3', name: 'AWS S3 Upload', version: '1.0.0',
      author: 'AWS Team', category: 'tool', tags: ['aws', 's3', 'storage']
    });
    
    system.registerPlugin(awsCloudWatchUIPlugin.metadata || {
      id: 'aws-cloudwatch', name: 'CloudWatch Metrics', version: '1.0.0',
      author: 'AWS Team', category: 'ui', tags: ['aws', 'monitoring', 'charts']
    });
    
    system.registerPlugin(awsSESPlugin.metadata || {
      id: 'aws-ses', name: 'AWS SES Email', version: '1.0.0',
      author: 'AWS Team', category: 'tool', tags: ['aws', 'email', 'ses']
    });
    
    // Third-party Plugins
    system.registerPlugin(googleAnalyticsPlugin.metadata || {
      id: 'google-analytics', name: 'Google Analytics', version: '1.0.0',
      author: 'Google Team', category: 'action', tags: ['analytics', 'tracking', 'google']
    });
    
    system.registerPlugin(googleSheetsUIPlugin.metadata || {
      id: 'google-sheets', name: 'Google Sheets Table', version: '1.0.0',
      author: 'Google Team', category: 'ui', tags: ['google', 'spreadsheet', 'table']
    });
    
    system.registerPlugin(slackPlugin.metadata || {
      id: 'slack', name: 'Slack Notifications', version: '1.0.0',
      author: 'Slack Team', category: 'action', tags: ['slack', 'notifications', 'chat']
    });
  };

  const addLog = (message: string, data?: any) => {
    setLogs(prev => [{
      timestamp: new Date().toLocaleTimeString(),
      message,
      data
    }, ...prev].slice(0, 20)); // Keep last 20 logs
  };

  const demoFlowConfig = {
    id: 'pluginDemo',
    initial: 'plugins.dashboard',
    context: {
      userId: 'demo-user',
      plugins: plugins.map(p => p.id)
    },
    states: {
      'plugins.dashboard': {
        type: 'atomic',
        meta: {
          view: { moduleId: 'mfe-plugin-dashboard' },
          description: 'Dashboard de plugins disponibles'
        }
      }
    }
  };

  const testPlugin = async (plugin: any) => {
    setSelectedPlugin(plugin);
    addLog(`🧪 Testing plugin: ${plugin.name}`);
    
    try {
      if (plugin.category === 'tool') {
        const tool = pluginSystem.createTool(plugin.id, getDemoConfig(plugin.id));
        const result = await tool.execute({}, getDemoConfig(plugin.id));
        addLog(`✅ Tool executed successfully`, result);
      } else if (plugin.category === 'ui') {
        addLog(`🎨 UI plugin selected: ${plugin.name}`);
      } else if (plugin.category === 'action') {
        const action = pluginSystem.createAction(plugin.id, getDemoConfig(plugin.id));
        const result = await action({}, getDemoConfig(plugin.id));
        addLog(`⚡ Action executed successfully`, result);
      }
    } catch (error) {
      addLog(`❌ Plugin test failed: ${error.message}`, error);
    }
  };

  const getDemoConfig = (pluginId: string) => {
    const configs: Record<string, any> = {
      'aws-s3': {
        bucket: 'demo-insurance-documents',
        region: 'us-east-1',
        keyTemplate: 'uploads/{{timestamp}}/{{filename}}'
      },
      'aws-cloudwatch': {
        namespace: 'XFlows/Demo',
        metrics: [
          { name: 'ProcessedApplications', statistic: 'Sum' },
          { name: 'AverageProcessingTime', statistic: 'Average' }
        ]
      },
      'aws-ses': {
        fromEmail: 'noreply@superinsurance.com',
        toEmails: ['demo@superinsurance.com'],
        subject: 'Insurance Application Update',
        template: 'Your application status: {{status}}'
      },
      'google-analytics': {
        propertyId: 'GA-DEMO-PROPERTY',
        eventName: 'plugin_demo_interaction',
        properties: {
          plugin_name: pluginId,
          demo_mode: true
        }
      },
      'google-sheets': {
        spreadsheetId: 'DEMO-SPREADSHEET-ID',
        editable: true,
        filters: true,
        formulas: true
      },
      'slack': {
        channel: '#demo-channel',
        username: 'XFlows Demo Bot',
        iconEmoji: ':robot_face:'
      }
    };
    
    return configs[pluginId] || {};
  };

  const createPluginInstance = (plugin: any) => {
    try {
      let instance;
      let type = '';
      
      switch (plugin.category) {
        case 'tool':
          instance = pluginSystem.createTool(plugin.id, getDemoConfig(plugin.id));
          type = '🔧';
          break;
        case 'ui':
          instance = pluginSystem.createUI(plugin.id, getDemoConfig(plugin.id));
          type = '🎨';
          break;
        case 'action':
          instance = pluginSystem.createAction(plugin.id, getDemoConfig(plugin.id));
          type = '⚡';
          break;
        case 'guard':
          instance = pluginSystem.createGuard(plugin.id, getDemoConfig(plugin.id));
          type = '🛡️';
          break;
        case 'actor':
          instance = pluginSystem.createActor(plugin.id, getDemoConfig(plugin.id));
          type = '🎭';
          break;
        default:
          throw new Error(`Unknown plugin category: ${plugin.category}`);
      }
      
      addLog(`${type} Created ${plugin.category}: ${plugin.name}`);
      return { instance, type };
    } catch (error) {
      addLog(`❌ Failed to create ${plugin.category}: ${error.message}`, error);
      return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6 mb-6 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">🔌 Plugin System Demo</h1>
        <p className="text-purple-100">
          Demostración del sistema de plugins extensible para XFlows Approach 3
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plugin List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            📦 Available Plugins ({plugins.length})
          </h2>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {plugins.map((plugin: any) => (
              <div
                key={plugin.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPlugin?.id === plugin.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPlugin(plugin)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-lg mr-2">
                        {plugin.category === 'tool' ? '🔧' :
                         plugin.category === 'ui' ? '🎨' :
                         plugin.category === 'action' ? '⚡' :
                         plugin.category === 'guard' ? '🛡️' :
                         plugin.category === 'actor' ? '🎭' : '📦'}
                      </span>
                      <h3 className="font-semibold text-gray-900">{plugin.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{plugin.description}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {plugin.tags?.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500">
                      v{plugin.version} by {plugin.author}
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      testPlugin(plugin);
                    }}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                  >
                    🧪 Test
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      createPluginInstance(plugin);
                    }}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  >
                    ➕ Create
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plugin Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {selectedPlugin ? '🔍 Plugin Details' : 'Select a Plugin'}
          </h2>
          
          {selectedPlugin ? (
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">📦</span>
                <div>
                  <h3 className="text-lg font-semibold">{selectedPlugin.name}</h3>
                  <p className="text-gray-600">{selectedPlugin.description}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">📋 Information</h4>
                <div className="space-y-1 text-sm">
                  <div><strong>ID:</strong> {selectedPlugin.id}</div>
                  <div><strong>Category:</strong> {selectedPlugin.category}</div>
                  <div><strong>Version:</strong> {selectedPlugin.version}</div>
                  <div><strong>Author:</strong> {selectedPlugin.author}</div>
                </div>
              </div>
              
              {selectedPlugin.examples && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">🎯 Usage Example</h4>
                  {selectedPlugin.examples.map((example: any, index: number) => (
                    <div key={index} className="mb-3">
                      <div className="font-medium text-sm">{example.title}</div>
                      <div className="text-xs text-gray-600 bg-white p-2 rounded mt-1 font-mono">
                        {typeof example.code === 'string' ? example.code : JSON.stringify(example.code, null, 2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">🚀 Demo Configuration</h4>
                <pre className="text-xs text-gray-700 bg-white p-2 rounded overflow-x-auto">
                  {JSON.stringify(getDemoConfig(selectedPlugin.id), null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-4">🔌</div>
              <p>Click on a plugin to view details</p>
            </div>
          )}
        </div>

        {/* Logs Panel */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            📋 Activity Log
            <button
              onClick={() => setLogs([])}
              className="ml-auto px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
            >
              🗑️ Clear
            </button>
          </h2>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="text-2xl mb-2">📋</div>
                <p>No activity yet</p>
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="border border-gray-200 rounded p-3 text-sm">
                  <div className="flex items-center mb-1">
                    <span className="text-gray-500 text-xs">{log.timestamp}</span>
                  </div>
                  <div className="text-gray-800">{log.message}</div>
                  {log.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-blue-600">Show data</summary>
                      <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Plugin System Status */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold mb-3">🔧 Plugin System Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="bg-white rounded p-3 text-center">
            <div className="text-2xl mb-1">📦</div>
            <div className="font-medium">Tools</div>
            <div className="text-gray-600">{plugins.filter(p => p.category === 'tool').length}</div>
          </div>
          <div className="bg-white rounded p-3 text-center">
            <div className="text-2xl mb-1">🎨</div>
            <div className="font-medium">UI Components</div>
            <div className="text-gray-600">{plugins.filter(p => p.category === 'ui').length}</div>
          </div>
          <div className="bg-white rounded p-3 text-center">
            <div className="text-2xl mb-1">⚡</div>
            <div className="font-medium">Actions</div>
            <div className="text-gray-600">{plugins.filter(p => p.category === 'action').length}</div>
          </div>
          <div className="bg-white rounded p-3 text-center">
            <div className="text-2xl mb-1">🛡️</div>
            <div className="font-medium">Guards</div>
            <div className="text-gray-600">{plugins.filter(p => p.category === 'guard').length}</div>
          </div>
          <div className="bg-white rounded p-3 text-center">
            <div className="text-2xl mb-1">🎭</div>
            <div className="font-medium">Actors</div>
            <div className="text-gray-600">{plugins.filter(p => p.category === 'actor').length}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
