import React from 'react';
import type { ToolPluginConfig, UIPluginConfig, ActionPluginConfig } from '../types';

/**
 * 📊 Google Analytics Plugin
 * Tracking de eventos y métricas
 */
export const googleAnalyticsPlugin: ActionPluginConfig = {
  type: 'action',
  name: 'Google Analytics Tracking',
  description: 'Track events and conversions in Google Analytics',
  configSchema: {
    type: 'object',
    properties: {
      propertyId: { type: 'string', description: 'GA4 Property ID' },
      measurementId: { type: 'string', description: 'GA4 Measurement ID' },
      eventName: { type: 'string', description: 'Event name to track' },
      eventParameters: { type: 'object', description: 'Custom event parameters' },
      userId: { type: 'string', description: 'User identifier' },
      sessionId: { type: 'string', description: 'Session identifier' }
    },
    required: ['propertyId', 'eventName']
  },
  factory: (config: any) => async (context: any) => {
    console.log(`📊 Google Analytics event: ${config.eventName}`);
    console.log(`🎯 Property: ${config.propertyId}`);
    console.log(`👤 User: ${config.userId || context.session?.userId}`);
    
    // Mock GA4 event structure
    const gaEvent = {
      name: config.eventName,
      parameters: {
        ...config.eventParameters,
        user_id: config.userId || context.session?.userId,
        session_id: config.sessionId || context.sessionId,
        timestamp: Date.now(),
        ...context.customProperties
      }
    };
    
    return {
      success: true,
      event: gaEvent,
      trackingId: `ga-${Date.now()}`,
      sentAt: new Date().toISOString()
    };
  }
};

/**
 * 📝 Google Sheets UI Plugin
 * Tabla interactiva estilo Google Sheets
 */
