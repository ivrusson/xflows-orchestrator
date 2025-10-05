/**
 * HTTP Actor Plugin
 * Provides HTTP-based actors for XState machines
 */

import { fromPromise } from 'xstate';
import { ActorPluginImpl, type ActorPluginConfig } from '@xflows/plugins';
import { TemplateParser } from '@xflows/core';
import type { TemplateData } from '@xflows/core';

export interface HttpActorConfig extends ActorPluginConfig {
  endpoint: string;
  method?: string;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

export class HttpActorPlugin extends ActorPluginImpl {
  private templateParser: TemplateParser;

  constructor() {
    super('http-actor', 'HTTP Actor Plugin', '1.0.0');
    this.templateParser = new TemplateParser();
  }

  async initialize(): Promise<void> {
    // Plugin initialization logic
  }

  async destroy(): Promise<void> {
    // Plugin cleanup logic
  }

  async createActor(config: HttpActorConfig): Promise<unknown> {
    return fromPromise(async ({ input }: { input: unknown }) => {
      const templateData: TemplateData = { context: {}, event: {}, step: {} };
      const parsedInput = this.templateParser.parseTemplate(input, templateData);
      
      const httpConfig = {
        endpoint: config.endpoint,
        method: config.method || 'POST',
        headers: config.headers || {},
        timeout: config.timeout || 30000,
        retries: config.retries || 3,
        ...parsedInput
      } as HttpActorConfig;

      return await this.executeHttpRequest(httpConfig);
    });
  }

  private async executeHttpRequest(config: HttpActorConfig): Promise<unknown> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    try {
      const response = await fetch(config.endpoint, {
        method: config.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers
        },
        body: JSON.stringify(config.input),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (config.retries && config.retries > 0) {
        // Retry logic would go here
        throw error;
      }
      
      throw error;
    }
  }
}
