/**
 * Flow Orchestrator
 * Main class that orchestrates complex flow processes from JSON definitions to XState machines
 * 
 * Features:
 * - Defensive validation of input data
 * - Comprehensive error handling and logging
 * - Runtime type checking
 * - Schema validation
 */

import { createMachine } from 'xstate';
import type { FlowConfig, Step, NavigationConfig } from '../types';

// Error types for better error handling
export class FlowOrchestrationError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'FlowOrchestrationError';
  }
}

export class ValidationError extends FlowOrchestrationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
  }
}

export class ConfigurationError extends FlowOrchestrationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CONFIGURATION_ERROR', context);
    this.name = 'ConfigurationError';
  }
}

// Validation result interface
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Logging interface
interface Logger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
}

// Silent logger for development
class SilentLogger implements Logger {
  info(_message: string, _context?: Record<string, unknown>): void {
    // Silent - no logging
  }
  
  warn(_message: string, _context?: Record<string, unknown>): void {
    // Silent - no logging
  }
  
  error(_message: string, _context?: Record<string, unknown>): void {
    // Silent - no logging
  }
  
  debug(_message: string, _context?: Record<string, unknown>): void {
    // Silent - no logging
  }
}

// Console logger for debugging
class ConsoleLogger implements Logger {
  info(message: string, context?: Record<string, unknown>): void {
    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    console.log(`[XFlows] INFO: ${message}`, context || '');
  }
  
  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(`[XFlows] WARN: ${message}`, context || '');
  }
  
  error(message: string, context?: Record<string, unknown>): void {
    console.error(`[XFlows] ERROR: ${message}`, context || '');
  }
  
  debug(message: string, context?: Record<string, unknown>): void {
    console.debug(`[XFlows] DEBUG: ${message}`, context || '');
  }
}

export class FlowOrchestrator {
  private logger: Logger;

  constructor(logger?: Logger | boolean) {
    if (typeof logger === 'boolean') {
      this.logger = logger ? new ConsoleLogger() : new SilentLogger();
    } else {
      this.logger = logger || new SilentLogger();
    }
  }

