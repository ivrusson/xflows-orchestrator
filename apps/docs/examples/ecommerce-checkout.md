# 🛒 E-commerce Checkout Example

A comprehensive e-commerce checkout flow demonstrating complex multi-step processes.

## Overview

This example showcases a complete e-commerce checkout with:
- Product browsing and cart management
- User authentication and guest checkout
- Delivery information and shipping options
- Payment processing and order confirmation
- Error handling and support integration

## Flow Definition

```json
{
  "id": "ecommerce-checkout",
  "initial": "browse",
  "context": {
    "user": {
      "id": null,
      "email": null,
      "isLoggedIn": false
    },
    "cart": {
      "items": [],
      "total": 0,
      "currency": "EUR"
    },
    "payment": {
      "method": null,
      "details": {}
    },
    "shipping": {
      "address": {},
      "option": null,
      "cost": 0
    },
    "session": {
      "startTime": null,
      "lastActivity": null,
      "channel": "web"
    }
  },
  "states": {
    "browse": {
      "view": {
        "moduleId": "ProductCatalog",
        "slot": "main"
      },
      "on": {
        "ADD_TO_CART": {
          "target": "cart_updated",
          "actions": [{"type": "assign", "to": "cart.items", "fromEventPath": "item"}]
        },
        "VIEW_CART": "cart_review",
        "LOGIN_REQUEST": "user_login"
      }
    },
    "cart_updated": {
      "view": {
        "moduleId": "CartUpdate",
        "slot": "notification"
      },
      "on": {
        "CONTINUE_SHOPPING": "browse",
        "PROCEED_CHECKOUT": "cart_review"
      }
    },
    "cart_review": {
      "view": {
        "moduleId": "CartReview",
        "slot": "main"
      },
      "on": {
        "UPDATE_ITEM": "cart_review",
        "REMOVE_ITEM": "cart_review",
        "PROCEED_CHECKOUT": "login_check",
        "BACK_TO_BROWSE": "browse"
      }
    },
    "login_check": {
      "invoke": {
        "type": "user.service",
        "config": {"checkAuth": true}
      },
      "on": {
        "USER_AUTHENTICATED": "delivery_info",
        "USER_NOT_AUTHENTICATED": "user_login",
        "ERROR": "cart_review"
      }
    },
    "user_login": {
      "view": {
        "moduleId": "UserLogin",
        "slot": "modal"
      },
      "on": {
        "LOGIN_SUCCESS": "delivery_info",
        "LOGIN_SKIP": "guest_checkout",
        "LOGIN_ERROR": "user_login",
        "CANCEL_LOGIN": "cart_review"
      }
    },
    "guest_checkout": {
      "view": {
        "moduleId": "GuestCheckout",
        "slot": "main"
      },
      "on": {
        "PROVIDE_EMAIL": "delivery_info",
        "CANCEL": "cart_review"
      }
    },
    "delivery_info": {
      "view": {
        "moduleId": "DeliveryForm",
        "slot": "main"
      },
      "on": {
        "SAVE_DELIVERY": {
          "target": "shipping_options",
          "actions": [{"type": "assign", "to": "shipping.address", "fromEventPath": "address"}]
        },
        "USE_SAVED_ADDRESS": "shipping_options",
        "EDIT_CART": "cart_review"
      }
    },
    "shipping_options": {
      "invoke": {
        "type": "shipping.service",
        "config": {"calculateRates": true}
      },
      "view": {
        "moduleId": "ShippingOptions",
        "slot": "main"
      },
      "on": {
        "SELECT_SHIPPING": {
          "target": "payment_method",
          "actions": [
            {"type": "assign", "to": "shipping.option", "fromEventPath": "option"},
            {"type": "assign", "to": "shipping.cost", "fromEventPath": "cost"}
          ]
        },
        "EDIT_DELIVERY": "delivery_info",
        "ABANDON_CART": "session_timeout"
      }
    },
    "payment_method": {
      "view": {
        "moduleId": "PaymentMethods",
        "slot": "main"
      },
      "on": {
        "SELECT_PAYMENT": {
          "target": "payment_details",
          "actions": [{"type": "assign", "to": "payment.method", "fromEventPath": "method"}]
        },
        "EDIT_SHIPPING": "shipping_options",
        "SAVE_CARDT_PAYMENT": "secure_payment"
      }
    },
    "payment_details": {
      "view": {
        "moduleId": "PaymentForm",
        "slot": "main"
      },
      "on": {
        "SUBMIT_PAYMENT": {
          "target": "shipping_details",
          "actions": [{"type": "assign", "to": "payment.details", "fromEventPath": "details"}]
        },
        "CHANGE_PAYMENT_METHOD": "payment_method",
        "VALIDATION_ERROR": "payment_details"
      }
    },
    "secure_payment": {
      "invoke": {
        "type": "payment.service",
        "config": {"processPayment": true}
      },
      "view": {
        "moduleId": "PaymentProcessing",
        "slot": "main"
      },
      "on": {
        "PAYMENT_SUCCESS": "order_confirmation",
        "PAYMENT_FAILED": "payment_error",
        "PAYMENT_CANCELLED": "payment_method"
      }
    },
    "shipping_details": {
      "view": {
        "moduleId": "OrderSummary",
        "slot": "main"
      },
      "on": {
        "CONFIRM_ORDER": "secure_payment",
        "EDIT_ANYTHING": "cart_review"
      }
    },
    "order_confirmation": {
      "type": "final",
      "view": {
        "moduleId": "OrderSuccess",
        "slot": "main"
      }
    },
    "payment_error": {
      "view": {
        "moduleId": "PaymentError",
        "slot": "main"
      },
      "on": {
        "RETRY_PAYMENT": "payment_method",
        "CHANGE_PAYMENT": "payment_method",
        "CONTACT_SUPPORT": "support_request",
        "ABANDON": "session_timeout"
      }
    },
    "support_request": {
      "view": {
        "moduleId": "SupportForm",
        "slot": "modal"
      },
      "on": {
        "SUBMIT_SUPPORT": "support_success",
        "CANCEL_SUPPORT": "payment_error"
      }
    },
    "support_success": {
      "view": {
        "moduleId": "SupportConfirmation",
        "slot": "modal"
      },
      "on": {
        "CLOSE": "session_timeout"
      }
    },
    "session_timeout": {
      "type": "final",
      "view": {
        "moduleId": "SessionExpired",
        "slot": "main"
      }
    }
  }
}
```

