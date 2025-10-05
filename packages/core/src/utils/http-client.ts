/**
 * HTTP Client
 * Handles HTTP requests for hooks and actors
 */

import { TemplateParser } from '../parser/template-parser';

export class HttpClient {
  private templateParser: TemplateParser;

  constructor(templateParser: TemplateParser) {
    this.templateParser = templateParser;
  }

  /**
   * Execute HTTP request
   */
  async execute(config: {
    url: string;
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
  }, context: Record<string, unknown>): Promise<unknown> {
    const url = this.templateParser.parse(config.url, context);
    const method = config.method || 'GET';
    const headers = config.headers || {};
    
    let body: string | undefined;
    if (config.body) {
      if (typeof config.body === 'string') {
        body = this.templateParser.parse(config.body, context);
      } else {
        body = JSON.stringify(config.body);
      }
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create HTTP actor for XState
   */
  createHttpActor() {
    return async (config: { url: string; method?: string; body?: unknown }, context: Record<string, unknown>) => {
      return this.execute(config, context);
    };
  }
}
