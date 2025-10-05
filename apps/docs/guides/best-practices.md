# 🎯 Best Practices

Guidelines and recommendations for building robust, scalable applications with XState Orchestrator.

## 🏗️ Architecture Patterns

### Flow Design Principles

#### ✅ Keep Flows Focused

**Good**: Single-purpose flows with clear boundaries
```json
{
  "id": "user-registration",
  "initial": "form",
  "states": {
    "form": { /* registration form only */ },
    "verification": { /* email verification only */ },
    "completed": { /* registration success only */ }
  }
}
```

**Avoid**: Kitchen-sink flows that handle everything
```json
{
  "id": "everything-flow",
  "states": {
    "registration": { /* registration logic */ },
    "products": { /* product catalog */ },
    "checkout": { /* payment processing */ },
    "support": { /* customer support */ }
  }
}
```

#### ✅ Design for State, Not Screens

**Good**: States represent business conditions
```json
{
  "states": {
    "awaiting-user-input": { /* waiting for user */ },
    "validating-data": { /* processing validation */ },
    "data-valid": { /* valid state */ },
    "data-invalid": { /* invalid state */ }
  }
}
```

**Avoid**: Screens-as-states
```json
{
  "states": {
    "page1": { },
    "page2": { },
    "page3": { }
  }
}
```

#### ✅ Use Hierarchical States

**Good**: Logical state grouping
```json
{
  "id": "ecommerce-checkout",
  "states": {
    "authenticated": {
      "states": {
        "shopping-cart": { },
        "shipping": { },
        "payment": { }
      }
    },
    "anonymous": {
      "states": {
        "guest-checkout": { },
        "create-account": { }
      }
    }
  }
}
```

### Context Management

#### ✅ Structure Context Hierarchically

**Good**: Clear context organization
```typescript
interface FlowContext {
  user: {
    profile: UserProfile;
    preferences: UserPreferences;
    session: SessionData;
  };
  form: {
    data: FormData;
    validation: ValidationState;
  };
  ui: {
    loading: boolean;
    errors: ErrorState;
  };
}
```

#### ✅ Use Immutable Updates

**Good**: Proper context immutability
```json
{
  "type": "assign",
  "to": "user.profile",
  "fromEventPath": "payload"
}
```

**Generated code**:
```typescript
assign((ctx, event) => ({
  ...ctx,
  user: {
    ...ctx.user,
    profile: event.payload
  }
}))
```

#### ✅ Context Slicing for Performance

**Good**: Only pass relevant context to components
```typescript
// ❌ Don't pass entire context
const viewProps = {
  contextSlice: host.actor.getSnapshot().context
};

// ✅ Pass only relevant slice
const viewProps = {
  contextSlice: slice(
    host.actor.getSnapshot().context,
    activeView.contextPath || 'user.profile'
  )
};
```

### Service Integration

#### ✅ Register Services with Clear Types

**Good**: Type-safe service registration
```typescript
const services: ServicesRegistry = {
  'user-api': userApiRunner,
  'payment-gateway': paymentService,
  'email-service': emailService,
  'analytics-tracker': analyticsService
};
```

#### ✅ Handle Service Errors Gracefully

**Good**: Comprehensive error handling
```json
{
  "api-call": {
    "invoke": [{
      "type": "user-api",
      "config": {}
    }],
    "onDone": {
      "target": "success",
      "actions": [{
        "type": "assign",
        "to": "api.response",
        "fromEventPath": "data"
      }]
    },
    "onError": {
      "target": "retry",
      "actions": [{
        "type": "assign",
        "to": "errors.api",
        "fromEventPath": "error"
      }]
    }
  }
}
```

## 🎨 UI/UX Best Practices

### Component Design

#### ✅ Keep Components Stateless

**Good**: Flow-driven component
```tsx
const UserForm: React.FC<ViewProps> = ({ contextSlice, send }) => {
  const [localFormData, setLocalFormData] = useState({});
  
  return (
    <form onSubmit={() => 
      send({ type: 'SUBMIT_FORM', payload: localFormData })
    }>
      {/* Form fields */}
    </form>
  );
};
```

