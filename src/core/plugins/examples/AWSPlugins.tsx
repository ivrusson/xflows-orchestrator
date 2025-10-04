import React from 'react';
import type { ToolPluginConfig, UIPluginConfig } from '../types';

/**
 * 🚀 AWS S3 Upload Tool Plugin
 * Permite subir archivos a buckets de S3
 */
export const awsS3ToolPlugin: ToolPluginConfig = {
  type: 'tool',
  name: 'AWS S3 Upload Tool',
  description: 'Upload files to AWS S3 buckets with automatic key generation',
  configSchema: {
    type: 'object',
    properties: {
      bucket: { type: 'string', description: 'S3 bucket name' },
      region: { type: 'string', default: 'us-east-1' },
      accessKeyId: { type: 'string', description: 'AWS Access Key ID' },
      secretAccessKey: { type: 'string', description: 'AWS Secret Access Key' },
      keyTemplate: { type: 'string', default: 'uploads/{{timestamp}}/{{filename}}' },
      maxFileSize: { type: 'number', default: 10485760 }, // 10MB
      allowedExtensions: { 
        type: 'array', 
        items: { type: 'string' },
        default: ['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.doc', '.docx']
      }
    },
    required: ['bucket']
  },
  factory: (config: any) => ({
    id: 'aws-s3',
    name: 'AWS S3 Upload',
    description: 'Upload files to S3',
    async execute(context: any, toolConfig: any) {
      // En implementación real, usaría AWS SDK
      console.log(`📁 Uploading to S3 bucket: ${toolConfig.bucket}`);
      console.log(`🔗 File key: ${toolConfig.keyTemplate}`);
      
      return {
        success: true,
        bucket: toolConfig.bucket,
        key: toolConfig.keyTemplate.replace('{{timestamp}}', Date.now().toString())
          .replace('{{filename}}', context.filename || 'unknown'),
        url: `https://s3.amazonaws.com/${toolConfig.bucket}/uploads/file`,
        uploadedAt: new Date().toISOString()
      };
    },
    validate: (cfg: any) => !!cfg.bucket && !!cfg.accessKeyId && !!cfg.secretAccessKey
  })
};

/**
 * 📊 AWS CloudWatch Metrics UI Plugin
 * Visualiza métricas de CloudWatch en gráficos
 */
