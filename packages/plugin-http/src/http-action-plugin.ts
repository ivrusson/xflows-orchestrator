/**
 * HTTP Action Plugin
 * Provides HTTP-based actions for XState machines with advanced features
 */

import { ActionPluginImpl, type ActionPluginConfig } from '@xflows/plugins';
import { TemplateParser } from '@xflows/core';
import type { TemplateData } from '@xflows/core';
import { cache, type CacheConfig } from '@xflows/core/src/utils/cache';
import { responseValidator, type ExpectConfig } from '@xflows/core/src/utils/response-validator';
import { resultMapper, type MapResultConfig } from '@xflows/core/src/utils/result-mapper';
import { retryManager, type RetryConfig } from '@xflows/core/src/utils/retry-manager';

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

  async execute(
    config: HttpActionConfig,
    context: Record<string, unknown>,
    event: Record<string, unknown>
  ): Promise<unknown> {
    const templateData: TemplateData = { context, event, step: {} };
    
    // Check cache first
    if (config.cacheTtlMs) {
      const cacheKey = cache.generateKey(config, context, config.cacheKey);
      const cachedResult = cache.get(cacheKey);
      if (cachedResult !== null) {
        console.log('Using cached HTTP result');
        return cachedResult;
      }
    }

    // Prepare request
    const parsedBody = this.templateParser.parseTemplate(config.body || {}, templateData);
    const parsedHeaders = this.templateParser.parseTemplate(config.headers || {}, templateData);

    // Execute with retry logic
    const executeRequest = async () => {
      const response = await fetch(config.endpoint, {
        method: config.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...parsedHeaders as Record<string, string>
        },
        body: JSON.stringify(parsedBody)
      });

      // Validate response
      if (config.expect) {
        const validation = responseValidator.validateResponse(response, config.expect);
        if (!validation.valid) {
          throw new Error(`Response validation failed: ${validation.errors.join(', ')}`);
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Validate schema if specified
      if (config.expect?.schema) {
        const schemaValidation = await responseValidator.validateSchema(data, config.expect.schema);
        if (!schemaValidation.valid) {
          throw new Error(`Schema validation failed: ${schemaValidation.errors.join(', ')}`);
        }
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
        const cacheKey = cache.generateKey(config, context, config.cacheKey);
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
      
      if (config.onError === 'fail') {
        throw error;
      }
      
      return null;
    }
  }
}