**Avoid**: Component-managed flow state
```tsx
const Component = () => {
  const [step, setStep] = useState('form');
  const [data, setData] = useState({});
  
  // ❌ Managing flow logic in component
  if (step === 'success') return <SuccessPage />;
  if (step === 'error') return <ErrorPage />;
  // ...
};
```

#### ✅ Design Accessible Components

**Good**: Proper accessibility
```tsx
const AccessibleForm = ({ contextSlice, send }) => (
  <form
    role="form"
    aria-labelledby="form-title"
    onSubmit={handleSubmit}
  >
    <h2 id="form-title">User Registration</h2>
    
    <label htmlFor="email">
      Email Address <span aria-label="required">*</span>
    </label>
    <input
      id="email"
      type="email"
      aria-required="true"
      aria-describedby="email-error"
      aria-invalid={errors.email ? 'true' : 'false'}
    />
    
    {errors.email && (
      <div id="email-error" role="alert">
        {errors.email}
      </div>
    )}
    
    <button type="submit">
      Submit Registration
    </button>
  </form>
);
```

### Performance Optimization

#### ✅ Implement Lazy Loading

**Good**: Load components on-demand
```typescript
const LazyRegistry = {
  resolve(moduleId: string) {
    switch(moduleId) {
      case 'heavy-dashboard':
        return async (slot: string | undefined, props: ViewProps) => {
          const { DashboardComponent } = await import('./Dashboard');
          return renderComponent(DashboardComponent, slot, props);
        };
      default:
        return standardComponents[moduleId];
    }
  }
};
```

#### ✅ Memoize Expensive Computations

**Good**: Memoized view props
```typescript
function useMemoizedProps(context: any, viewConfig: any) {
  return useMemo(() => ({
    flowId: viewConfig.config.flowId,
    nodeId: 'current',
    contextSlice: extractRelevantSlice(context, viewConfig.config.contextPath),
    send: viewConfig.actions.send
  }), [context, viewConfig]);
}
```

## 🧪 Testing Strategies

### Flow Testing

#### ✅ Test Business Logic Separately

**Good**: Pure flow testing
```typescript
describe('Sales Flow', () => {
  it('should advance to payment after valid cart', () => {
    const host = createHeadlessHost(salesFlow, mockDeps);
    
    // Fill cart
    host.send({ type: 'ADD_TO_CART', payload: mockProduct });
    
    // Proceed with valid data
    host.send({ type: 'CHECKOUT', payload: mockPaymentData });
    
    expect(host.actor.getSnapshot().value).toBe('payment-processing');
    expect(host.actor.getSnapshot().context.cart.items).toHaveLength(1);
  });
});
```

#### ✅ Mock External Services

**Good**: Service mocking for predictable tests
```typescript
const mockServices = {
  'payment-api': jest.fn().mockResolvedValue({
    transactionId: 'txn_123',
    status: 'success'
  }),
  'email-service': jest.fn().mockResolvedValue({ messageId: 'msg_456' })
};

const host = createHeadlessHost(financialFlow, {
  services: mockServices,
  apis: mockApis
});
```

### Component Testing

#### ✅ Test User Interactions

**Good**: Component behavior testing
```typescript
describe('RegistrationForm', () => {
  it('should submit form data to flow', async () => {
    const mockSubmit = jest.fn();
    
    render(
      <RegistrationForm 
        contextSlice={{ user: {} }}
        send={mockSubmit}
      />
    );
    
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    expect(mockSubmit).toHaveBeenCalledWith({
      type: 'SUBMIT_FORM',
      payload: expect.objectContaining({
        email: 'test@example.com'
      })
    });
  });
});
```

### Integration Testing

#### ✅ Test Complete User Journeys

