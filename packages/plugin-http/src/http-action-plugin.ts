/**
 * HTTP Action Plugin
 * Provides HTTP-based actions for XState machines
 */

import { ActionPluginImpl, type ActionPluginConfig } from '@xflows/plugins';
import { TemplateParser } from '@xflows/core';
import type { TemplateData } from '@xflows/core';

export interface HttpActionConfig extends ActionPluginConfig {
  endpoint: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  updateContext?: string;
  onError?: 'fail' | 'ignore';
}

export class HttpActionPlugin extends ActionPluginImpl {
  private templateParser: TemplateParser;

  constructor() {
    super('http-action', 'HTTP Action Plugin', '1.0.0');
    this.templateParser = new TemplateParser();
  }

  async initialize(): Promise<void> {
    // Plugin initialization logic
  }

  async destroy(): Promise<void> {
    // Plugin cleanup logic
  }

  async execute(
    config: HttpActionConfig,
    context: Record<string, unknown>,
    event: Record<string, unknown>
  ): Promise<unknown> {
    const templateData: TemplateData = { context, event, step: {} };
    
    const parsedBody = this.templateParser.parseTemplate(config.body || {}, templateData);
    const parsedHeaders = this.templateParser.parseTemplate(config.headers || {}, templateData);

    try {
      const response = await fetch(config.endpoint, {
        method: config.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...parsedHeaders as Record<string, string>
        },
        body: JSON.stringify(parsedBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (config.updateContext) {
        context[config.updateContext] = data;
      }

      return data;
    } catch (error) {
      console.error('HTTP action failed:', error);
      
      if (config.onError === 'fail') {
        throw error;
      }
      
      return null;
    }
  }
}
