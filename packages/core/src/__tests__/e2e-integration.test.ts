import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FlowOrchestrator } from '../engine/flow-orchestrator';
// Note: Plugin imports will be mocked for now
// import { PluginManager } from '@xflows/plugins';
// import { HttpActionPlugin, HttpActorPlugin } from '@xflows/plugin-http';

// Mock fetch for HTTP requests
global.fetch = vi.fn();

describe('End-to-End Flow + Plugin Integration', () => {
  let orchestrator: FlowOrchestrator;
  let pluginManager: PluginManager;

  beforeEach(() => {
    vi.clearAllMocks();
    orchestrator = new FlowOrchestrator();
    pluginManager = new PluginManager();
    
    // Register plugins
    pluginManager.register(new HttpActionPlugin());
    pluginManager.register(new HttpActorPlugin());
  });

  describe('Complete User Registration Flow', () => {
    const registrationFlow = {
      id: 'user-registration',
      name: 'User Registration Flow',
      version: '1.0.0',
      description: 'Complete user registration with API integration',
      initialStep: 'welcome',
      context: {
        user: null,
        stepData: {},
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
        sendVerificationEmail: {
          type: 'http-action',
          config: {
            endpoint: '/api/send-verification',
            method: 'POST',
            body: '{{context.user.email}}'
          }
        }
      },
      steps: [
        {
          id: 'welcome',
          name: 'Welcome',
          view: {
            type: 'display',
            title: 'Welcome to Our Platform',
            subtitle: 'User Registration',
            message: 'Let\'s get you started with a new account',
            actions: [
              { type: 'button', label: 'Get Started', event: 'START_REGISTRATION' }
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
            subtitle: 'Tell us about yourself',
            fields: [
              {
                name: 'firstName',
                type: 'text',
                label: 'First Name',
                placeholder: 'Enter your first name',
                required: true,
                validation: {
                  minLength: 2,
                  maxLength: 50
                }
              },
              {
                name: 'lastName',
                type: 'text',
                label: 'Last Name',
                placeholder: 'Enter your last name',
                required: true,
                validation: {
                  minLength: 2,
                  maxLength: 50
                }
              },
              {
                name: 'email',
                type: 'email',
                label: 'Email Address',
                placeholder: 'Enter your email',
                required: true,
                validation: {
                  pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
                }
              },
              {
                name: 'phone',
                type: 'tel',
                label: 'Phone Number',
                placeholder: 'Enter your phone number',
                required: false
              }
            ],
            actions: [
              { type: 'submit', label: 'Continue', event: 'SUBMIT_PERSONAL_INFO' },
              { type: 'button', label: 'Back', event: 'GO_BACK' }
            ]
          },
          hooks: {
            after: [
              {
                id: 'save-personal-info',
                type: 'assign',
                target: 'user.personalInfo',
                value: '{{event.data}}'
              }
            ]
          },
          navigation: {
            onNext: 'verify-email',
            onBack: 'welcome'
          }
        },
        {
          id: 'verify-email',
          name: 'Email Verification',
          view: {
            type: 'display',
            title: 'Verify Your Email',
            subtitle: 'Email Verification Required',
            message: 'We\'ve sent a verification link to {{context.user.personalInfo.email}}. Please check your inbox and click the link to verify your email address.',
            actions: [
              { type: 'button', label: 'Resend Email', event: 'RESEND_VERIFICATION' },
              { type: 'button', label: 'I\'ve Verified', event: 'EMAIL_VERIFIED' },
              { type: 'button', label: 'Back', event: 'GO_BACK' }
            ]
          },
          invoke: {
            src: 'httpClient',
            input: {
              endpoint: '/api/send-verification',
              method: 'POST',
              body: '{{context.user.personalInfo.email}}'
            },
            onDone: 'verification-sent',
            onError: 'verification-error'
          },
          navigation: {
            onNext: 'verification-sent',
            onBack: 'personal-info'
          }
        },
        {
          id: 'verification-sent',
          name: 'Verification Sent',
          view: {
            type: 'success',
            title: 'Verification Email Sent',
            subtitle: 'Check Your Inbox',
            message: 'We\'ve sent a verification email to {{context.user.personalInfo.email}}. Please check your inbox and click the verification link.',
            template: 'If you don\'t see the email, check your spam folder.',
            actions: [
              { type: 'button', label: 'Resend Email', event: 'RESEND_VERIFICATION' },
              { type: 'button', label: 'Continue', event: 'EMAIL_VERIFIED' }
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
            subtitle: 'Something went wrong',
            message: 'We couldn\'t send the verification email. Please try again or contact support.',
            actions: [
              { type: 'button', label: 'Retry', event: 'RETRY_VERIFICATION' },
              { type: 'button', label: 'Back', event: 'GO_BACK' }
            ]
          },
          navigation: {
            onNext: 'verify-email',
            onBack: 'personal-info'
          }
        },
        {
          id: 'complete',
          name: 'Registration Complete',
          view: {
            type: 'success',
            title: 'Registration Complete!',
            subtitle: 'Welcome to Our Platform',
            message: 'Your account has been created successfully. You can now access all features of our platform.',
            template: 'Welcome, {{context.user.personalInfo.firstName}}!',
            actions: [
              { type: 'button', label: 'Continue to Dashboard', event: 'GO_TO_DASHBOARD' },
              { type: 'button', label: 'Start Over', event: 'RESTART_REGISTRATION' }
            ]
          },
          hooks: {
            after: [
              {
                id: 'save-complete-user',
                type: 'http-action',
                config: {
                  endpoint: '/api/users',
                  method: 'POST',
                  body: '{{context.user}}'
                }
              }
            ]
          },
          navigation: {
            onNext: 'welcome'
          }
        }
      ]
    };

    it('should create valid machine from complete registration flow', () => {
      expect(() => {
        const machine = orchestrator.orchestrate(registrationFlow);
        expect(machine).toBeDefined();
        expect(machine.config.states).toBeDefined();
        
        // Verify all states are present
        expect(machine.config.states?.welcome).toBeDefined();
        expect(machine.config.states?.personalInfo).toBeDefined();
        expect(machine.config.states?.verifyEmail).toBeDefined();
        expect(machine.config.states?.verificationSent).toBeDefined();
        expect(machine.config.states?.verificationError).toBeDefined();
        expect(machine.config.states?.complete).toBeDefined();
      }).not.toThrow();
    });

    it('should validate complete registration flow', () => {
      const validation = orchestrator.validateFlow(registrationFlow);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should handle HTTP plugin execution in flow context', async () => {
      // Mock successful API responses
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'Verification email sent' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, userId: 123 }),
        });

      const httpActorPlugin = new HttpActorPlugin();
      const httpActionPlugin = new HttpActionPlugin();

      // Test verification email sending (actor)
      const verificationResult = await httpActorPlugin.execute({
        endpoint: '/api/send-verification',
        method: 'POST',
        body: 'test@example.com'
      }, {});

      expect(verificationResult).toEqual({ message: 'Verification email sent' });

      // Test user data saving (action)
      const userData = {
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        }
      };

      const saveResult = await httpActionPlugin.execute({
        endpoint: '/api/users',
        method: 'POST',
        body: userData
      }, {});

      expect(saveResult).toEqual({ success: true, userId: 123 });

      // Verify API calls were made correctly
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenCalledWith('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '"test@example.com"',
      });
      expect(global.fetch).toHaveBeenCalledWith('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
    });

    it('should handle HTTP plugin errors gracefully', async () => {
      // Mock API failure
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const httpActorPlugin = new HttpActorPlugin();

      await expect(httpActorPlugin.execute({
        endpoint: '/api/send-verification',
        method: 'POST',
        body: 'test@example.com'
      }, {})).rejects.toThrow('Network error');
    });
  });

  describe('E-commerce Checkout Flow with Plugins', () => {
    const checkoutFlow = {
      id: 'ecommerce-checkout',
      name: 'E-commerce Checkout Flow',
      version: '1.0.0',
      description: 'Complete e-commerce checkout with payment processing',
      initialStep: 'cart-review',
      context: {
        cart: { items: [], total: 0 },
        user: null,
        shipping: {},
        payment: {},
        order: null,
        errors: []
      },
      plugins: {
        paymentProcessor: {
          type: 'actor',
          config: {
            baseUrl: 'https://api.payment.com',
            timeout: 15000,
            retries: 2
          }
        },
        inventoryService: {
          type: 'actor',
          config: {
            baseUrl: 'https://api.inventory.com',
            timeout: 5000,
            retries: 3
          }
        },
        emailService: {
          type: 'action',
          config: {
            baseUrl: 'https://api.email.com',
            timeout: 3000,
            retries: 2
          }
        }
      },
      steps: [
        {
          id: 'cart-review',
          name: 'Cart Review',
          view: {
            type: 'form',
            title: 'Review Your Cart',
            subtitle: 'Cart Items',
            fields: [
              {
                name: 'items',
                type: 'display',
                label: 'Cart Items',
                value: '{{context.cart.items}}'
              },
              {
                name: 'total',
                type: 'display',
                label: 'Total',
                value: '{{context.cart.total}}'
              }
            ],
            actions: [
              { type: 'button', label: 'Proceed to Checkout', event: 'PROCEED_CHECKOUT' },
              { type: 'button', label: 'Continue Shopping', event: 'CONTINUE_SHOPPING' }
            ]
          },
          navigation: {
            onNext: 'shipping-info',
            onBack: 'cart-review'
          }
        },
        {
          id: 'shipping-info',
          name: 'Shipping Information',
          view: {
            type: 'form',
            title: 'Shipping Information',
            subtitle: 'Where should we deliver your order?',
            fields: [
              {
                name: 'address',
                type: 'text',
                label: 'Address',
                required: true
              },
              {
                name: 'city',
                type: 'text',
                label: 'City',
                required: true
              },
              {
                name: 'zipCode',
                type: 'text',
                label: 'ZIP Code',
                required: true
              },
              {
                name: 'country',
                type: 'select',
                label: 'Country',
                required: true,
                options: [
                  { value: 'US', label: 'United States' },
                  { value: 'CA', label: 'Canada' },
                  { value: 'MX', label: 'Mexico' }
                ]
              }
            ],
            actions: [
              { type: 'submit', label: 'Continue to Payment', event: 'SUBMIT_SHIPPING' },
              { type: 'button', label: 'Back', event: 'GO_BACK' }
            ]
          },
          hooks: {
            after: [
              {
                id: 'save-shipping',
                type: 'assign',
                target: 'shipping',
                value: '{{event.data}}'
              }
            ]
          },
          navigation: {
            onNext: 'payment-info',
            onBack: 'cart-review'
          }
        },
        {
          id: 'payment-info',
          name: 'Payment Information',
          view: {
            type: 'form',
            title: 'Payment Information',
            subtitle: 'Secure payment processing',
            fields: [
              {
                name: 'cardNumber',
                type: 'text',
                label: 'Card Number',
                required: true,
                validation: {
                  pattern: '^[0-9]{16}$'
                }
              },
              {
                name: 'expiryDate',
                type: 'text',
                label: 'Expiry Date',
                required: true,
                validation: {
                  pattern: '^(0[1-9]|1[0-2])\\/([0-9]{2})$'
                }
              },
              {
                name: 'cvv',
                type: 'text',
                label: 'CVV',
                required: true,
                validation: {
                  pattern: '^[0-9]{3,4}$'
                }
              },
              {
                name: 'cardholderName',
                type: 'text',
                label: 'Cardholder Name',
                required: true
              }
            ],
            actions: [
              { type: 'submit', label: 'Process Payment', event: 'SUBMIT_PAYMENT' },
              { type: 'button', label: 'Back', event: 'GO_BACK' }
            ]
          },
          hooks: {
            after: [
              {
                id: 'save-payment',
                type: 'assign',
                target: 'payment',
                value: '{{event.data}}'
              }
            ]
          },
          navigation: {
            onNext: 'processing',
            onBack: 'shipping-info'
          }
        },
        {
          id: 'processing',
          name: 'Processing Payment',
          view: {
            type: 'loading',
            title: 'Processing Your Payment',
            subtitle: 'Please wait while we process your order',
            message: 'This may take a few moments...'
          },
          invoke: {
            src: 'paymentProcessor',
            input: {
              endpoint: '/api/process-payment',
              method: 'POST',
              body: '{{context.payment}}'
            },
            onDone: 'payment-success',
            onError: 'payment-error'
          },
          navigation: {
            onNext: 'payment-success',
            onBack: 'payment-info'
          }
        },
        {
          id: 'payment-success',
          name: 'Payment Successful',
          view: {
            type: 'success',
            title: 'Payment Successful!',
            subtitle: 'Order Confirmed',
            message: 'Your payment has been processed successfully. You will receive a confirmation email shortly.',
            actions: [
              { type: 'button', label: 'View Order Details', event: 'VIEW_ORDER' },
              { type: 'button', label: 'Continue Shopping', event: 'CONTINUE_SHOPPING' }
            ]
          },
          hooks: {
            after: [
              {
                id: 'send-confirmation-email',
                type: 'http-action',
                config: {
                  endpoint: '/api/send-confirmation',
                  method: 'POST',
                  body: '{{context.order}}'
                }
              }
            ]
          },
          navigation: {
            onNext: 'cart-review'
          }
        },
        {
          id: 'payment-error',
          name: 'Payment Error',
          view: {
            type: 'error',
            title: 'Payment Failed',
            subtitle: 'Something went wrong',
            message: 'We couldn\'t process your payment. Please check your payment information and try again.',
            actions: [
              { type: 'button', label: 'Try Again', event: 'RETRY_PAYMENT' },
              { type: 'button', label: 'Back to Payment', event: 'GO_BACK' }
            ]
          },
          navigation: {
            onNext: 'payment-info',
            onBack: 'payment-info'
          }
        }
      ]
    };

    it('should create valid machine from e-commerce checkout flow', () => {
      expect(() => {
        const machine = orchestrator.orchestrate(checkoutFlow);
        expect(machine).toBeDefined();
        expect(machine.config.states).toBeDefined();
        
        // Verify all states are present
        expect(machine.config.states?.cartReview).toBeDefined();
        expect(machine.config.states?.shippingInfo).toBeDefined();
        expect(machine.config.states?.paymentInfo).toBeDefined();
        expect(machine.config.states?.processing).toBeDefined();
        expect(machine.config.states?.paymentSuccess).toBeDefined();
        expect(machine.config.states?.paymentError).toBeDefined();
      }).not.toThrow();
    });

    it('should validate e-commerce checkout flow', () => {
      const validation = orchestrator.validateFlow(checkoutFlow);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle flow with missing plugin references', () => {
      const flowWithMissingPlugin = {
        id: 'missing-plugin-test',
        name: 'Missing Plugin Test',
        initialStep: 'start',
        context: {},
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
            invoke: {
              src: 'nonExistentPlugin', // Plugin not registered
              input: {},
              onDone: 'end',
              onError: 'error'
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
          },
          {
            id: 'error',
            name: 'Error',
            view: {
              type: 'error',
              title: 'Error',
              message: 'Something went wrong',
              actions: [
                { type: 'button', label: 'Retry', event: 'RETRY' }
              ]
            },
            navigation: {
              onNext: 'start'
            }
          }
        ]
      };

      // Should create machine (plugin resolution happens at runtime)
      expect(() => {
        const machine = orchestrator.orchestrate(flowWithMissingPlugin);
        expect(machine).toBeDefined();
      }).not.toThrow();
    });

    it('should handle flow with invalid step configuration', () => {
      const flowWithInvalidStep = {
        id: 'invalid-step-test',
        name: 'Invalid Step Test',
        initialStep: 'start',
        context: {},
        steps: [
          {
            id: 'start',
            name: 'Start',
            // Missing required view field
            navigation: {
              onNext: 'end'
            }
          }
        ]
      };

      expect(() => {
        orchestrator.orchestrate(flowWithInvalidStep);
      }).toThrow();
    });
  });
});