**Good**: End-to-end flow testing
```typescript
describe('Complete Registration Flow', () => {
  it('should register user and send confirmation', async () => {
    const host = createHeadlessHost(registrationFlow, {
      services: {
        'user-service': userCreateService,
        'email-service': emailNotificationService
      },
      apis: mockApis
    });
    
    // Simulate complete registration
    await simulateRegistrationFlow(host, mockUserData);
    
    // Verify final state
    expect(host.actor.getSnapshot().value).toBe('completed');
    expect(emailNotificationService).toHaveBeenCalledWith(
      expect.objectContaining({
        to: mockUserData.email,
        template: 'welcome'
      })
    );
  });
});
```

## 🔒 Security Considerations

### Input Validation

#### ✅ Validate All User Input

**Good**: Comprehensive validation
```typescript
const RegistrationValidation = zod.object({
  email: zod.string().email(),
  firstName: zod.string().min(2).max(50),
  phoneNumber: zod.string().regex(/^\+?[\d\s\-\(\)]+$/),
  dateOfBirth: zod.string().max(new Date().toISOString().split('T')[0])
});

// In component
const validateFormData = (data: any) => {
  const result = RegistrationValidation.safeParse(data);
  if (!result.success) {
    send({ 
      type: 'VALIDATION_ERROR', 
      payload: result.error.format() 
    });
    return false;
  }
  return true;
};
```

#### ✅ Sanitize Context Updates

**Good**: Sanitized assignment actions
```typescript
const sanitizeUserInput = (data: any) => {
  const sanitized = { ...data };
  
  // Remove potentially dangerous fields
  delete sanitized.dangerous;
  
  // Escape HTML in string fields
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = escapeHtml(sanitized[key]);
    }
  });
  
  return sanitized;
};
```

### Service Security

#### ✅ Secure Service Configurations

**Good**: Safe service configuration
```json
{
  "invoke": [{
    "type": "user-api",
    "config": {
      "endpoint": "/api/users",
      "method": "POST",
      "headers": {
        "Authorization": "{{secrets.apiToken}}",
        "Content-Type": "application/json"
      },
      "body": {
        "user": "{{context.user.profile}}",
        "timestamp": "{{context.meta.timestamp}}"
      }
    }
  }]
}
```

## 📊 Performance Best Practices

### Memory Management

#### ✅ Clean Up Subscriptions

**Good**: Proper cleanup
```typescript
function FlowComponent({ flowHost }: { flowHost: HostInstance }) {
  const [, forceUpdate] = useState(0);
  
  useEffect(() => {
    // ✅ Properly subscribe and clean up
    const subscription = flowHost.actor.subscribe(() => {
      forceUpdate(prev => prev + 1);
    });
    
    return () => subscription.unsubscribe();
  }, [flowHost]);
  
  // Component implementation...
}
```

#### ✅ Optimize Context Updates

**Good**: Efficient context slicing
```typescript
const contextSlice = useMemo(() => {
  const fullContext = host.actor.getSnapshot().context;
  
  // Only return relevant slice based on current view
  switch (currentView.moduleId) {
    case 'user-profile':
      return {
        user: fullContext.user?.profile,
        ui: fullContext.ui
      };
    case 'order-summary':
      return {
        order: fullContext.order,
        payment: fullContext.payment
      };
    default:
      return fullContext;
  }
}, [host, currentView]);
```

### Bundle Optimization

#### ✅ Code Splitting by Flow

**Good**: Flow-based code splitting
```typescript
// Load flows dynamically
const loadFlow = async (flowId: string) => {
  switch (flowId) {
    case 'registration':
      return (await import('@flows/registration')).default;
    case 'checkout':
      return (await import('@flows/checkout')).default;
    case 'profile':
      return (await import('@flows/profile')).default;
    default:
      throw new Error(`Unknown flow: ${flowId}`);
  }
};
```

## 🔄 Migration Strategies

### From Existing State Management

#### ✅ Incremental Migration

