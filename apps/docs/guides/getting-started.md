# 🚀 Getting Started

Welcome to XFlows! This guide will walk you through setting up your first flow and understanding the core concepts.

## 📋 Prerequisites

- **Node.js** 18+ and **pnpm** 8+
- Familiarity with **JSON** and basic **JavaScript/TypeScript**
- Optional: Experience with **React** or **state management**

## ⚡ Quick Setup

### 1. Clone and Install

```bash
git clone https://github.com/your-org/xflows.git
cd xflows
pnpm install
```

### 2. Validate Your Setup

```bash
# Build all packages
pnpm build

# Run tests
pnpm test

# Start the React demo
pnpm --filter react-demo dev
```

If everything works, you should see the React demo running! 🎉

## 📝 Your First Flow

Let's create a simple user registration flow to understand the basics.

### Step 1: Create Flow JSON

Create `my-flows/registration.json`:

```json
{
  "id": "user-registration",
  "name": "User Registration Flow",
  "version": "1.0.0",
  "description": "Simple user registration flow",
  "initialStep": "personal-info",
  "context": {
    "user": {},
    "errors": []
  },
  "steps": [
    {
      "id": "personal-info",
      "name": "Personal Information",
      "view": {
        "type": "form",
        "title": "Personal Information",
        "subtitle": "Please provide your basic information",
        "fields": [
          {
            "name": "firstName",
            "type": "text",
            "label": "First Name",
            "required": true,
            "validation": {
              "minLength": 2,
              "maxLength": 50
            }
          },
          {
            "name": "lastName",
            "type": "text",
            "label": "Last Name",
            "required": true,
            "validation": {
              "minLength": 2,
              "maxLength": 50
            }
          },
          {
            "name": "email",
            "type": "email",
            "label": "Email Address",
            "required": true
          }
        ],
        "actions": [
          { "type": "submit", "label": "Continue", "event": "NEXT" },
          { "type": "button", "label": "Back", "event": "BACK" }
        ]
      },
      "hooks": {
        "after": [
          {
            "id": "save-personal-info",
            "type": "assign",
            "target": "user.personalInfo",
            "value": "{{event.data}}"
          }
        ]
      },
      "navigation": {
        "onNext": "verify-email",
        "onBack": "welcome"
      }
    },
    {
      "id": "verify-email",
      "name": "Email Verification",
      "view": {
        "type": "display",
        "title": "Verify Your Email",
        "message": "We've sent a verification link to {{context.user.personalInfo.email}}",
        "actions": [
          { "type": "button", "label": "Resend Email", "event": "RESEND" },
          { "type": "button", "label": "Back", "event": "BACK" }
        ]
      },
      "invoke": {
        "id": "send-verification",
        "src": "httpClient",
        "input": {
          "endpoint": "/api/send-verification",
          "method": "POST",
          "body": "{{context.user.personalInfo.email}}"
        },
        "onDone": {
          "target": "verification-sent"
        },
        "onError": {
          "target": "error-step"
        }
      },
      "navigation": {
        "onNext": "success",
        "onBack": "personal-info"
      }
    },
    {
      "id": "success",
      "name": "Registration Complete",
      "view": {
        "type": "success",
        "title": "Registration Complete!",
        "message": "Welcome to our platform!",
        "actions": [
          { "type": "button", "label": "Continue", "event": "NEXT" }
        ]
      }
    }
  ]
}
```

### Step 2: Understanding the Structure

Let's break down what makes a flow:

#### **Root Properties**
```json
{
  "id": "unique-flow-identifier",           // Required: unique identifier
  "name": "Flow Name",                      // Required: descriptive name
  "version": "1.0.0",                       // Optional: version
  "description": "Flow description",        // Optional: description
  "initialStep": "starting-step",           // Required: initial step ID
  "context": { ... },                       // Optional: initial context/state
  "steps": [ ... ]                          // Required: step definitions
}
```

#### **Step Structure**
```json
{
  "id": "step-id",                          // Required: step identifier
  "name": "Step Name",                       // Required: step name
  "view": {                                 // Required: UI configuration
    "type": "form|display|success|error",   // View type
    "title": "Step Title",                  // View title
    "fields": [ ... ],                      // Form fields (for form type)
    "actions": [ ... ]                      // UI actions
  },
  "hooks": {                                // Optional: step hooks
    "before": [ ... ],                      // Pre-step hooks
    "after": [ ... ]                        // Post-step hooks
  },
  "invoke": { ... },                        // Optional: async operations
  "navigation": { ... }                     // Required: navigation config
}
```

### Step 3: Use with React

Create a React component to use your flow:

```tsx
// RegistrationFlow.tsx
import React from 'react';
import { FlowComponent } from 'plugin-react';
import registrationFlow from './registration.json';

function RegistrationFlow() {
  return (
    <div className="registration-flow">
      <FlowComponent 
        flowConfig={registrationFlow}
        onStateChange={(state) => {
          console.log('Flow state changed:', state);
        }}
        onError={(error) => {
          console.error('Flow error:', error);
        }}
      />
    </div>
  );
}

export default RegistrationFlow;
```

### Step 4: Run Your Flow

```bash
# Start the React demo with your flow
pnpm --filter react-demo dev
```

Your registration flow should now be running! Navigate through the steps and see how state updates automatically.

## 🧠 Core Concepts Deep Dive

### Flow Configuration & XState Integration

**Why XState?** Traditional application state can become unpredictable when you have complex user journeys. State machines solve this by:

- **Formal Semantics**: Only valid transitions are possible
- **Predictable Behavior**: Same state + event = same result
- **Visual Debugging**: You can see exactly where you are
- **Testability**: Easier to test business logic

### FlowConfig Features

#### **Conditional Navigation**
```json
{
  "navigation": {
    "onNext": [
      {
        "target": "premium-flow",
        "guard": "isPremiumUser"
      },
      {
        "target": "standard-flow",
        "guard": "isRegularUser"
      },
      {
        "target": "error-step"
      }
    ]
  }
}
```

#### **Hooks System**
```json
{
  "hooks": {
    "before": [
      {
        "id": "validate-data",
        "type": "http_call",
        "endpoint": "/api/validate",
        "method": "POST",
        "body": "{{context.formData}}",
        "updateContext": "validationResult"
      }
    ],
    "after": [
      {
        "id": "save-data",
        "type": "assign",
        "target": "user.data",
        "value": "{{event.data}}"
      }
    ]
  }
}
```

#### **Error Handling**
```json
{
  "invoke": {
    "id": "process-payment",
    "src": "httpClient",
    "input": {
      "endpoint": "/api/process-payment",
      "method": "POST",
      "body": "{{context.paymentData}}"
    },
    "onDone": {
      "target": "success-step"
    },
    "onError": {
      "target": "error-step"
    }
  }
}
```

## 🎯 Next Steps

- 📖 Read the [Architecture Guide](../core/architecture-guide.md) to understand the system design
- 🎨 Explore the [Semantic Model Guide](../core/semantic-model-guide.md) for complete syntax
- 🔧 Learn about [Plugin System](../guides/plugin-system-guide.md) for custom integrations
- 💡 Check out [Examples](../examples/) for advanced patterns

---

**🎉 Congratulations!** You've created your first XFlows flow. Ready to explore more advanced features? Continue to the [Architecture Guide →](../core/architecture-guide.md)