## Key Features Demonstrated

### 1. Complex State Management
- **23 different states** handling various checkout scenarios
- **Hierarchical organization** with clear state responsibilities
- **Context management** for user, cart, payment, and shipping data

### 2. Service Integration
- **User authentication** service
- **Shipping calculation** service  
- **Payment processing** service
- **Error handling** for service failures

### 3. Advanced Navigation Patterns
- **Conditional routing** based on user authentication
- **Modal overlays** for login and support
- **Error recovery** flows
- **Session timeout** handling

### 4. Data Flow Management
- **Cart updates** through actions
- **Form data persistence** across states
- **Payment details** security
- **Error state** management

## Implementation Highlights

### Service Integration
```typescript
const services = {
  'user.service': async (config, context) => {
    if (config.checkAuth) {
      const token = localStorage.getItem('authToken');
      if (token) {
        const user = await validateToken(token);
        return { authenticated: true, user };
      }
    }
    return { authenticated: false };
  },
  
  'shipping.service': async (config, context) => {
    if (config.calculateRates) {
      const rates = await calculateShippingRates(
        context.shipping.address,
        context.cart.items
      );
      return { rates };
    }
  },
  
  'payment.service': async (config, context) => {
    if (config.processPayment) {
      const result = await processPayment({
        method: context.payment.method,
        details: context.payment.details,
        amount: context.cart.total + context.shipping.cost
      });
      return result;
    }
  }
};
```

### Error Handling
```typescript
const apis = {
  lifecycle: { 
    enter: (path) => console.log('Entering:', path),
    leave: (path) => console.log('Leaving:', path)
  },
  readFrom: (event, path) => {
    if (!path) return event;
    return path.split('.').reduce((obj, key) => obj?.[key], event);
  },
  track: (event, props) => {
    // Track user journey for analytics
    analytics.track('Checkout Step', {
      step: event.type,
      cartValue: props.cartValue,
      userId: props.userId
    });
  }
};
```