**Good**: Gradual state management migration
```typescript
// Phase 1: Keep Redux, add flows for new features
const AppProvider = ({ children }) => {
  const flowHost = useFlowHost(financialFlow);
  const reduxStore = useStore();
  
  // Bridge Redux state to flow context
  useEffect(() => {
    const reduxState = reduxStore.getState();
    flowHost.send({ 
      type: 'REDUX_STATE_SYNC', 
      payload: reduxState 
    });
  }, [reduxStore, flowHost]);
  
  return children;
};
```

#### ✅ Form Library Migration

**Good**: Gradual form library replacement
```typescript
// Existing Formik integration
const FormikIntegration = ({ flowHost, formikProps }) => {
  const { values, setValues, submitForm } = formikProps;
  
  useEffect(() => {
    // Sync Formik values to flow context
    flowHost.send({
      type: 'FORM_DATA_SYNC',
      payload: values
    });
  }, [values]);
  
  // On flow completion, sync back to Formik
  useEffect(() => {
    const subscription = flowHost.actor.subscribe((snapshot) => {
      if (snapshot.matches('completed')) {
        setValues(snapshot.context.form.values);
        submitForm();
      }
    });
    
    return () => subscription.unsubscribe();
  }, [flowHost, setValues, submitForm]);
  
  return null;
};
```

## 🎯 Industry-Specific Patterns

### Financial Services

```json
{
  "states": {
    "compliance-check": {
      "invoke": [{
        "type": "compliance-validator",
        "config": {
          "jurisdiction": "{{context.user.country}}",
          "transactionType": "{{context.transaction.type}}",
          "amount": "{{context.transaction.amount}}"
        }
      }],
      "onDone": "proceed-with-transaction",
      "onError": "compliance-failed"
    }
  }
}
```

### Healthcare

```json
{
  "states": {
    "patient-assessment": {
      "invoke": [{
        "type": "hipaa-audit",
        "config": {
          "patientId": "{{context.patient.id}}",
          "accessReason": "assessment",
          "providerId": "{{context.user.providerId}}"
        }
      }],
      "onDone": "proceed-assessment",
      "onError": "access-denied"
    }
  }
}
```

### E-commerce

```json
{
  "states": {
    "fraud-detection": {
      "invoke": [{
        "type": "fraud-scoring",
        "config": {
          "customerProfile": "{{context.customer}}",
          "orderDetails": "{{context.order}}",
          "paymentMethod": "{{context.payment}}"
        }
      }],
      "select": {
        "targets": [
          { "target": "automatic-approval", "cond": "score-low-risk" },
          { "target": "manual-review", "cond": "score-medium-risk" },
          { "target": "reject-order", "cond": "score-high-risk" }
        ]
      }
    }
  }
}
```

## 🚫 Common Anti-Patterns

### ❌ Over-Complex Flows

**Avoid**: Flows with too many nested states
```json
// ❌ Too complex - 5 levels deep
{
  "checkout": {
    "states": {
      "billing": {
        "states": {
          "personal": {
            "states": {
              "name": {
                "states": {
                  "first": {},
                  "last": {}
                }
              }
            }
          }
        }
      }
    }
  }
}
```

### ❌ Tight Coupling

**Avoid**: Business logic in UI components
```tsx
// ❌ Component handles flow logic
const Component = () => {
  if (user.riskLevel > 0.7) {
    return <HighRiskComponent />;
  }
  if (order.total > 10000) {
    return <FraudCheckComponent />;
  }
  // More business logic...
};
```

### ❌ Performance Anti-patterns

**Avoid**: Unnecessary re-renders
```tsx
// ❌ Full context passed to every component
<ExpensiveComponent contextSlice={host.actor.getSnapshot().context} />

// ❌ Subscription in render method
const Component = ({ host }) => {
  const [, forceUpdate] = useState(0);
  
  host.actor.subscribe(() => forceUpdate(prev => prev + 1)); // ❌ Called every render
  
  return <div />;
};
```

---

**Follow these practices to build robust, maintainable XState Orchestrator applications!** 🎉
