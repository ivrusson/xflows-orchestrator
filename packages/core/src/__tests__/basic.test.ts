import { describe, it, expect } from 'vitest';
import { FlowOrchestrator } from '../engine/flow-orchestrator';

describe('FlowOrchestrator Basic Tests', () => {
  const orchestrator = new FlowOrchestrator();

  it('should create a simple valid flow', () => {
    const simpleFlow = {
      id: 'simple-test',
      name: 'Simple Test Flow',
      initialStep: 'start',
      context: { test: 'value' },
      steps: [
        {
          id: 'start',
          name: 'Start Step',
          view: { 
            type: 'display', 
            title: 'Welcome',
            message: 'This is a simple test'
          },
          navigation: { 
            onNext: 'end' 
          }
        },
        {
          id: 'end',
          name: 'End Step',
          view: { 
            type: 'success', 
            title: 'Complete',
            message: 'Flow completed successfully'
          },
          navigation: {}
        }
      ]
    };

    expect(() => {
      const machine = orchestrator.orchestrate(simpleFlow);
      expect(machine).toBeDefined();
      expect(machine.config.id).toBe('simple-test');
    }).not.toThrow();
  });

  it('should validate flow configuration', () => {
    const validFlow = {
      id: 'validation-test',
      name: 'Validation Test',
      initialStep: 'step1',
      context: {},
      steps: [
        {
          id: 'step1',
          name: 'Step 1',
          view: { type: 'form', title: 'Form' },
          navigation: { onNext: 'step2' }
        },
        {
          id: 'step2',
          name: 'Step 2',
          view: { type: 'display', title: 'Display' },
          navigation: { onBack: 'step1' }
        }
      ]
    };

    const validation = orchestrator.validateFlow(validFlow);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('should handle invalid flow configuration', () => {
    const invalidFlow = {
      id: 'invalid-test',
      // Missing required fields
    };

    expect(() => {
      orchestrator.orchestrate(invalidFlow);
    }).toThrow();
  });
});
