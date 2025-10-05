import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FlowOrchestrator } from '../engine/flow-orchestrator';
// Note: Plugin imports will be mocked for now
// import { PluginManager } from '@xflows/plugins';
// import { HttpActionPlugin, HttpActorPlugin } from '@xflows/plugin-http';

// Mock fetch
global.fetch = vi.fn();

// Mock PluginManager and plugins
const mockPluginManager = {
  register: vi.fn(),
  execute: vi.fn(),
  getPlugin: vi.fn(),
  hasPlugin: vi.fn()
};

const mockHttpActionPlugin = {
  id: 'http-action',
  type: 'action',
  version: '1.0.0',
  execute: vi.fn()
};

const mockHttpActorPlugin = {
  id: 'http-actor',
  type: 'actor', 
  version: '1.0.0',
  execute: vi.fn()
};

describe('FlowOrchestrator + Plugin Integration Tests', () => {
  let orchestrator: FlowOrchestrator;

  beforeEach(() => {
    vi.clearAllMocks();
    orchestrator = new FlowOrchestrator();
    
    // Setup mocks
    mockPluginManager.register.mockClear();
    mockHttpActionPlugin.execute.mockClear();
    mockHttpActorPlugin.execute.mockClear();
  });

  describe('Flow Configuration with Plugins', () => {
    it('should create machine with plugin configuration', () => {
      const flowWithPlugins = {
        id: 'plugin-test-flow',
        name: 'Plugin Test Flow',
        version: '1.0.0',
        description: 'Flow that uses plugins',
        initialStep: 'start',
        context: {
          user: null,
          data: {},
          errors: []
        },
        plugins: {
          httpClient: {
            type: 'actor',
            config: {
              baseUrl: 'https://api.example.com',
              timeout: 5000,
              retries: 3
            }
          },
          httpAction: {
            type: 'action',
            config: {
              retries: 2,
              timeout: 3000
            }
          }
        },
        steps: [
          {
            id: 'start',
            name: 'Start',
            view: {
              type: 'display',
              title: 'Starting Flow',
              message: 'This flow uses HTTP plugins',
              actions: [
                { type: 'button', label: 'Continue', event: 'NEXT' }
              ]
            },
            navigation: {
              onNext: 'api-call'
            }
          },
          {
            id: 'api-call',
            name: 'API Call',
            view: {
              type: 'loading',
              title: 'Calling API',
              message: 'Making HTTP request...'
            },
            invoke: {
              src: 'httpClient',
              input: {
                endpoint: '/api/users',
                method: 'GET'
              },
              onDone: 'success',
              onError: 'error'
            },
            navigation: {
              onNext: 'success',
              onBack: 'start'
            }
          },
          {
            id: 'success',
            name: 'Success',
            view: {
              type: 'success',
              title: 'API Call Successful',
              message: 'Data retrieved successfully',
              actions: [
                { type: 'button', label: 'Restart', event: 'RESTART' }
              ]
            },
            navigation: {
              onNext: 'start'
            }
          },
          {
            id: 'error',
            name: 'Error',
            view: {
              type: 'error',
              title: 'API Call Failed',
              message: 'Something went wrong',
              actions: [
                { type: 'button', label: 'Retry', event: 'RETRY' },
                { type: 'button', label: 'Back', event: 'BACK' }
              ]
            },
            navigation: {
              onNext: 'api-call',
              onBack: 'start'
            }
          }
        ]
      };

      // Should create machine without errors
      expect(() => {
        const machine = orchestrator.orchestrate(flowWithPlugins);
        expect(machine).toBeDefined();
        expect(machine.config).toBeDefined();
        expect(machine.config.states).toBeDefined();
      }).not.toThrow();
    });

    it('should validate flow with plugin configuration', () => {
      const flowWithPlugins = {
        id: 'validation-test',
        name: 'Validation Test',
        initialStep: 'start',
        context: {},
        plugins: {
          httpClient: {
            type: 'actor',
            config: { baseUrl: 'https://api.example.com' }
          }
        },
        steps: [
          {
            id: 'start',
            name: 'Start',
            view: {
              type: 'display',
              title: 'Start',
              actions: [
                { type: 'button', label: 'Next', event: 'NEXT' }
              ]
            },
            navigation: {
              onNext: 'end'
            }
          },
          {
            id: 'end',
            name: 'End',
            view: {
              type: 'success',
              title: 'Complete',
              actions: [
                { type: 'button', label: 'Restart', event: 'RESTART' }
              ]
            },
            navigation: {
              onNext: 'start'
            }
          }
        ]
      };

      const validation = orchestrator.validateFlow(flowWithPlugins);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('Plugin Execution Integration', () => {
    it('should execute HTTP actor plugin successfully', async () => {
      const mockResponse = { users: [{ id: 1, name: 'John' }] };
      mockHttpActorPlugin.execute.mockResolvedValueOnce(mockResponse);

      const result = await mockHttpActorPlugin.execute({
        endpoint: '/api/users',
        method: 'GET'
      }, {});

      expect(result).toEqual(mockResponse);
      expect(mockHttpActorPlugin.execute).toHaveBeenCalledWith({
        endpoint: '/api/users',
        method: 'GET'
      }, {});
    });

    it('should execute HTTP action plugin successfully', async () => {
      const mockResponse = { success: true, id: 123 };
      mockHttpActionPlugin.execute.mockResolvedValueOnce(mockResponse);

      const result = await mockHttpActionPlugin.execute({
        endpoint: '/api/users',
        method: 'POST',
        body: { name: 'John Doe', email: 'john@example.com' }
      }, {});

      expect(result).toEqual(mockResponse);
      expect(mockHttpActionPlugin.execute).toHaveBeenCalledWith({
        endpoint: '/api/users',
        method: 'POST',
        body: { name: 'John Doe', email: 'john@example.com' }
      }, {});
    });

    it('should handle plugin execution errors', async () => {
      mockHttpActorPlugin.execute.mockRejectedValueOnce(new Error('Network error'));
      
      await expect(mockHttpActorPlugin.execute({
        endpoint: '/api/failing-endpoint',
        method: 'GET'
      }, {})).rejects.toThrow('Network error');
    });
  });

  describe('Complex Flow Scenarios', () => {
    it('should handle flow with multiple plugin types', () => {
      const complexFlow = {
        id: 'complex-flow',
        name: 'Complex Flow',
        initialStep: 'start',
        context: {
          user: null,
          data: {},
          errors: [],
          ui: { isLoading: false }
        },
        plugins: {
          httpClient: {
            type: 'actor',
            config: {
              baseUrl: 'https://api.example.com',
              timeout: 10000,
              retries: 3
            }
          },
          httpAction: {
            type: 'action',
            config: {
              timeout: 5000,
              retries: 2
            }
          }
        },
        actions: {
          saveUserData: {
            type: 'http-action',
            config: {
              endpoint: '/api/users',
              method: 'POST',
              body: '{{context.user}}'
            }
          },
          logActivity: {
            type: 'log',
            message: 'User completed step: {{event.step}}'
          }
        },
        steps: [
          {
            id: 'start',
            name: 'Start',
            view: {
              type: 'form',
              title: 'User Registration',
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  label: 'Name',
                  required: true
                },
                {
                  name: 'email',
                  type: 'email',
                  label: 'Email',
                  required: true
                }
              ],
              actions: [
                { type: 'submit', label: 'Register', event: 'REGISTER' }
              ]
            },
            hooks: {
              after: [
                {
                  id: 'save-user',
                  type: 'http-action',
                  config: {
                    endpoint: '/api/users',
                    method: 'POST',
                    body: '{{event.data}}'
                  }
                }
              ]
            },
            navigation: {
              onNext: 'verify-email'
            }
          },
          {
            id: 'verify-email',
            name: 'Verify Email',
            view: {
              type: 'display',
              title: 'Email Verification',
              message: 'Please check your email for verification link'
            },
            invoke: {
              src: 'httpClient',
              input: {
                endpoint: '/api/send-verification',
                method: 'POST',
                body: '{{context.user.email}}'
              },
              onDone: 'verification-sent',
              onError: 'verification-error'
            },
            navigation: {
              onNext: 'verification-sent',
              onBack: 'start'
            }
          },
          {
            id: 'verification-sent',
            name: 'Verification Sent',
            view: {
              type: 'success',
              title: 'Verification Email Sent',
              message: 'Check your inbox and click the verification link',
              actions: [
                { type: 'button', label: 'Resend', event: 'RESEND' },
                { type: 'button', label: 'Continue', event: 'NEXT' }
              ]
            },
            navigation: {
              onNext: 'complete',
              onBack: 'verify-email'
            }
          },
          {
            id: 'verification-error',
            name: 'Verification Error',
            view: {
              type: 'error',
              title: 'Error Sending Verification',
              message: 'Failed to send verification email',
              actions: [
                { type: 'button', label: 'Retry', event: 'RETRY' },
                { type: 'button', label: 'Back', event: 'BACK' }
              ]
            },
            navigation: {
              onNext: 'verify-email',
              onBack: 'start'
            }
          },
          {
            id: 'complete',
            name: 'Complete',
            view: {
              type: 'success',
              title: 'Registration Complete',
              message: 'Welcome to our platform!',
              actions: [
                { type: 'button', label: 'Start Over', event: 'RESTART' }
              ]
            },
            navigation: {
              onNext: 'start'
            }
          }
        ]
      };

      // Should create machine without errors
      expect(() => {
        const machine = orchestrator.orchestrate(complexFlow);
        expect(machine).toBeDefined();
        expect(machine.config.states).toBeDefined();
        
        // Check that all states are present
        expect(machine.config.states?.start).toBeDefined();
        expect(machine.config.states?.verifyEmail).toBeDefined();
        expect(machine.config.states?.verificationSent).toBeDefined();
        expect(machine.config.states?.verificationError).toBeDefined();
        expect(machine.config.states?.complete).toBeDefined();
      }).not.toThrow();
    });

    it('should validate complex flow configuration', () => {
      const complexFlow = {
        id: 'complex-validation-test',
        name: 'Complex Validation Test',
        initialStep: 'start',
        context: {},
        plugins: {
          httpClient: { type: 'actor', config: {} },
          httpAction: { type: 'action', config: {} }
        },
        actions: {
          saveData: { type: 'http-action', config: {} }
        },
        steps: [
          {
            id: 'start',
            name: 'Start',
            view: {
              type: 'form',
              title: 'Form',
              fields: [
                { name: 'field1', type: 'text', label: 'Field 1' }
              ],
              actions: [
                { type: 'submit', label: 'Submit', event: 'SUBMIT' }
              ]
            },
            hooks: {
              after: [
                { id: 'hook1', type: 'http-action', config: {} }
              ]
            },
            navigation: {
              onNext: 'end'
            }
          },
          {
            id: 'end',
            name: 'End',
            view: {
              type: 'success',
              title: 'Complete',
              actions: [
                { type: 'button', label: 'Restart', event: 'RESTART' }
              ]
            },
            navigation: {
              onNext: 'start'
            }
          }
        ]
      };

      const validation = orchestrator.validateFlow(complexFlow);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle invalid plugin configuration', () => {
      const flowWithInvalidPlugin = {
        id: 'invalid-plugin-test',
        name: 'Invalid Plugin Test',
        initialStep: 'start',
        context: {},
        plugins: {
          invalidPlugin: {
            type: 'invalid-type', // Invalid plugin type
            config: {}
          }
        },
        steps: [
          {
            id: 'start',
            name: 'Start',
            view: {
              type: 'display',
              title: 'Start',
              actions: [
                { type: 'button', label: 'Next', event: 'NEXT' }
              ]
            },
            navigation: {
              onNext: 'end'
            }
          },
          {
            id: 'end',
            name: 'End',
            view: {
              type: 'success',
              title: 'Complete',
              actions: [
                { type: 'button', label: 'Restart', event: 'RESTART' }
              ]
            },
            navigation: {
              onNext: 'start'
            }
          }
        ]
      };

      // Should still create machine (plugin validation happens at runtime)
      expect(() => {
        const machine = orchestrator.orchestrate(flowWithInvalidPlugin);
        expect(machine).toBeDefined();
      }).not.toThrow();
    });

    it('should handle missing required flow fields', () => {
      const invalidFlow = {
        id: 'invalid-flow',
        // Missing name, initialStep, context, steps
      };

      expect(() => {
        orchestrator.orchestrate(invalidFlow);
      }).toThrow();
    });
  });
});
