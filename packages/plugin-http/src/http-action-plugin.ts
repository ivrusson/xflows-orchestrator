/**
 * HTTP Action Plugin
 * Provides HTTP-based actions for XState machines with advanced features
 */

import { TemplateParser } from '@xflows/core';
import type { TemplateData } from '@xflows/core';
import { cache, responseValidator, resultMapper, retryManager, type ExpectConfig, type MapResultConfig, type RetryConfig } from '@xflows/core';
import { ActionPluginImpl } from '@xflows/plugins';
import type { ActionPluginConfig } from '@xflows/plugins';

export interface HttpActionConfig extends ActionPluginConfig {
  endpoint: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  updateContext?: string;
  onError?: 'fail' | 'ignore';
  // Advanced features
  cacheTtlMs?: number;
  cacheKey?: string;
  expect?: ExpectConfig;
  mapResult?: MapResultConfig;
  retry?: RetryConfig;
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

  private parseTemplateObject(obj: unknown, templateData: TemplateData): unknown {
    if (typeof obj === 'string') {
      return this.templateParser.parse(obj, templateData as unknown as Record<string, unknown>);
    }
    if (typeof obj === 'object' && obj !== null) {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        result[key] = this.parseTemplateObject(value, templateData);
      }
      return result;
    }
    return obj;
  }

  async execute(
    config: HttpActionConfig,
    context: Record<string, unknown>,
    event: Record<string, unknown>
  ): Promise<unknown> {
    const templateData: TemplateData = { context, event, step: {} };
    
    // Check cache first
    if (config.cacheTtlMs) {
      const resolvedCacheKey = config.cacheKey 
        ? this.templateParser.parse(config.cacheKey, templateData as unknown as Record<string, unknown>)
        : undefined;
      const cacheKey = cache.generateKey(config, context, resolvedCacheKey);
      const cachedResult = cache.get(cacheKey);
      if (cachedResult !== null) {
        return cachedResult;
      }
    }

    // Prepare request - parse templates in endpoint, body, and headers
    const parsedEndpoint = this.templateParser.parse(config.endpoint, templateData as unknown as Record<string, unknown>);
    const parsedBody = this.parseTemplateObject(config.body || {}, templateData);
    const parsedHeaders = this.parseTemplateObject(config.headers || {}, templateData);

    // Execute with retry logic
    const executeRequest = async () => {
      const fetchOptions: RequestInit = {
        method: config.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...parsedHeaders as Record<string, string>
        }
      };

      // Only add body if it's not empty
      if (parsedBody && Object.keys(parsedBody as Record<string, unknown>).length > 0) {
        fetchOptions.body = JSON.stringify(parsedBody);
      }

      const response = await fetch(parsedEndpoint, fetchOptions);

      // Validate response
      if (config.expect) {
        const validation = responseValidator.validateResponse(response, config.expect);
        if (!validation.valid) {
          throw new Error(`Response validation failed: ${validation.errors.join(', ')}`);
        }
      }

      const data = await response.json();

      // Check if response indicates an error
      const isError = responseValidator.isError(response, data, config.expect?.isError);
      if (isError) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return { response, data };
    };

    try {
      const retryConfig = config.retry || { max: 0, backoffMs: 1000 };
      const { data } = await retryManager.executeWithRetry(
        executeRequest,
        retryConfig,
        (attempt, error) => {
          console.log(`HTTP request attempt ${attempt} failed:`, error.message);
        }
      );

      // Cache result if configured
      if (config.cacheTtlMs) {
        const resolvedCacheKey = config.cacheKey 
          ? this.templateParser.parse(config.cacheKey, templateData as unknown as Record<string, unknown>)
          : undefined;
        const cacheKey = cache.generateKey(config, context, resolvedCacheKey);
        cache.set(cacheKey, data, config.cacheTtlMs);
      }

      // Map result to context
      if (config.mapResult) {
        resultMapper.mapResult(data, config.mapResult, context);
      }

      // Legacy updateContext support
      if (config.updateContext) {
        context[config.updateContext] = data;
      }

      return data;
    } catch (error) {
      console.error('HTTP action failed:', error);
      
      if (config.onError === 'ignore') {
        return null;
      }
      
      // Default behavior and 'fail' - throw the error
      throw error;
    }
  }
}
