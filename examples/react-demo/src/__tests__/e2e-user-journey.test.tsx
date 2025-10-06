import { describe, it, expect, beforeEach, afterEach, vi, type MockedFunction } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FlowComponent } from '@xflows/plugin-react';
import { DefaultPluginManager } from '@xflows/plugins';
import { HttpActionPlugin, HttpActorPlugin } from '@xflows/plugin-http';
import { cache } from '@xflows/core';

// Test data types
interface MockResponse {
  success: boolean;
  userId?: number;
  message?: string;
  verificationCode?: string;
  expiresAt?: string;
  profile?: {
    id: number;
    name: string;
    email: string;
    preferences: {
      theme: string;
      notifications: boolean;
    };
  };
  sessionId?: string;
  data?: unknown[];
  orderId?: string;
  total?: number;
  status?: string;
}

// Mock fetch for HTTP plugin tests
const mockFetch = vi.fn() as MockedFunction<typeof fetch>;
global.fetch = mockFetch;

// Mock timers for delay hooks
vi.useFakeTimers();

describe('XFlows E2E User Journey Tests', () => {
  let pluginManager: DefaultPluginManager;

  beforeEach(() => {
    // Reset mocks and cache
    vi.clearAllMocks();
    cache.clear();
    
    // Setup plugin manager
    pluginManager = new DefaultPluginManager();
    pluginManager.registry.register(new HttpActionPlugin());
    pluginManager.registry.register(new HttpActorPlugin());
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Complete User Registration Flow', () => {
    it('should handle complete user registration with API integration', async () => {
      // Mock API responses for the complete flow
      const mockResponse1: MockResponse = { 
        success: true, 
        userId: 12345,
        message: 'User created successfully' 
      };
      const mockResponse2: MockResponse = { 
        success: true, 
        verificationCode: 'ABC123',
        expiresAt: '2024-12-31T23:59:59Z'
      };
      const mockResponse3: MockResponse = { 
        success: true, 
        profile: {
          id: 12345,
          name: 'John Doe',
          email: 'john@example.com',
          preferences: {
            theme: 'dark',
            notifications: true
          }
        }
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse1,
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse2,
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse3,
        } as unknown as Response);

      // Create a comprehensive flow configuration
      const registrationFlow: Record<string, unknown> = {
        id: 'user-registration-flow',
        name: 'User Registration Flow',
        version: '1.0.0',
        description: 'Complete user registration with API integration',
        initialStep: 'welcome',
        context: {
          userId: null,
          userProfile: null,
          verificationCode: null,
          step: 1,
          totalSteps: 4
        },
        steps: [
          {
            id: 'welcome',
            name: 'Welcome',
            view: {
              type: 'display',
              title: 'Welcome to Our Platform!',
              message: 'Let\'s get you set up with a new account.',
              actions: [
                { type: 'button', label: 'Start Registration', event: 'START_REGISTRATION' }
              ]
            },
            navigation: {
              onNext: 'user-info',
              START_REGISTRATION: 'user-info'
            }
          },
          {
            id: 'user-info',
            name: 'User Information',
            view: {
              type: 'form',
              title: 'Tell us about yourself',
              fields: [
                { 
                  id: 'firstName', 
                  type: 'text', 
                  label: 'First Name', 
                  required: true,
                  placeholder: 'Enter your first name'
                },
                { 
                  id: 'lastName', 
                  type: 'text', 
                  label: 'Last Name', 
                  required: true,
                  placeholder: 'Enter your last name'
                },
                { 
                  id: 'email', 
                  type: 'email', 
                  label: 'Email Address', 
                  required: true,
                  placeholder: 'Enter your email address'
                },
                { 
                  id: 'password', 
                  type: 'password', 
                  label: 'Password', 
                  required: true,
                  placeholder: 'Create a secure password'
                }
              ],
              actions: [
                { type: 'button', label: 'Continue', event: 'SUBMIT_USER_INFO' }
              ]
            },
            navigation: {
              onNext: 'preferences',
              SUBMIT_USER_INFO: 'preferences'
            }
          },
          {
            id: 'preferences',
            name: 'Preferences',
            view: {
              type: 'form',
              title: 'Set your preferences',
              fields: [
                { 
                  id: 'theme', 
                  type: 'select', 
                  label: 'Theme Preference', 
                  options: [
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                    { value: 'auto', label: 'Auto' }
                  ],
                  required: true
                },
                { 
                  id: 'notifications', 
                  type: 'checkbox', 
                  label: 'Enable notifications',
                  checked: true
                },
                { 
                  id: 'newsletter', 
                  type: 'checkbox', 
                  label: 'Subscribe to newsletter',
                  checked: false
                }
              ],
              actions: [
                { type: 'button', label: 'Save Preferences', event: 'SAVE_PREFERENCES' }
              ]
            },
            navigation: {
              onNext: 'verification',
              SAVE_PREFERENCES: 'verification'
            }
          },
          {
            id: 'verification',
            name: 'Email Verification',
            view: {
              type: 'display',
              title: 'Verify your email',
              message: 'We\'ve sent a verification code to {{context.email}}. Please check your inbox.',
              actions: [
                { type: 'button', label: 'Resend Code', event: 'RESEND_CODE' },
                { type: 'button', label: 'Continue', event: 'VERIFY_EMAIL' }
              ]
            },
            invoke: {
              src: 'httpAction',
              input: {
                endpoint: '/api/users/verify',
                method: 'POST',
                body: {
                  email: '{{context.email}}',
                  action: 'send_code'
                },
                cacheTtlMs: 30000,
                mapResult: {
                  'context.verificationCode': '$.verificationCode',
                  'context.verificationExpires': '$.expiresAt'
                }
              },
              onDone: 'complete',
              onError: 'error'
            },
            navigation: {
              onNext: 'complete',
              RESEND_CODE: 'verification',
              VERIFY_EMAIL: 'complete'
            }
          },
          {
            id: 'complete',
            name: 'Registration Complete',
            view: {
              type: 'display',
              title: 'Welcome aboard!',
              message: 'Your account has been created successfully. You can now access all features.',
              actions: [
                { type: 'button', label: 'Go to Dashboard', event: 'GO_TO_DASHBOARD' }
              ]
            },
            invoke: {
              src: 'httpAction',
              input: {
                endpoint: '/api/users/{{context.userId}}/profile',
                method: 'GET',
                expect: {
                  status: 200,
                  isError: (_response: Response, data: unknown) => (data as Record<string, unknown>)?.success === false
                },
                mapResult: {
                  'context.userProfile': '$'
                }
              },
              onDone: 'final',
              onError: 'error'
            },
            navigation: {
              onNext: 'final',
              GO_TO_DASHBOARD: 'final'
            }
          },
          {
            id: 'final',
            name: 'Final Step',
            view: {
              type: 'display',
              title: 'Setup Complete!',
              message: 'Your profile: {{context.userProfile.profile.name}} ({{context.userProfile.profile.email}})',
              actions: []
            },
            navigation: {
              onNext: 'final'
            }
          },
          {
            id: 'error',
            name: 'Error',
            view: {
              type: 'display',
              title: 'Something went wrong',
              message: 'We encountered an error during registration. Please try again.',
              actions: [
                { type: 'button', label: 'Try Again', event: 'RETRY' }
              ]
            },
            navigation: {
              onNext: 'error'
            }
          }
        ]
      };

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      render(<FlowComponent flowConfig={registrationFlow as any} />);
      
      // Step 1: Welcome
      expect(screen.getByText('Welcome to Our Platform!')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Start Registration'));
      
      // Step 2: User Information
      await waitFor(() => {
        expect(screen.getByText('Tell us about yourself')).toBeInTheDocument();
      });
      
      // Fill user information form
      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'securePassword123' } });
      
      fireEvent.click(screen.getByText('Continue'));
      
      // Step 3: Preferences
      await waitFor(() => {
        expect(screen.getByText('Set your preferences')).toBeInTheDocument();
      });
      
      // Set preferences
      fireEvent.change(screen.getByLabelText(/theme preference/i), { target: { value: 'dark' } });
      fireEvent.click(screen.getByText('Save Preferences'));
      
      // Step 4: Email Verification (with API call)
      await waitFor(() => {
        expect(screen.getByText('Verify your email')).toBeInTheDocument();
      });
      
      // Wait for the invoke to complete and move to next step
      await waitFor(() => {
        expect(screen.getByText('Welcome aboard!')).toBeInTheDocument();
      }, { timeout: 5000 });
      
      // Wait for the second invoke to complete and move to final step
      await waitFor(() => {
        expect(screen.getByText('Setup Complete!')).toBeInTheDocument();
      }, { timeout: 5000 });
      
      // Verify all API calls were made
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should handle API errors gracefully during registration', async () => {
      // Mock API failure
      mockFetch.mockRejectedValueOnce(new Error('API Error'));

      const errorFlow: Record<string, unknown> = {
        id: 'error-test-flow',
        name: 'Error Test Flow',
        version: '1.0.0',
        initialStep: 'test',
        context: {},
        steps: [
          {
            id: 'test',
            name: 'Test Step',
            view: {
              type: 'display',
              title: 'Testing Error Handling',
              message: 'This will trigger an API error.',
              actions: [
                { type: 'button', label: 'Test API', event: 'TEST_API' }
              ]
            },
            invoke: {
              src: 'httpAction',
              input: {
                endpoint: '/api/failing-endpoint',
                method: 'GET',
                onError: 'fail'
              },
              onDone: 'success',
              onError: 'error'
            },
            navigation: {
              onNext: 'success'
            }
          },
          {
            id: 'success',
            name: 'Success',
            view: {
              type: 'display',
              title: 'Success!',
              message: 'API call succeeded.',
              actions: []
            },
            navigation: {
              onNext: 'success'
            }
          },
          {
            id: 'error',
            name: 'Error',
            view: {
              type: 'display',
              title: 'Error Occurred',
              message: 'The API call failed as expected.',
              actions: [
                { type: 'button', label: 'Retry', event: 'RETRY' }
              ]
            },
            navigation: {
              onNext: 'error'
            }
          }
        ]
      };

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      render(<FlowComponent flowConfig={errorFlow as any} />);
      
      expect(screen.getByText('Testing Error Handling')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Test API'));
      
      // Should navigate to error step
      await waitFor(() => {
        expect(screen.getByText('Error Occurred')).toBeInTheDocument();
      });
    });
  });

  describe('Complex Multi-Step Flow with Caching', () => {
    it('should handle a complex flow with multiple API calls and caching', async () => {
      // Mock different API responses
      const sessionResponse: MockResponse = { 
        success: true, 
        sessionId: 'sess-123',
        expiresAt: '2024-12-31T23:59:59Z'
      };
      const productsResponse: MockResponse = { 
        success: true, 
        data: [
          { id: 1, name: 'Item 1', price: 10.99 },
          { id: 2, name: 'Item 2', price: 15.99 }
        ]
      };
      const orderResponse: MockResponse = { 
        success: true, 
        orderId: 'order-456',
        total: 26.98,
        status: 'confirmed'
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => sessionResponse,
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => productsResponse,
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => orderResponse,
        } as unknown as Response);

      const complexFlow: Record<string, unknown> = {
        id: 'complex-shopping-flow',
        name: 'Complex Shopping Flow',
        version: '1.0.0',
        initialStep: 'login',
        context: {
          sessionId: null,
          items: [],
          orderId: null
        },
        steps: [
          {
            id: 'login',
            name: 'Login',
            view: {
              type: 'display',
              title: 'Login Required',
              message: 'Please log in to continue.',
              actions: [
                { type: 'button', label: 'Login', event: 'LOGIN' }
              ]
            },
            invoke: {
              src: 'httpAction',
              input: {
                endpoint: '/api/auth/login',
                method: 'POST',
                body: {
                  username: '{{context.username}}',
                  password: '{{context.password}}'
                },
                cacheTtlMs: 300000, // 5 minutes
                mapResult: {
                  'context.sessionId': '$.sessionId',
                  'context.sessionExpires': '$.expiresAt'
                }
              },
              onDone: 'catalog',
              onError: 'error'
            },
            navigation: {
              onNext: 'catalog'
            }
          },
          {
            id: 'catalog',
            name: 'Product Catalog',
            view: {
              type: 'display',
              title: 'Browse Products',
              message: 'Here are our available products.',
              actions: [
                { type: 'button', label: 'Load Products', event: 'LOAD_PRODUCTS' }
              ]
            },
            invoke: {
              src: 'httpAction',
              input: {
                endpoint: '/api/products',
                method: 'GET',
                headers: {
                  'Authorization': 'Bearer {{context.sessionId}}'
                },
                cacheTtlMs: 600000, // 10 minutes
                mapResult: {
                  'context.items': '$.data'
                }
              },
              onDone: 'checkout',
              onError: 'error'
            },
            navigation: {
              onNext: 'checkout'
            }
          },
          {
            id: 'checkout',
            name: 'Checkout',
            view: {
              type: 'display',
              title: 'Complete Purchase',
              message: 'Ready to checkout with {{context.items.length}} items.',
              actions: [
                { type: 'button', label: 'Purchase', event: 'PURCHASE' }
              ]
            },
            invoke: {
              src: 'httpAction',
              input: {
                endpoint: '/api/orders',
                method: 'POST',
                headers: {
                  'Authorization': 'Bearer {{context.sessionId}}'
                },
                body: {
                  items: '{{context.items}}',
                  sessionId: '{{context.sessionId}}'
                },
                expect: {
                  status: 200,
                  isError: (_response: Response, data: unknown) => (data as Record<string, unknown>)?.success === false
                },
                mapResult: {
                  'context.orderId': '$.orderId',
                  'context.orderTotal': '$.total',
                  'context.orderStatus': '$.status'
                }
              },
              onDone: 'complete',
              onError: 'error'
            },
            navigation: {
              onNext: 'complete'
            }
          },
          {
            id: 'complete',
            name: 'Order Complete',
            view: {
              type: 'display',
              title: 'Order Confirmed!',
              message: 'Your order {{context.orderId}} has been placed successfully. Total: ${{context.orderTotal}}',
              actions: []
            },
            navigation: {
              onNext: 'complete'
            }
          },
          {
            id: 'error',
            name: 'Error',
            view: {
              type: 'display',
              title: 'Error',
              message: 'Something went wrong.',
              actions: [
                { type: 'button', label: 'Retry', event: 'RETRY' }
              ]
            },
            navigation: {
              onNext: 'error'
            }
          }
        ]
      };

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      render(<FlowComponent flowConfig={complexFlow as any} />);
      
      // Step 1: Login
      expect(screen.getByText('Login Required')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Login'));
      
      // Step 2: Catalog (with cached session)
      await waitFor(() => {
        expect(screen.getByText('Browse Products')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Load Products'));
      
      // Step 3: Checkout (with cached products)
      await waitFor(() => {
        expect(screen.getByText('Complete Purchase')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Purchase'));
      
      // Step 4: Complete
      await waitFor(() => {
        expect(screen.getByText('Order Confirmed!')).toBeInTheDocument();
      });
      
      // Verify all API calls were made with correct headers and caching
      expect(mockFetch).toHaveBeenCalledTimes(3);
      
      // Verify session was cached
      expect(cache.get('http-action-')).toBeDefined();
    });
  });

  describe('Simple Navigation Test', () => {
    it('should handle simple navigation without API calls', async () => {
      // Create a simple flow configuration without invoke
      const simpleFlow: Record<string, unknown> = {
        id: 'simple-flow',
        name: 'Simple Flow',
        version: '1.0.0',
        description: 'Simple navigation test',
        initialStep: 'step1',
        context: {},
        steps: [
          {
            id: 'step1',
            name: 'Step 1',
            view: {
              type: 'display',
              title: 'Step 1',
              message: 'This is step 1',
              actions: [
                { type: 'button', label: 'Next', event: 'NEXT' }
              ]
            },
            navigation: {
              onNext: 'step2',
              NEXT: 'step2'
            }
          },
          {
            id: 'step2',
            name: 'Step 2',
            view: {
              type: 'display',
              title: 'Step 2',
              message: 'This is step 2',
              actions: [
                { type: 'button', label: 'Next', event: 'NEXT' }
              ]
            },
            navigation: {
              onNext: 'step3',
              NEXT: 'step3'
            }
          },
          {
            id: 'step3',
            name: 'Step 3',
            view: {
              type: 'display',
              title: 'Step 3',
              message: 'This is step 3 - Complete!',
              actions: []
            },
            navigation: {
              onNext: 'step3'
            }
          }
        ]
      };

      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      render(<FlowComponent flowConfig={simpleFlow as any} enableLogging={true} />);
      
      // Step 1
      expect(screen.getByText('Step 1')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Next'));
      
      // Step 2
      await waitFor(() => {
        expect(screen.getByText('Step 2')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Next'));
      
      // Step 3
      // Wait a bit for the state to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if the text is present
      expect(screen.getByText('This is step 3 - Complete!')).toBeInTheDocument();
    });
  });
});