  /**
   * Create a deep copy of the flow configuration using spread operator
   */
  private deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T;
    }
    
    if (Array.isArray(obj)) {
      return [...obj.map(item => this.deepClone(item))] as unknown as T;
    }
    
    return { ...obj } as T;
  }

  /**
   * Merge multiple flow configurations
   */

  /**
   * Orchestrate flow configuration to XState machine with comprehensive validation
   */
  orchestrate(flowConfig: unknown): ReturnType<typeof createMachine> {
    this.logger.info('Starting flow orchestration', { 
      configType: typeof flowConfig,
      hasId: !!(flowConfig as Record<string, unknown>)?.id 
    });

    try {
      // Step 1: Validate input
      const validation = this.validateFlowConfig(flowConfig);
      if (!validation.valid) {
        throw new ValidationError(
          `Flow configuration validation failed: ${validation.errors.join(', ')}`,
          { errors: validation.errors, warnings: validation.warnings }
        );
      }

      // Log warnings if any
      if (validation.warnings.length > 0) {
        this.logger.warn('Flow configuration has warnings', { warnings: validation.warnings });
      }

      const config = flowConfig as FlowConfig;
      
      // Use the config directly since it's already validated
      const mergedConfig = config;
      
      this.logger.info('Flow configuration validated successfully', { 
        flowId: mergedConfig.id,
        stepsCount: mergedConfig.steps.length 
      });

      // Step 2: Validate flow structure
      const structureValidation = this.validateFlowStructure(mergedConfig);
      if (!structureValidation.valid) {
        throw new ConfigurationError(
          `Flow structure validation failed: ${structureValidation.errors.join(', ')}`,
          { errors: structureValidation.errors }
        );
      }

      // Step 3: Create XState machine
      const machine = this.createMachine(mergedConfig);
      
      this.logger.info('Flow orchestration completed successfully', { 
        flowId: mergedConfig.id,
        statesCount: machine.config.states ? Object.keys(machine.config.states).length : 0
      });

      return machine;

    } catch (error) {
      this.logger.error('Flow orchestration failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error
      });
      
      throw error;
    }
  }

  /**
   * Public method to validate flow configuration
   */
  validateFlow(input: unknown): ValidationResult {
    return this.validateFlowConfig(input);
  }

  /**
   * Validate flow configuration input
   */
  private validateFlowConfig(input: unknown): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if input is an object
    if (!input || typeof input !== 'object') {
      errors.push('Flow configuration must be an object');
      return { valid: false, errors, warnings };
    }

    const config = input as Record<string, unknown>;

    // Required fields validation
    const requiredFields = ['id', 'name', 'initialStep', 'context', 'steps'];
    for (const field of requiredFields) {
      if (!(field in config)) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Type validations
    if (config.id && typeof config.id !== 'string') {
      errors.push('Field "id" must be a string');
    }

    if (config.name && typeof config.name !== 'string') {
      errors.push('Field "name" must be a string');
    }

    if (config.initialStep && typeof config.initialStep !== 'string') {
      errors.push('Field "initialStep" must be a string');
    }

    if (config.context && typeof config.context !== 'object') {
      errors.push('Field "context" must be an object');
    }

    if (config.steps && !Array.isArray(config.steps)) {
      errors.push('Field "steps" must be an array');
    }

    // ID format validation
    if (config.id && typeof config.id === 'string') {
      if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(config.id)) {
        errors.push('Field "id" must start with a letter and contain only letters, numbers, hyphens, and underscores');
      }
    }

    // Steps validation
    if (Array.isArray(config.steps)) {
      if (config.steps.length === 0) {
        warnings.push('Flow has no steps defined');
      }

      // Validate each step
      config.steps.forEach((step, index) => {
        if (!step || typeof step !== 'object') {
          errors.push(`Step at index ${index} must be an object`);
          return;
        }

        const stepObj = step as Record<string, unknown>;
        
        if (!stepObj.id || typeof stepObj.id !== 'string') {
          errors.push(`Step at index ${index} must have a string "id" field`);
        }

        if (!stepObj.name || typeof stepObj.name !== 'string') {
          errors.push(`Step at index ${index} must have a string "name" field`);
        }

        if (!stepObj.view || typeof stepObj.view !== 'object') {
          errors.push(`Step at index ${index} must have a "view" object`);
        }

        if (!stepObj.navigation || typeof stepObj.navigation !== 'object') {
          errors.push(`Step at index ${index} must have a "navigation" object`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate flow structure and dependencies
   */
  private validateFlowStructure(config: FlowConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if initial step exists
    const stepIds = config.steps.map((step: Step) => step.id);
    if (!stepIds.includes(config.initialStep)) {
      errors.push(`Initial step "${config.initialStep}" not found in steps`);
    }

    // Check for duplicate step IDs
    const uniqueIds = new Set(stepIds);
    if (uniqueIds.size !== stepIds.length) {
      const duplicateIds = stepIds.filter((id: string, index: number) => stepIds.indexOf(id) !== index);
      errors.push(`Duplicate step IDs found: ${duplicateIds.join(', ')}`);
    }

    // Validate step references
    for (const step of config.steps) {
      // Check navigation targets
      if (step.navigation.onNext) {
        const nextTarget = this.extractNavigationTarget(step.navigation.onNext);
        if (nextTarget && !stepIds.includes(nextTarget)) {
          errors.push(`Step "${step.id}" references non-existent next step "${nextTarget}"`);
        }
      }

      if (step.navigation.onBack && !stepIds.includes(step.navigation.onBack)) {
        errors.push(`Step "${step.id}" references non-existent back step "${step.navigation.onBack}"`);
      }

      if (step.navigation.onError && !stepIds.includes(step.navigation.onError)) {
        errors.push(`Step "${step.id}" references non-existent error step "${step.navigation.onError}"`);
      }

      // Validate guards references
      if (step.navigation.onNext && typeof step.navigation.onNext === 'object') {
        const navigationConfig = step.navigation.onNext as NavigationConfig;
        if (navigationConfig.guard && config.guards && !(navigationConfig.guard in config.guards)) {
          errors.push(`Step "${step.id}" references non-existent guard "${navigationConfig.guard}"`);
        }
      }
    }

    // Validate guards
    if (config.guards) {
      const guardIds = Object.keys(config.guards);
      const duplicateGuards = guardIds.filter((id, index) => guardIds.indexOf(id) !== index);
      if (duplicateGuards.length > 0) {
        errors.push(`Duplicate guard IDs found: ${duplicateGuards.join(', ')}`);
      }
    }

    // Validate actions
    if (config.actions) {
      const actionIds = Object.keys(config.actions);
      const duplicateActions = actionIds.filter((id, index) => actionIds.indexOf(id) !== index);
      if (duplicateActions.length > 0) {
        errors.push(`Duplicate action IDs found: ${duplicateActions.join(', ')}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Extract navigation target from navigation config
   */
  private extractNavigationTarget(navigation: string | NavigationConfig | NavigationConfig[]): string | null {
    if (typeof navigation === 'string') {
      return navigation;
    }
    
    if (navigation && typeof navigation === 'object') {
      if (Array.isArray(navigation)) {
        return navigation[0]?.target || null;
      }
      return (navigation as NavigationConfig).target || null;
    }
    
    return null;
  }

  /**
   * Create XState machine from validated configuration
   */
  private createMachine(config: FlowConfig): ReturnType<typeof createMachine> {
    this.logger.debug('Creating XState machine', { flowId: config.id });

    const states = config.steps.reduce((acc: Record<string, unknown>, step: Step) => {
      try {
        acc[step.id] = this.createStepState(step, config);
        this.logger.debug(`Created state for step: ${step.id}`);
      } catch (error) {
        this.logger.error(`Failed to create state for step: ${step.id}`, { 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        throw new ConfigurationError(
          `Failed to create state for step "${step.id}": ${error instanceof Error ? error.message : 'Unknown error'}`,
          { stepId: step.id, step: step }
        );
      }
      return acc;
    }, {} as Record<string, unknown>);

    return createMachine({
      id: config.id,
      initial: config.initialStep,
      context: config.context,
      states: {
        ...states,
        error: {
          meta: {
            view: {
              type: 'error',
              title: 'Error',
              message: 'An error occurred',
              actions: [
                { type: 'button', label: 'Retry', event: 'RETRY' },
                { type: 'button', label: 'Reset', event: 'RESET' }
              ]
            }
          },
          on: {
            RETRY: config.initialStep,
            RESET: config.initialStep
          }
        }
      }
    });
  }

  /**
   * Create XState state from step configuration
   */
  private createStepState(step: Step, flowConfig: FlowConfig) {
    this.logger.debug(`Creating step state: ${step.id}`);

    const state: Record<string, unknown> = {
      meta: {
        view: step.view
      }
    };

    // Navigation
    if (step.navigation) {
      try {
        state.on = this.createNavigation(step.navigation, flowConfig);
      } catch (error) {
        throw new ConfigurationError(
          `Failed to create navigation for step "${step.id}": ${error instanceof Error ? error.message : 'Unknown error'}`,
          { stepId: step.id, navigation: step.navigation }
        );
      }
    }

    // Hooks (after actions)
    if (step.hooks?.after) {
      try {
        state.after = this.createHooks(step.hooks.after);
      } catch (error) {
        throw new ConfigurationError(
          `Failed to create hooks for step "${step.id}": ${error instanceof Error ? error.message : 'Unknown error'}`,
          { stepId: step.id, hooks: step.hooks }
        );
      }
    }

    return state;
  }

  /**
   * Create navigation configuration
   */
  private createNavigation(navigation: Record<string, unknown>, flowConfig: FlowConfig) {
    const events: Record<string, unknown> = {};

    // Map semantic navigation events to XState events
    const eventMapping: Record<string, string> = {
      onNext: 'NEXT',
      onBack: 'BACK',
      onError: 'ERROR',
      onCancel: 'CANCEL'
    };

    for (const [semanticEvent, config] of Object.entries(navigation)) {
      const xstateEvent = eventMapping[semanticEvent] || semanticEvent;
      
      try {
      if (typeof config === 'string') {
        events[xstateEvent] = config;
      } else if (Array.isArray(config)) {
          events[xstateEvent] = config.map((c: Record<string, unknown>) => ({
          target: c.target,
            guard: c.guard ? flowConfig.guards?.[c.guard as string] : undefined,
          actions: c.actions
        }));
      } else if (config && typeof config === 'object') {
          const configObj = config as Record<string, unknown>;
        events[xstateEvent] = {
          target: configObj.target,
            guard: configObj.guard ? flowConfig.guards?.[configObj.guard as string] : undefined,
          actions: configObj.actions
        };
        }
      } catch (error) {
        throw new ConfigurationError(
          `Failed to process navigation event "${semanticEvent}": ${error instanceof Error ? error.message : 'Unknown error'}`,
          { semanticEvent, config }
        );
      }
    }

    return events;
  }

  /**
   * Create hooks configuration for XState
   */
  private createHooks(hooks: unknown[]): Record<string, unknown> {
    const hookConfig: Record<string, unknown> = {};

    hooks.forEach((hook, index) => {
      if (!hook || typeof hook !== 'object') {
        throw new ConfigurationError(`Hook at index ${index} must be an object`);
      }

      const hookObj = hook as Record<string, unknown>;
      
      if (!hookObj.id || typeof hookObj.id !== 'string') {
        throw new ConfigurationError(`Hook at index ${index} must have a string "id" field`);
      }

      if (!hookObj.type || typeof hookObj.type !== 'string') {
        throw new ConfigurationError(`Hook at index ${index} must have a string "type" field`);
      }

      // Create XState after configuration based on hook type
      switch (hookObj.type) {
        case 'delay':
          // For delay hooks, we'll add a simple delay action
          hookConfig[hookObj.id] = {
            delay: hookObj.duration || 1000
          };
          break;
        case 'http':
          hookConfig[hookObj.id] = {
            invoke: {
              src: 'httpRequest',
              onDone: 'complete',
              onError: 'error'
            }
          };
          break;
        default:
          // Generic hook - just pass through
          hookConfig[hookObj.id] = hookObj;
      }
    });

    return hookConfig;
  }
}