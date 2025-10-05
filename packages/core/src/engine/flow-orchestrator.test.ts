/**
 * Test for FlowOrchestrator with defensive validation
 */

import { describe, it, expect } from 'vitest';
import { FlowOrchestrator, ValidationError, ConfigurationError } from './flow-orchestrator';
import { schemaValidator } from '../validation/schema-validator';
import { runtimeTypeValidator } from '../validation/runtime-type-validator';

describe('FlowOrchestrator', () => {
  const orchestrator = new FlowOrchestrator();

  it('should validate and orchestrate a valid flow configuration', () => {
    const validFlowConfig = {
      id: 'test-flow',
      name: 'Test Flow',
      initialStep: 'step1',
      context: { test: 'value' },
      steps: [
        {
          id: 'step1',
          name: 'First Step',
          view: { type: 'form', title: 'Welcome' },
          navigation: { onNext: 'step2' }
        },
        {
          id: 'step2',
          name: 'Second Step',
          view: { type: 'display', message: 'Complete' },
          navigation: { onBack: 'step1' }
        }
      ]
    };

    const machine = orchestrator.orchestrate(validFlowConfig);
    
    expect(machine).toBeDefined();
    expect(machine.config.id).toBe('test-flow');
    expect(machine.config.initial).toBe('step1');
  });

  it('should throw ValidationError for invalid input', () => {
    const invalidConfig = {
      // Missing required fields
      id: 'test-flow'
    };

    expect(() => {
      orchestrator.orchestrate(invalidConfig);
    }).toThrow(ValidationError);
  });

  it('should throw ConfigurationError for invalid flow structure', () => {
    const invalidFlowConfig = {
      id: 'test-flow',
      name: 'Test Flow',
      initialStep: 'nonexistent-step', // References non-existent step
      context: {},
      steps: [
        {
          id: 'step1',
          name: 'First Step',
          view: { type: 'form' },
          navigation: { onNext: 'step2' }
        }
      ]
    };

    expect(() => {
      orchestrator.orchestrate(invalidFlowConfig);
    }).toThrow(ConfigurationError);
  });

  it('should validate step references', () => {
    const invalidFlowConfig = {
      id: 'test-flow',
      name: 'Test Flow',
      initialStep: 'step1',
      context: {},
      steps: [
        {
          id: 'step1',
          name: 'First Step',
          view: { type: 'form' },
          navigation: { onNext: 'nonexistent-step' } // References non-existent step
        }
      ]
    };

    expect(() => {
      orchestrator.orchestrate(invalidFlowConfig);
    }).toThrow(ConfigurationError);
  });
});

describe('SchemaValidator', () => {
  it('should validate valid flow configuration', () => {
    const validConfig = {
      id: 'test-flow',
      name: 'Test Flow',
      initialStep: 'step1',
      context: {},
      steps: [
        {
          id: 'step1',
          name: 'First Step',
          view: {},
          navigation: {}
        }
      ]
    };

    const result = schemaValidator.validateFlowConfig(validConfig);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject invalid flow configuration', () => {
    const invalidConfig = {
      id: 'invalid-id!', // Invalid pattern
      name: '', // Empty name
      initialStep: 'step1',
      context: {},
      steps: []
    };

    const result = schemaValidator.validateFlowConfig(invalidConfig);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('RuntimeTypeValidator', () => {
  it('should validate flow configuration types', () => {
    const validConfig = {
      id: 'test-flow',
      name: 'Test Flow',
      initialStep: 'step1',
      context: {},
      steps: [
        {
          id: 'step1',
          name: 'First Step',
          view: {},
          navigation: {}
        }
      ]
    };

    const result = runtimeTypeValidator.validateFlowConfig(validConfig);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject invalid types', () => {
    const invalidConfig = {
      id: 123, // Should be string
      name: 'Test Flow',
      initialStep: 'step1',
      context: {},
      steps: 'not-an-array' // Should be array
    };

    const result = runtimeTypeValidator.validateFlowConfig(invalidConfig);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});