import { describe, it, expect } from 'vitest';
import { FlowOrchestrator } from '../engine/flow-orchestrator';

describe('FlowOrchestrator Integration Tests', () => {
  const orchestrator = new FlowOrchestrator();

  describe('Basic Flow Creation', () => {
    it('should create a simple flow with form and display steps', () => {
      const flowConfig = {
        id: 'simple-form-flow',
        name: 'Simple Form Flow',
        version: '1.0.0',
        description: 'A simple flow with form and display steps',
        initialStep: 'form-step',
        context: {
          user: null,
          data: {},
          errors: []
        },
        steps: [
          {
            id: 'form-step',
            name: 'Form Step',
            view: {
              type: 'form',
              title: 'User Information',
              subtitle: 'Please fill out the form',
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  label: 'Name',
                  required: true,
                  placeholder: 'Enter your name'
                },
                {
                  name: 'email',
                  type: 'email',
                  label: 'Email',
                  required: true,
                  placeholder: 'Enter your email'
                }
              ],
              actions: [
                { type: 'submit', label: 'Submit', event: 'SUBMIT' },
                { type: 'button', label: 'Cancel', event: 'CANCEL' }
              ]
            },
            navigation: {
              onNext: 'display-step',
              onBack: 'display-step'
            }
          },
          {
            id: 'display-step',
            name: 'Display Step',
            view: {
              type: 'display',
              title: 'Information Submitted',
              subtitle: 'Thank you for your submission',
              message: 'Your information has been submitted successfully.',
              actions: [
                { type: 'button', label: 'Start Over', event: 'RESTART' }
              ]
            },
            navigation: {
              onNext: 'form-step'
            }
          }
        ]
      };

      expect(() => {
        const machine = orchestrator.orchestrate(flowConfig);
        expect(machine).toBeDefined();
        expect(machine.config.id).toBe('simple-form-flow');
        expect(machine.config.initial).toBe('form-step');
        expect(machine.config.states).toBeDefined();
        expect(machine.config.states?.['form-step']).toBeDefined();
        expect(machine.config.states?.['display-step']).toBeDefined();
      }).not.toThrow();
    });

    it('should create a flow with loading and success steps', () => {
      const flowConfig = {
        id: 'loading-success-flow',
        name: 'Loading Success Flow',
        initialStep: 'loading',
        context: {
          isLoading: false,
          data: null
        },
        steps: [
          {
            id: 'loading',
            name: 'Loading Step',
            view: {
              type: 'loading',
              title: 'Processing...',
              message: 'Please wait while we process your request.'
            },
            navigation: {
              onNext: 'success'
            }
          },
          {
            id: 'success',
            name: 'Success Step',
            view: {
              type: 'success',
              title: 'Success!',
              message: 'Your request has been processed successfully.',
              actions: [
                { type: 'button', label: 'Continue', event: 'CONTINUE' }
              ]
            },
            navigation: {
              onNext: 'loading'
            }
          }
        ]
      };

      expect(() => {
        const machine = orchestrator.orchestrate(flowConfig);
        expect(machine).toBeDefined();
        expect(machine.config.states?.loading).toBeDefined();
        expect(machine.config.states?.success).toBeDefined();
      }).not.toThrow();
    });

    it('should create a flow with error handling', () => {
      const flowConfig = {
        id: 'error-handling-flow',
        name: 'Error Handling Flow',
        initialStep: 'main',
        context: {
          error: null
        },
        steps: [
          {
            id: 'main',
            name: 'Main Step',
            view: {
              type: 'form',
              title: 'Main Form',
              fields: [
                { name: 'input', type: 'text', label: 'Input' }
              ],
              actions: [
                { type: 'submit', label: 'Submit', event: 'SUBMIT' }
              ]
            },
            navigation: {
              onNext: 'error',
              onError: 'error'
            }
          },
          {
            id: 'error',
            name: 'Error Step',
            view: {
              type: 'error',
              title: 'Error Occurred',
              message: 'Something went wrong. Please try again.',
              actions: [
                { type: 'button', label: 'Retry', event: 'RETRY' },
                { type: 'button', label: 'Back', event: 'BACK' }
              ]
            },
            navigation: {
              onNext: 'main',
              onBack: 'main'
            }
          }
        ]
      };

      expect(() => {
        const machine = orchestrator.orchestrate(flowConfig);
        expect(machine).toBeDefined();
        expect(machine.config.states?.main).toBeDefined();
        expect(machine.config.states?.error).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('Flow Validation', () => {
    it('should validate a correct flow configuration', () => {
      const validFlow = {
        id: 'valid-flow',
        name: 'Valid Flow',
        initialStep: 'step1',
        context: {},
        steps: [
          {
            id: 'step1',
            name: 'Step 1',
            view: { type: 'display', title: 'Step 1' },
            navigation: { onNext: 'step2' }
          },
          {
            id: 'step2',
            name: 'Step 2',
            view: { type: 'display', title: 'Step 2' },
            navigation: { onBack: 'step1' }
          }
        ]
      };

      const validation = orchestrator.validateFlow(validFlow);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject flow with missing required fields', () => {
      const invalidFlow = {
        id: 'invalid-flow',
        // Missing name, initialStep, context, steps
      };

      const validation = orchestrator.validateFlow(invalidFlow);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should reject flow with invalid step references', () => {
      const invalidFlow = {
        id: 'invalid-refs-flow',
        name: 'Invalid References Flow',
        initialStep: 'step1',
        context: {},
        steps: [
          {
            id: 'step1',
            name: 'Step 1',
            view: { type: 'display', title: 'Step 1' },
            navigation: { onNext: 'nonexistent-step' } // References non-existent step
          }
        ]
      };

      expect(() => {
        orchestrator.orchestrate(invalidFlow);
      }).toThrow();
    });

    it('should reject flow with duplicate step IDs', () => {
      const invalidFlow = {
        id: 'duplicate-ids-flow',
        name: 'Duplicate IDs Flow',
        initialStep: 'step1',
        context: {},
        steps: [
          {
            id: 'step1',
            name: 'Step 1',
            view: { type: 'display', title: 'Step 1' },
            navigation: { onNext: 'step2' }
          },
          {
            id: 'step1', // Duplicate ID
            name: 'Step 1 Duplicate',
            view: { type: 'display', title: 'Step 1 Duplicate' },
            navigation: {}
          }
        ]
      };

      expect(() => {
        orchestrator.orchestrate(invalidFlow);
      }).toThrow();
    });
  });

  describe('Complex Flow Scenarios', () => {
    it('should handle a multi-step registration flow', () => {
      const registrationFlow = {
        id: 'registration-flow',
        name: 'User Registration Flow',
        initialStep: 'welcome',
        context: {
          user: {},
          stepData: {},
          errors: []
        },
        steps: [
          {
            id: 'welcome',
            name: 'Welcome',
            view: {
              type: 'display',
              title: 'Welcome to Registration',
              message: 'Let\'s get you started!',
              actions: [
                { type: 'button', label: 'Get Started', event: 'START' }
              ]
            },
            navigation: {
              onNext: 'personal-info'
            }
          },
          {
            id: 'personal-info',
            name: 'Personal Information',
            view: {
              type: 'form',
              title: 'Personal Information',
              fields: [
                { name: 'firstName', type: 'text', label: 'First Name', required: true },
                { name: 'lastName', type: 'text', label: 'Last Name', required: true },
                { name: 'email', type: 'email', label: 'Email', required: true }
              ],
              actions: [
                { type: 'submit', label: 'Continue', event: 'NEXT' },
                { type: 'button', label: 'Back', event: 'BACK' }
              ]
            },
            navigation: {
              onNext: 'verification',
              onBack: 'welcome'
            }
          },
          {
            id: 'verification',
            name: 'Email Verification',
            view: {
              type: 'display',
              title: 'Verify Your Email',
              message: 'We\'ve sent a verification link to your email.',
              actions: [
                { type: 'button', label: 'I\'ve Verified', event: 'VERIFIED' },
                { type: 'button', label: 'Resend Email', event: 'RESEND' },
                { type: 'button', label: 'Back', event: 'BACK' }
              ]
            },
            navigation: {
              onNext: 'complete',
              onBack: 'personal-info'
            }
          },
          {
            id: 'complete',
            name: 'Registration Complete',
            view: {
              type: 'success',
              title: 'Registration Complete!',
              message: 'Welcome to our platform!',
              actions: [
                { type: 'button', label: 'Continue', event: 'CONTINUE' }
              ]
            },
            navigation: {
              onNext: 'welcome'
            }
          }
        ]
      };

      expect(() => {
        const machine = orchestrator.orchestrate(registrationFlow);
        expect(machine).toBeDefined();
        expect(machine.config.states?.welcome).toBeDefined();
        expect(machine.config.states?.['personal-info']).toBeDefined();
        expect(machine.config.states?.verification).toBeDefined();
        expect(machine.config.states?.complete).toBeDefined();
      }).not.toThrow();
    });
  });
});