### Component Registry
```typescript
const registry = {
  resolve(moduleId: string) {
    switch(moduleId) {
      case 'ProductCatalog': return asReactView(ProductCatalog);
      case 'CartUpdate': return asReactView(CartUpdate);
      case 'CartReview': return asReactView(CartReview);
      case 'UserLogin': return asReactView(UserLogin);
      case 'GuestCheckout': return asReactView(GuestCheckout);
      case 'DeliveryForm': return asReactView(DeliveryForm);
      case 'ShippingOptions': return asReactView(ShippingOptions);
      case 'PaymentMethods': return asReactView(PaymentMethods);
      case 'PaymentForm': return asReactView(PaymentForm);
      case 'PaymentProcessing': return asReactView(PaymentProcessing);
      case 'OrderSummary': return asReactView(OrderSummary);
      case 'OrderSuccess': return asReactView(OrderSuccess);
      case 'PaymentError': return asReactView(PaymentError);
      case 'SupportForm': return asReactView(SupportForm);
      case 'SupportConfirmation': return asReactView(SupportConfirmation);
      case 'SessionExpired': return asReactView(SessionExpired);
      default: return undefined;
    }
  }
};
```

## Testing Strategy

### Unit Tests
```typescript
describe('E-commerce Checkout Flow', () => {
  let host: any;

  beforeEach(() => {
    host = createHeadlessHost(ecommerceFlow, mockDeps);
  });

  it('should handle complete checkout flow', () => {
    // Add item to cart
    host.send({ type: 'ADD_TO_CART', item: mockProduct });
    expect(host.actor.getSnapshot().value).toBe('cart_updated');

    // Proceed to checkout
    host.send({ type: 'PROCEED_CHECKOUT' });
    expect(host.actor.getSnapshot().value).toBe('cart_review');

    // Continue to login check
    host.send({ type: 'PROCEED_CHECKOUT' });
    expect(host.actor.getSnapshot().value).toBe('login_check');
  });

  it('should handle payment errors gracefully', () => {
    // Navigate to payment
    navigateToPayment(host);
    
    // Simulate payment failure
    host.send({ type: 'PAYMENT_FAILED', error: 'Insufficient funds' });
    expect(host.actor.getSnapshot().value).toBe('payment_error');
    
    // Retry payment
    host.send({ type: 'RETRY_PAYMENT' });
    expect(host.actor.getSnapshot().value).toBe('payment_method');
  });
});
```

### Integration Tests
```typescript
describe('Checkout Integration', () => {
  it('should complete full checkout with real services', async () => {
    const host = createHeadlessHost(ecommerceFlow, realServices);
    
    // Complete full flow
    await completeCheckoutFlow(host);
    
    expect(host.actor.getSnapshot().value).toBe('order_confirmation');
    expect(host.actor.getSnapshot().context.orderId).toBeDefined();
  });
});
```

## Performance Considerations

### 1. Lazy Loading
```typescript
const LazyRegistry = {
  resolve(moduleId: string) {
    switch(moduleId) {
      case 'PaymentForm':
        return lazy(() => import('./PaymentForm'));
      case 'OrderSummary':
        return lazy(() => import('./OrderSummary'));
      default:
        return undefined;
    }
  }
};
```

### 2. Context Optimization
```typescript
const getRelevantContext = (fullContext: any, state: string) => {
  const contextMap = {
    'cart_review': ['cart', 'user'],
    'payment_method': ['cart', 'shipping', 'user'],
    'order_confirmation': ['cart', 'shipping', 'payment', 'user']
  };
  
  const relevantKeys = contextMap[state] || [];
  return pick(fullContext, relevantKeys);
};
```

## Analytics and Monitoring

### User Journey Tracking
```typescript
const trackCheckoutStep = (step: string, context: any) => {
  analytics.track('Checkout Step', {
    step,
    cartValue: context.cart.total,
    itemCount: context.cart.items.length,
    userId: context.user.id,
    timestamp: Date.now()
  });
};
```

### Error Monitoring
```typescript
const trackError = (error: Error, context: any) => {
  errorReporting.captureException(error, {
    tags: {
      flow: 'ecommerce-checkout',
      state: context.currentState,
      userId: context.user.id
    },
    extra: {
      cart: context.cart,
      payment: context.payment
    }
  });
};
```

## Next Steps

- Explore [Insurance Quote](insurance-quote.md) for enterprise patterns
- Learn about [Advanced State Patterns](flow-dsl.md#advanced-state-patterns)
- See [Custom Adapters](adapters.md#custom-adapter-development) for framework integration
