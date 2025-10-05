import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FlowComponent } from '@xflows/plugin-react';
import { FlowOrchestrator } from '@xflows/core';
import { PluginManager } from '@xflows/plugins';
import { HttpActionPlugin, HttpActorPlugin } from '@xflows/plugin-http';
import demoFlow from '../flows/demo-flow.json';

// Mock fetch for HTTP plugin tests
global.fetch = vi.fn();

describe('XFlows Integration Tests', () => {
  let pluginManager: PluginManager;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup plugin manager
    pluginManager = new PluginManager();
    pluginManager.register(new HttpActionPlugin());
    pluginManager.register(new HttpActorPlugin());
  });

  describe('FlowOrchestrator + Plugin Integration', () => {
    it('should create a valid XState machine from FlowConfig', () => {
      const orchestrator = new FlowOrchestrator();
      
      // This should not throw
      expect(() => {
        const machine = orchestrator.orchestrate(demoFlow);
        expect(machine).toBeDefined();
        expect(machine.config).toBeDefined();
      }).not.toThrow();
    });

    it('should validate FlowConfig structure', () => {
      const orchestrator = new FlowOrchestrator();
      
      const validation = orchestrator.validateFlow(demoFlow);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should handle invalid FlowConfig gracefully', () => {
      const orchestrator = new FlowOrchestrator();
      
      const invalidConfig = {
        id: 'invalid-flow',
        // Missing required fields
      };
      
      const validation = orchestrator.validateFlow(invalidConfig);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('React Plugin + Flow Integration', () => {
    it('should render FlowComponent with demo flow', () => {
      render(<FlowComponent flowConfig={demoFlow} />);
      
      // Should render the initial step
      expect(screen.getByText('Welcome to XFlows!')).toBeInTheDocument();
      expect(screen.getByText('React Demo Application')).toBeInTheDocument();
    });

    it('should handle flow navigation', async () => {
      render(<FlowComponent flowConfig={demoFlow} />);
      
      // Start the demo
      const startButton = screen.getByText('Get Started');
      fireEvent.click(startButton);
      
      // Should navigate to user-info step
      await waitFor(() => {
        expect(screen.getByText('User Information')).toBeInTheDocument();
        expect(screen.getByText('Tell us about yourself')).toBeInTheDocument();
      });
    });

    it('should handle form submission', async () => {
      render(<FlowComponent flowConfig={demoFlow} />);
      
      // Navigate to user-info step
      fireEvent.click(screen.getByText('Get Started'));
      
      await waitFor(() => {
        expect(screen.getByText('User Information')).toBeInTheDocument();
      });
      
      // Fill form
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      
      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      
      // Submit form
      const submitButton = screen.getByText('Continue');
      fireEvent.click(submitButton);
      
      // Should navigate to preferences step
      await waitFor(() => {
        expect(screen.getByText('Preferences')).toBeInTheDocument();
      });
    });

    it('should handle back navigation', async () => {
      render(<FlowComponent flowConfig={demoFlow} />);
      
      // Navigate forward
      fireEvent.click(screen.getByText('Get Started'));
      
      await waitFor(() => {
        expect(screen.getByText('User Information')).toBeInTheDocument();
      });
      
      // Go back
      const backButton = screen.getByText('Back');
      fireEvent.click(backButton);
      
      // Should return to welcome step
      await waitFor(() => {
        expect(screen.getByText('Welcome to XFlows!')).toBeInTheDocument();
      });
    });
  });

  describe('HTTP Plugin Integration', () => {
    it('should execute HTTP action plugin', async () => {
      const mockResponse = { success: true, data: { id: 123 } };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const httpPlugin = new HttpActionPlugin();
      const result = await httpPlugin.execute({
        endpoint: '/api/test',
        method: 'POST',
        body: { test: 'data' }
      }, {});

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: 'data' }),
      });
    });

    it('should execute HTTP actor plugin', async () => {
      const mockResponse = { success: true, data: { id: 456 } };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const httpActorPlugin = new HttpActorPlugin();
      const result = await httpActorPlugin.execute({
        endpoint: '/api/users',
        method: 'GET'
      }, {});

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should handle HTTP errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const httpPlugin = new HttpActionPlugin();
      
      await expect(httpPlugin.execute({
        endpoint: '/api/error',
        method: 'GET'
      }, {})).rejects.toThrow('Network error');
    });
  });

  describe('Complete Flow + Plugin Integration', () => {
    it('should handle complete user journey with plugins', async () => {
      // Mock successful API calls
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<FlowComponent flowConfig={demoFlow} />);
      
      // Complete the entire flow
      // 1. Welcome step
      expect(screen.getByText('Welcome to XFlows!')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Get Started'));
      
      // 2. User info step
      await waitFor(() => {
        expect(screen.getByText('User Information')).toBeInTheDocument();
      });
      
      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@example.com' } });
      fireEvent.click(screen.getByText('Continue'));
      
      // 3. Preferences step
      await waitFor(() => {
        expect(screen.getByText('Preferences')).toBeInTheDocument();
      });
      
      // Select preferences and submit
      fireEvent.change(screen.getByLabelText(/theme preference/i), { target: { value: 'dark' } });
      fireEvent.click(screen.getByText('Save Preferences'));
      
      // 4. API demo step
      await waitFor(() => {
        expect(screen.getByText('API Integration Demo')).toBeInTheDocument();
      });
      
      // Simulate API call
      fireEvent.click(screen.getByText('Simulate API Call'));
      
      // Wait for delay hook to complete
      await waitFor(() => {
        expect(screen.getByText('Demo Complete!')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // 5. Complete step
      expect(screen.getByText('Setup Complete')).toBeInTheDocument();
      expect(screen.getByText('You\'ve successfully completed the XFlows demo!')).toBeInTheDocument();
    });

    it('should handle flow with HTTP plugin integration', async () => {
      // Create a flow config that uses HTTP plugins
      const flowWithHttpPlugin = {
        ...demoFlow,
        plugins: {
          httpClient: {
            type: 'actor',
            config: {
              baseUrl: 'https://api.example.com',
              timeout: 5000
            }
          }
        },
        steps: [
          ...demoFlow.steps,
          {
            id: 'api-test',
            name: 'API Test',
            view: {
              type: 'display',
              title: 'Testing HTTP Plugin',
              message: 'This step tests HTTP plugin integration',
              actions: [
                { type: 'button', label: 'Test API', event: 'TEST_API' }
              ]
            },
            invoke: {
              src: 'httpClient',
              input: {
                endpoint: '/api/test',
                method: 'GET'
              },
              onDone: 'complete',
              onError: 'error'
            },
            navigation: {
              onNext: 'complete'
            }
          }
        ]
      };

      // Mock API response
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'API test successful' }),
      });

      render(<FlowComponent flowConfig={flowWithHttpPlugin} />);
      
      // Navigate to API test step
      fireEvent.click(screen.getByText('Get Started'));
      
      // Complete user info
      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@example.com' } });
      fireEvent.click(screen.getByText('Continue'));
      
      // Complete preferences
      fireEvent.change(screen.getByLabelText(/theme preference/i), { target: { value: 'dark' } });
      fireEvent.click(screen.getByText('Save Preferences'));
      
      // Complete API demo
      fireEvent.click(screen.getByText('Simulate API Call'));
      
      await waitFor(() => {
        expect(screen.getByText('Testing HTTP Plugin')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Test API call
      fireEvent.click(screen.getByText('Test API'));
      
      // Should complete successfully
      await waitFor(() => {
        expect(screen.getByText('Demo Complete!')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle plugin execution errors', async () => {
      // Mock API failure
      (global.fetch as any).mockRejectedValueOnce(new Error('API Error'));

      const httpPlugin = new HttpActionPlugin();
      
      try {
        await httpPlugin.execute({
          endpoint: '/api/failing-endpoint',
          method: 'GET'
        }, {});
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('API Error');
      }
    });

    it('should handle invalid flow configuration', () => {
      const invalidFlow = {
        id: 'invalid',
        // Missing required fields
      };

      const orchestrator = new FlowOrchestrator();
      
      expect(() => {
        orchestrator.orchestrate(invalidFlow);
      }).toThrow();
    });
  });
});