export const googleSheetsUIPlugin: UIPluginConfig = {
  type: 'ui',
  name: 'Google Sheets Table',
  description: 'Interactive spreadsheet-like table component',
  configSchema: {
    type: 'object',
    properties: {
      spreadsheetId: { type: 'string', description: 'Google Sheets document ID' },
      range: { type: 'string', default: 'A1:Z1000' },
      editable: { type: 'boolean', default: true },
      formulas: { type: 'boolean', default: true },
      filters: { type: 'boolean', default: true },
      sorting: { type: 'boolean', default: true },
      columnTypes: { type: 'array', items: { type: 'string', enum: ['text', 'number', 'date', 'currency', 'percentage'] } },
      validationRules: { type: 'object' }
    },
    required: ['spreadsheetId']
  }
  component: React.forwardRef<HTMLDivElement, any>((props, ref) => {
    const { config, pluginContext } = props;
    const [data, setData] = React.useState([]);
    
    // Mock spreadsheet data
    React.useEffect(() => {
      const mockData = [
        ['Nombre', 'Email', 'Teléfono', 'Premium', 'Estado'],
        ['Juan Pérez', 'juan@email.com', '+52 55 1234-5678', '$150.00', 'Activo'],
        ['María García', 'maria@email.com', '+52 55 9876-5432', '$200.00', 'Activo'],
        ['Carlos López', 'carlos@email.com', '+52 55 5555-1234', '$120.00', 'Pendiente']
      ];
      setData(mockData);
    }, []);
    
    return (
      <div ref={ref} className="google-sheets-wrapper bg-white rounded-lg border shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              📊
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Google Sheets Table</h3>
              <p className="text-sm text-gray-600">Sheets ID: {config.spreadsheetId}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {config.filters && (
              <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                🔍 Filtros
              </button>
            )}
            {config.formulas && (
              <button className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded hover:bg-purple-200">
                ∑ Fórmulas
              </button>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex === 0 ? 'bg-gray-50 font-medium' : 'hover:bg-gray-50'}>
                  {row.map((cell, cellIndex) => (
                    <td 
                      key={cellIndex} 
                      className="p-3 border-r border-gray-200 min-w-[120px]"
                      contentEditable={config.editable && rowIndex > 0}
                      suppressContentEditableWarning
                    >
                      {cellIndex === 4 && rowIndex > 0 ? (
                        <span className={`px-2 py-1 text-xs rounded ${
                          cell === 'Activo' ? 'bg-green-100 text-green-800' :
                          cell === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {cell}
                        </span>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center justify-between p-3 border-t border-gray-200 text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>📊 4 filas × 5 columnas</span>
            <span>✏️ Edición: {config.editable ? 'Habilitada' : 'Deshabilitada'}</span>
          </div>
          <div className="text-blue-600">
            🔄 Conectado a Google Sheets
          </div>
        </div>
      </div>
    );
  }),
  examples: [
    {
      title: 'Customer Database',
      description: 'Manage customer information in spreadsheet format',
      mockData: {
        spreadsheetId: '1ABC123def456GHI789jkl0',
        editable: true,
        filters: true,
        formulas: true
      }
    }
  ]
};

/**
 * 📧 SendGrid Email Plugin
 * Envío de emails usando SendGrid
 */
export const sendGridPlugin: ToolPluginConfig = {
  type: 'tool',
  name: 'SendGrid Email Tool',
  description: 'Send emails using SendGrid API',
  configSchema: {
    type: 'object',
    properties: {
      apiKey: { type: 'string', description: 'SendGrid API Key' },
      fromEmail: { type: 'string', description: 'Sender email' },
      fromName: { type: 'string', description: 'Sender name' },
      toEmails: { type: 'array', items: { type: 'string' } },
      subject: { type: 'string' },
      templateId: { type: 'string', description: 'SendGrid template ID' },
      dynamicTemplateData: { type: 'object', description: 'Template variables' },
      attachments: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            filename: { type: 'string' },
            content: { type: 'string' },
            type: { type: 'string' }
          }
        }
      }
    },
    required: ['apiKey', 'fromEmail', 'toEmails', 'subject']
  },
  factory: (config: any) => ({
    id: 'sendgrid',
    name: 'SendGrid Email',
    description: 'Send emails via SendGrid',
    async execute(context: any, toolConfig: any) {
      const templateData = toolConfig.dynamicTemplateData || {};
      
      // Merge context data into template
      Object.keys(templateData).forEach(key => {
        if (typeof templateData[key] === 'string' && templateData[key].includes('{{')) {
          templateData[key] = templateData[key]
            .replace('{{userName}}', context.userName || 'Customer')
            .replace('{{policyNumber}}', context.policyNumber || 'N/A')
            .replace('{{premium}}', context.premium || '$0')
            .replace('{{company}}', context.company || 'Insurance Company');
        }
      });
      
      console.log(`📧 SendGrid email`);
      console.log(`📤 From: ${toolConfig.fromName} <${toolConfig.fromEmail}>`);
      console.log(`📥 To: ${toolConfig.toEmails.join(', ')}`);
      console.log(`📋 Subject: ${toolConfig.subject}`);
      console.log(`🎨 Template ID: ${toolConfig.templateId}`);
      
      return {
        success: true,
        messageId: `sg-${Date.now()}`,
        status: 'queued',
        templateData,
        recipients: toolConfig.toEmails,
        sentAt: new Date().toISOString()
      };
    },
    validate: (cfg: any) => !!cfg.apiKey && !!cfg.fromEmail && cfg.toEmails?.length > 0
  })
};

/**
 * 💬 Slack Notification Plugin
 * Envío de mensajes a Slack
 */
export const slackPlugin: ActionPluginConfig = {
  type: 'action',
  name: 'Slack Notification',
  description: 'Send messages to Slack channels',
  configSchema: {
    type: 'object',
    properties: {
      webhookUrl: { type: 'string', description: 'Slack webhook URL' },
      channel: { type: 'string', description: 'Slack channel name' },
      username: { type: 'string', default: 'XFlows Bot' },
      iconEmoji: { type: 'string', default: ':robot_face:' },
      blocks: { type: 'array', description: 'Slack Block Kit blocks' },
      attachments: { type: 'array', description: 'Slack attachments' }
    },
    required: ['webhookUrl', 'channel']
  },
  factory: (config: any) => async (context: any) => {
    const slackMessage = {
      channel: config.channel,
      username: config.username,
      icon_emoji: config.iconEmoji,
      text: `🧾 Nueva cotización de seguros`,
      blocks: config.blocks || [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `🎯 *Cliente:* ${context.applicant?.name || 'N/A'}\n💼 *Tipo:* ${context.quote?.type || 'N/A'}\n💰 *Monto:* $${context.quote?.coverageAmount?.toLocaleString() || '0'}\n📊 *Riesgo:* ${context.riskScore > 80 ? '🔴 Alto' : context.riskScore > 50 ? '🟡 Medio' : '🟢 Bajo'}`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: '✅ Aprobar' },
              style: 'primary',
              action_id: 'approve_policy'
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: '❌ Rechazar' },
              style: 'danger',
              action_id: 'reject_policy'
            }
          ]
        }
      ]
    };
    
    console.log(`💬 Slack notification to #${config.channel}`);
    console.log(`🤖 Bot: ${config.username}`);
    
    return {
      success: true,
      slackResponse: slackMessage,
      channel: config.channel,
      messageId: `slack-${Date.now()}`,
      sentAt: new Date().toISOString()
    };
  }
};

/**
 * 🗄️ MySQL Database Plugin
 * Operaciones de base de datos MySQL
 */
export const mysqlPlugin: ToolPluginConfig = {
  type: 'tool',
  name: 'MySQL Database Tool',
  description: 'Perform MySQL database operations',
  configSchema: {
    type: 'object',
    properties: {
      host: { type: 'string', description: 'Database host' },
      port: { type: 'number', default: 3306 },
      database: { type: 'string', description: 'Database name' },
      username: { type: 'string', description: 'Database username' },
      password: { type: 'string', description: 'Database password' },
      query: { type: 'string', description: 'SQL query to execute' },
      operation: { 
        type: 'string', 
        enum: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
        description: 'SQL operation type' 
      },
      parameters: { type: 'object', description: 'Query parameters' }
    },
    required: ['host', 'database', 'username', 'password', 'query']
  },
  factory: (config: any) => ({
    id: 'mysql',
    name: 'MySQL Database',
    description: 'MySQL database operations',
    async execute(context: any, toolConfig: any) {
      console.log(`🗄️ MySQL query: ${toolConfig.operation}`);
      console.log(`📊 Database: ${toolConfig.database}@${toolConfig.host}:${toolConfig.port}`);
      
      // Mock database operations
      const mockResults = {
        'SELECT': {
          rows: [
            { id: 1, name: 'Juan Pérez', email: 'juan@email.com' },
            { id: 2, name: 'María García', email: 'maria@email.com' }
          ],
          rowCount: 2,
          fields: ['id', 'name', 'email']
        },
        'INSERT': {
          insertId: Date.now(),
          affectedRows: 1,
          rows: [{ id: Date.now(), ...toolConfig.parameters }]
        },
        'UPDATE': {
          affectedRows: 1,
          changedRows: 1,
          rows: [toolConfig.parameters]
        },
        'DELETE': {
          affectedRows: 1,
          deletedRows: 1
        }
      };
      
      return {
        success: true,
        query: toolConfig.query,
        results: mockResults[toolConfig.operation],
        executionTime: Math.floor(Math.random() * 100) + 10, // ms
        executedAt: new Date().toISOString()
      };
    },
    validate: (cfg: any) => !!cfg.host && !!cfg.database && !!cfg.username && !!cfg.password
  })
};

/**
 * 🌍 MapBox Maps UI Plugin
 * Visualización de mapas interactivos
 */
export const mapboxUIPlugin: UIPluginConfig = {
  type: 'ui',
  name: 'MapBox Maps',
  description: 'Interactive maps using MapBox',
  configSchema: {
    type: 'object',
    properties: {
      accessToken: { type: 'string', description: 'MapBox access token' },
      center: { 
        type: 'object',
        properties: {
          lat: { type: 'number' },
          lng: { type: 'number' }
        },
        description: 'Map center coordinates'
      },
      zoom: { type: 'number', default: 10 },
      markers: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            lat: { type: 'number' },
            lng: { type: 'number' },
            label: { type: 'string' },
            color: { type: 'string', default: 'red' }
          }
        }
      },
      mapStyle: { 
        type: 'string', 
        enum: ['streets-v11', 'outdoors-v11', 'light-v10', 'dark-v10', 'satellite-v9'],
        default: 'streets-v11'
      }
    },
    required: ['accessToken']
  },
  component: React.forwardRef<HTMLDivElement, any>((props, ref) => {
    const { config, pluginContext } = props;
    
    return (
      <div ref={ref} className="mapbox-wrapper bg-gray-100 rounded-lg overflow-hidden">
        <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">🗺️ MapBox Interactive Map</h3>
              <p className="text-blue-100">Estilo: {config?.mapStyle || 'streets-v11'}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100">Zoom: {config?.zoom || 10}</div>
              <div className="text-sm text-blue-100">
                Marcadores: {config?.markers?.length || 0}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                🗺️
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Mapa Interactivo</h4>
              <p className="text-gray-600 mb-4">
                Visualización de ubicaciones y datos geográficos
              </p>
              
              {config?.center && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="text-sm text-gray-600 mb-2">Centro del mapa:</div>
                  <div className="font-mono text-sm">
                    Lat: {config.center.lat}°, Lng: {config.center.lng}°
                  </div>
                </div>
              )}
              
              {config?.markers && config.markers.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Marcadores:</div>
                  {config.markers.map((marker: any, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                      <span className="font-medium">{marker.label}</span>
                      <span className="text-xs text-gray-500">
                        {marker.lat}°, {marker.lng}°
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="px-6 pb-4">
          <div className="flex items-center justify-center text-sm text-gray-500">
            🚀 Powered by MapBox API
          </div>
        </div>
      </div>
    );
  }),
  examples: [
    {
      title: 'Insurance Coverage Map',
      description: 'Show insurance coverage areas',
      mockData: {
        accessToken: 'pk.your_mapbox_token',
        center: { lat: 19.4326, lng: -99.1332 }, // Mexico City
        zoom:和,
        markers: [
          { lat: 19.4326, lng: -99.1332, label: 'Oficina Central', color: 'blue' },
          { lat: 19.3314, lng: -99.1348, label: 'Sucursal CDMX', color: 'green' }
        ],
        mapStyle: 'streets-v11'
      }
    }
  ]
};