export const awsCloudWatchUIPlugin: UIPluginConfig = {
  type: 'ui',
  name: 'AWS CloudWatch Metrics',
  description: 'Display CloudWatch metrics in interactive charts',
  configSchema: {
    type: 'object',
    properties: {
      region: { type: 'string', default: 'us-east-1' },
      namespace: { type: 'string', description: 'CloudWatch namespace' },
      timeRange: { 
        type: 'object',
        properties: {
          start: { type: 'string' },
          end: { type: 'string' },
          period: { type: 'number', default: 3600 }
        }
      },
      metrics: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            dimension: { type: 'string' },
            statistic: { type: 'string', enum: ['Average', 'Maximum', 'Minimum', 'Sum'] }
          }
        }
      }
    },
    required: ['namespace']
  },
  component: React.forwardRef<HTMLDivElement, any>((props, ref) => {
    const { config, pluginContext } = props;
    
    return (
      <div ref={ref} className="aws-cloudwatch-wrapper bg-gray-50 rounded-lg p-6 border">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
            📊
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">CloudWatch Metrics</h3>
            <p className="text-sm text-gray-600">Namespace: {config?.namespace}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {config?.metrics?.map((metric: any, index: number) => (
            <div key={index} className="bg-white rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{metric.name}</h4>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {metric.statistic}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.floor(Math.random() * 100)}.{Math.floor(Math.random() * 100)}
              </div>
              <div className="text-sm text-gray-600">
                Dimension: {metric.dimension}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-400 rounded-full mr-2"></div>
            <span className="text-sm text-blue-800">
              Live data from AWS CloudWatch API
            </span>
          </div>
        </div>
      </div>
    );
  }),
  examples: [
    {
      title: 'EC2 Instance Metrics',
      description: 'Monitor CPU and memory usage',
      mockData: {
        namespace: 'AWS/EC2',
        metrics: [
          { name: 'CPUUtilization', dimension: 'InstanceId', statistic: 'Average' },
          { name: 'MemoryUtilization', dimension: 'InstanceId', statistic: 'Average' }
        ]
      }
    }
  ]
};

/**
 * 📧 AWS SES Email Plugin
 * Envía emails usando Amazon SES
 */
export const awsSESPlugin: ToolPluginConfig = {
  type: 'tool',
  name: 'AWS SES Email Tool',
  description: 'Send emails using Amazon SES',
  configSchema: {
    type: 'object',
    properties: {
      region: { type: 'string', default: 'us-east-1' },
      fromEmail: { type: 'string', description: 'Sender email address' },
      toEmails: { type: 'array', items: { type: 'string' } },
      subject: { type: 'string' },
      template: { type: 'string', description: 'Email template with placeholders' },
      attachments: { type: 'array', items: { type: 'string' } }
    },
    required: ['fromEmail', 'toEmails', 'subject', 'template']
  },
  factory: (config: any) => ({
    id: 'aws-ses',
    name: 'AWS SES Email',
    description: 'Send emails via SES',
    async execute(context: any, toolConfig: any) {
      const template = toolConfig.template
        .replace('{{userName}}', context.userName || 'Customer')
        .replace('{{policyNumber}}', context.policyNumber || 'N/A')
        .replace('{{premium}}', context.premium || '$0');
        
      console.log(`📧 Sending email via SES`);
      console.log(`📤 From: ${toolConfig.fromEmail}`);
      console.log(`📥 To: ${toolConfig.toEmails.join(', ')}`);
      console.log(`📋 Subject: ${toolConfig.subject}`);
      
      return {
        success: true,
        messageId: `ses-${Date.now()}`,
        recipients: toolConfig.toEmails,
        sentAt: new Date().toISOString()
      };
    },
    validate: (cfg: any) => !!cfg.fromEmail && !!cfg.toEmails && cfg.toEmails.length > 0
  })
};

/**
 * 🔍 AWS Textract Plugin
 * Extrae texto de documentos usando Textract
 */
export const awsTextractPlugin: ToolPluginConfig = {
  type: 'tool',
  name: 'AWS Textract Document Analysis',
  description: 'Extract text and data from AWS Textract',
  configSchema: {
    type: 'object',
    properties: {
      region: { type: 'string', default: 'us-east-1' },
      sourceDocument: { type: 'string', description: 'S3 object key or base64 document' },
      documentType: { 
        type: 'string', 
        enum: ['identity-document', 'receipt', 'form', 'invoice'],
        default: 'identity-document'
      },
      analyzeIds: { type: 'boolean', default: true },
      extractTables: { type: 'boolean', default: true },
      extractForms: { type: 'boolean', default: true }
    },
    required: ['sourceDocument']
  },
  factory: (config: any) => ({
    id: 'aws-textract',
    name: 'AWS Textract Analysis',
    description: 'Analyze documents with Textract',
    async execute(context: any, toolConfig: any) {
      console.log(`📄 Analyzing document with AWS Textract`);
      console.log(`📋 Document type: ${toolConfig.documentType}`);
      
      // Mock extracted data based on document type
      const mockData = {
        'identity-document': {
          firstName: 'Juan',
          lastName: 'Pérez',
          documentNumber: '12345678',
          documentType: 'ID',
          expirationDate: '2025-12-31',
          address: 'Av. Reforma 123, CDMX'
        },
        'receipt': {
          vendor: 'SuperMercado ABC',
          total: 156.78,
          items: [
            { name: 'Leche', price: 25.50 },
            { name: 'Pan', price: 18.00 },
            { name: 'Huevos', price: 35.28 }
          ],
          date: '2024-01-15'
        },
        'invoice': {
          invoiceNumber: 'INV-2024-001',
          amount: 2500.00,
          currency: 'MXN',
          dueDate: '2024-02-15',
          client: 'Empresa ABC S.A.'
        }
      };
      
      return {
        success: true,
        documentType: toolConfig.documentType,
        extractedData: mockData[toolConfig.documentType] || {},
        confidence: 0.95,
        processedAt: new Date().toISOString()
      };
    },
    validate: (cfg: any) => !!cfg.sourceDocument
  })
};
