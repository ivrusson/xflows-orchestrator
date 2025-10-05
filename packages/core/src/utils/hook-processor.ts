/**
 * Hook Processor
 * Processes before/after action hooks
 */

import { TemplateParser } from '../parser/template-parser';
import { HttpClient } from './http-client';
import type { Hook } from '../types';

export class HookProcessor {
  private templateParser: TemplateParser;
  private httpClient: HttpClient;

  constructor(templateParser: TemplateParser, httpClient: HttpClient) {
    this.templateParser = templateParser;
    this.httpClient = httpClient;
  }

  /**
   * Create hook action for XState
   */
  createHookAction(hook: Hook, phase: 'before' | 'after') {
    return async (context: Record<string, unknown>, event: Record<string, unknown>) => {
      try {
        switch (hook.type) {
          case 'http_call':
            if (hook.endpoint && hook.method) {
              await this.httpClient.execute({
                url: hook.endpoint,
                method: hook.method,
                body: hook.body,
                headers: hook.headers,
              }, { ...context, event });
            }
            break;
            
          case 'assign':
            if (hook.target && hook.value !== undefined) {
              // Simple assignment - in production would use XState assign
              context[hook.target] = hook.value;
            }
            break;
            
          case 'log':
            console.log(`[${phase}] ${hook.message || 'Hook executed'}`, { context, event });
            break;
            
          case 'analytics':
            // Analytics tracking - would integrate with analytics service
            console.log(`[Analytics] ${hook.event}`, hook.data);
            break;
            
          case 'delay':
            if (hook.duration) {
              await new Promise(resolve => setTimeout(resolve, hook.duration));
            }
            break;
            
          case 'condition':
            if (hook.expression) {
              // Evaluate condition and execute onTrue/onFalse hooks
              const result = this.evaluateCondition(hook.expression, { ...context, event });
              const hooksToExecute = result ? hook.onTrue : hook.onFalse;
              
              if (hooksToExecute) {
                for (const subHook of hooksToExecute) {
                  await this.createHookAction(subHook, phase)(context, event);
                }
              }
            }
            break;
        }
      } catch (error) {
        if (hook.onError === 'fail') {
          throw error;
        }
        // Otherwise ignore error
        console.warn(`Hook ${hook.id} failed:`, error);
      }
    };
  }

  /**
   * Evaluate condition expression
   */
  private evaluateCondition(expression: unknown, data: Record<string, unknown>): boolean {
    if (typeof expression === 'boolean') {
      return expression;
    }
    
    if (typeof expression === 'string') {
      // Simple template evaluation
      const result = this.templateParser.parse(expression, data);
      return result === 'true' || result === '1';
    }
    
    return false;
  }
}
