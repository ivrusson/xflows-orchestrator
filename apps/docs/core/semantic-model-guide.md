# 📚 XFlows Flow Configuration Guide

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [Flow Configuration Structure](#flow-configuration-structure)
3. [Step Definition](#step-definition)
4. [View Configuration](#view-configuration)
5. [Hooks System](#hooks-system)
6. [Navigation Logic](#navigation-logic)
7. [Template System](#template-system)
8. [XState Integration](#xstate-integration)
9. [Complete Example](#complete-example)

---

## 🎯 Introduction

The XFlows Flow Configuration is a declarative JSON-based system that allows defining complex business flows and automatically translating them to XState state machines. It's designed for modern web applications with a clean separation between business logic and UI concerns.

### **Key Benefits**

- ✅ **Declarative:** Define WHAT to do, not HOW to do it
- ✅ **Decoupled:** UI separated from business logic
- ✅ **Extensible:** Plugin system for different services
- ✅ **Testable:** Clear states and transitions
- ✅ **Maintainable:** Changes in JSON, not code

---

## 🏗️ Flow Configuration Structure

### **Base Definition**

```json
{
  "id": "sales-flow",
  "name": "Sales Channel Flow",
  "version": "1.0.0",
  "description": "Complete sales flow with validation and approval",
  "initialStep": "welcome",
  "context": { /* initial context */ },
  "actions": { /* system actions */ },
  "guards": { /* conditions */ },
  "actors": { /* async operations */ },
  "steps": [ /* flow steps */ ]
}
```

### **Flow Properties**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ✅ | Unique flow identifier |
| `name` | string | ✅ | Descriptive flow name |
| `version` | string | ❌ | Flow version (semver) |
| `description` | string | ❌ | Purpose description |
| `initialStep` | string | ✅ | Initial step ID |
| `context` | object | ✅ | Initial machine context |
| `actions` | object | ❌ | System actions |
| `guards` | object | ❌ | Navigation conditions |
| `actors` | object | ❌ | Asynchronous operations |
| `steps` | array | ✅ | Flow steps |

---

## 🚶 Step Definition

### **Step Structure**

```json
{
  "id": "step-id",
  "name": "Step Name",
  "view": {
    "type": "form|display|decision|loading|error|success|federated-module|custom-component",
    "title": "Step Title",
    "subtitle": "Optional subtitle",
    "template": "{{context.user.name}}",
    "fields": [ /* form fields */ ],
    "actions": [ /* UI actions */ ],
    "data": "{{context}}"
  },
  "hooks": {
    "before": [ /* pre-step hooks */ ],
    "after": [ /* post-step hooks */ ]
  },
  "navigation": {
    "onNext": "next-step-id",
    "onBack": "previous-step-id",
    "onError": "error-step-id",
    "onCancel": "cancel-step-id"
  },
  "invoke": {
    "id": "operation-id",
    "src": "actor-name",
    "input": { /* actor input */ },
    "onDone": { "target": "success-step" },
    "onError": { "target": "error-step" }
  }
}
```

---

## 🎨 View Configuration

### **View Types**

#### **Form View**
```json
{
  "type": "form",
  "title": "Personal Information",
  "subtitle": "Please provide your basic information",
  "fields": [
    {
      "name": "name",
      "type": "text",
      "label": "Full Name",
      "required": true,
      "placeholder": "Enter your full name",
      "validation": {
        "minLength": 2,
        "maxLength": 50
      }
    },
    {
      "name": "email",
      "type": "email",
      "label": "Email Address",
      "required": true,
      "placeholder": "Enter your email"
    },
    {
      "name": "age",
      "type": "number",
      "label": "Age",
      "min": 18,
      "max": 100,
      "step": 1
    },
    {
      "name": "country",
      "type": "select",
      "label": "Country",
      "options": [
        { "value": "us", "label": "United States" },
        { "value": "ca", "label": "Canada" },
        { "value": "mx", "label": "Mexico" }
      ]
    }
  ],
  "actions": [
    { "type": "submit", "label": "Continue", "event": "NEXT" },
    { "type": "button", "label": "Back", "event": "BACK" }
  ]
}
```

#### **Display View**
```json
{
  "type": "display",
  "title": "Success",
  "subtitle": "Your application has been submitted",
  "message": "Thank you for your submission!",
  "template": "Your application ID is: {{context.applicationId}}",
  "actions": [
    { "type": "button", "label": "Continue", "event": "NEXT" }
  ]
}
```

#### **Loading View**
```json
{
  "type": "loading",
  "title": "Processing",
  "message": "Please wait while we process your request...",
  "template": "Processing step: {{step.name}}"
}
```

#### **Error View**
```json
{
  "type": "error",
  "title": "Something went wrong",
  "message": "We encountered an error processing your request.",
  "template": "Error: {{context.error.message}}",
  "actions": [
    { "type": "button", "label": "Try Again", "event": "RETRY" },
    { "type": "button", "label": "Start Over", "event": "RESET" }
  ]
}
```

#### **Success View**
```json
{
  "type": "success",
  "title": "Application Complete!",
  "message": "Your application has been submitted successfully.",
  "template": "Application ID: {{context.result.applicationId}}",
  "actions": [
    { "type": "button", "label": "View Policy", "event": "VIEW_POLICY" },
    { "type": "button", "label": "Start New Application", "event": "RESET" }
  ]
}
```

#### **Federated Module View**
```json
{
  "type": "federated-module",
  "moduleId": "insurance-calculator",
  "moduleUrl": "https://modules.example.com/calculator/remoteEntry.js",
  "componentName": "InsuranceCalculator",
  "props": {
    "title": "Calculate Your Premium",
    "applicantData": "{{context.applicant}}",
    "onQuoteCalculated": "QUOTE_CALCULATED"
  },
  "fallback": {
    "type": "loading",
    "title": "Loading Calculator",
    "message": "Please wait..."
  }
}
```

#### **Custom Component View**
```json
{
  "type": "custom-component",
  "componentPath": "./components/CustomWidget",
  "props": {
    "data": "{{context}}",
    "onAction": "CUSTOM_ACTION"
  }
}
```

---

## 🪝 Hooks System

### **Hook Types**

#### **HTTP Call Hook**
```json
{
  "id": "validate-data",
  "type": "http_call",
  "endpoint": "/api/validate",
  "method": "POST",
  "body": "{{context.formData}}",
  "headers": {
    "Authorization": "Bearer {{context.session.token}}",
    "Content-Type": "application/json"
  },
  "updateContext": "validationResult",
  "onError": "fail"
}
```

#### **Assign Hook**
```json
{
  "id": "save-step-data",
  "type": "assign",
  "target": "stepData",
  "value": "{{event.data}}"
}
```

#### **Log Hook**
```json
{
  "id": "log-progress",
  "type": "log",
  "message": "User completed step: {{step.name}}",
  "level": "info"
}
```

#### **Analytics Hook**
```json
{
  "id": "track-step",
  "type": "analytics",
  "event": "step_completed",
  "data": {
    "stepId": "{{step.id}}",
    "userId": "{{context.user.id}}",
    "timestamp": "{{Date.now()}}"
  }
}
```

#### **Delay Hook**
```json
{
  "id": "wait-for-processing",
  "type": "delay",
  "duration": 2000
}
```

#### **Condition Hook**
```json
{
  "id": "conditional-action",
  "type": "condition",
  "expression": {
    ">": [{ "var": "context.score" }, 50]
  },
  "onTrue": [
    {
      "id": "assign-approved",
      "type": "assign",
      "target": "status",
      "value": "approved"
    }
  ],
  "onFalse": [
    {
      "id": "assign-rejected",
      "type": "assign",
      "target": "status",
      "value": "rejected"
    }
  ]
}
```

---

## 🧭 Navigation Logic

### **Simple Navigation**
```json
{
  "navigation": {
    "onNext": "next-step",
    "onBack": "previous-step",
    "onError": "error-step"
  }
}
```

### **Conditional Navigation**
```json
{
  "navigation": {
    "onNext": {
      "target": "next-step",
      "guard": "isValidData",
      "actions": ["assignStepData"]
    }
  }
}
```

### **Multiple Conditions**
```json
{
  "navigation": {
    "onNext": [
      {
        "target": "premium-flow",
        "guard": "isPremiumUser"
      },
      {
        "target": "regular-flow",
        "guard": "isRegularUser"
      },
      {
        "target": "error-step"
      }
    ]
  }
}
```

### **Navigation with Actions**
```json
{
  "navigation": {
    "onNext": {
      "target": "next-step",
      "actions": [
        "saveData",
        "trackProgress",
        "sendNotification"
      ]
    }
  }
}
```

---

## 🛡️ Guards and Conditions

### **JSON Logic Guards**
```json
{
  "guards": {
    "isValidData": {
      "type": "jsonLogic",
      "expression": {
        "and": [
          { ">": [{ "var": "context.score" }, 50] },
          { "!": [{ "var": "context.errors" }] }
        ]
      }
    },
    "isPremiumUser": {
      "type": "jsonLogic",
      "expression": {
        "==": [{ "var": "context.user.tier" }, "premium"]
      }
    }
  }
}
```

### **Simple Guards**
```json
{
  "guards": {
    "hasPermission": {
      "type": "simple",
      "condition": "{{context.user.role === 'admin'}}"
    }
  }
}
```

---

## ⚡ Actions and Actors

### **System Actions**
```json
{
  "actions": {
    "assignStepData": {
      "type": "assign",
      "target": "stepData",
      "value": "{{event.data}}"
    },
    "logEvent": {
      "type": "log",
      "message": "Event: {{event.type}}",
      "level": "info"
    },
    "trackAnalytics": {
      "type": "analytics",
      "event": "step_completed",
      "data": "{{context}}"
    }
  }
}
```

### **Actors**
```json
{
  "actors": {
    "httpClient": {
      "type": "fromPromise",
      "endpoint": "{{endpoint}}",
      "method": "POST"
    },
    "emailService": {
      "type": "fromPromise",
      "service": "sendgrid",
      "template": "{{template}}",
      "data": "{{data}}"
    }
  }
}
```

---

## 🎨 Template System

### **Template Syntax**
Templates use `{{expression}}` syntax with access to:
- `context`: Flow context data
- `event`: Current event data
- `step`: Current step information

### **Built-in Functions**
```json
{
  "timestamp": "{{Date.now()}}",
  "isoDate": "{{Date.iso()}}",
  "random": "{{Math.random()}}",
  "floor": "{{Math.floor(5.7)}}",
  "stringify": "{{JSON.stringify(context.user)}}",
  "length": "{{String.length(context.user.name)}}"
}
```

### **Dot Notation**
```json
{
  "userName": "{{context.user.name}}",
  "sessionToken": "{{context.session.token}}",
  "stepTitle": "{{step.view.title}}",
  "eventType": "{{event.type}}"
}
```

---

## 🔄 XState Integration

### **Translation Process**

1. **Flow Definition** → **XState Machine**
2. **Steps** → **States**
3. **Hooks** → **Actions**
4. **Navigation** → **Transitions**
5. **Guards** → **Guard Functions**
6. **Actors** → **Invoke Configurations**

### **Generated Machine Structure**
```typescript
createMachine({
  id: "sales-flow",
  initial: "welcome",
  context: { /* initial context */ },
  states: {
    welcome: {
      meta: { view: { /* step view */ } },
      entry: [ /* before hooks */ ],
      exit: [ /* after hooks */ ],
      invoke: { /* async operations */ },
      on: {
        NEXT: "next-step",
        BACK: "previous-step"
      }
    },
    // ... other states
  },
  actions: { /* system actions */ },
  guards: { /* conditions */ },
  actors: { /* async operations */ }
})
```

---

## 📝 Complete Example

### **Insurance Quote Flow**

```json
{
  "id": "insurance-quote",
  "name": "Insurance Quote Flow",
  "version": "1.0.0",
  "description": "Complete insurance quote process",
  "initialStep": "welcome",
  "context": {
    "session": {
      "userId": "123",
      "token": "abc123",
      "channel": "web"
    },
    "applicant": {},
    "quote": {},
    "errors": [],
    "ui": {
      "isLoading": false,
      "currentStep": "welcome"
    }
  },
  "actions": {
    "assignStepData": {
      "type": "assign",
      "target": "stepData",
      "value": "{{event.data}}"
    },
    "assignError": {
      "type": "assign",
      "target": "errors",
      "value": "{{event.error}}"
    }
  },
  "guards": {
    "isValidData": {
      "type": "jsonLogic",
      "expression": {
        ">": [{ "var": "validationResult.score" }, 50]
      }
    }
  },
  "actors": {
    "httpClient": {
      "type": "fromPromise",
      "endpoint": "{{endpoint}}",
      "method": "POST"
    }
  },
  "steps": [
    {
      "id": "welcome",
      "name": "Welcome Screen",
      "view": {
        "type": "display",
        "title": "Welcome to Insurance Quote",
        "template": "Get your personalized insurance quote in minutes!",
        "actions": [
          { "type": "button", "label": "Start Quote", "event": "NEXT" }
        ]
      },
      "navigation": {
        "onNext": "personal-info"
      }
    },
    {
      "id": "personal-info",
      "name": "Personal Information",
      "view": {
        "type": "form",
        "title": "Personal Information",
        "subtitle": "Please provide your basic information",
        "fields": [
          {
            "name": "name",
            "type": "text",
            "label": "Full Name",
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
        "before": [
          {
            "id": "prepare-data",
            "type": "http_call",
            "endpoint": "/api/prepare-step1",
            "body": "{{context}}",
            "updateContext": "preparedData"
          }
        ],
        "after": [
          {
            "id": "save-data",
            "type": "http_call",
            "endpoint": "/api/save-step1",
            "body": "{{context, event}}",
            "updateContext": "savedData"
          }
        ]
      },
      "navigation": {
        "onNext": {
          "target": "financial-info",
          "guard": "isValidData",
          "actions": "assignStepData"
        },
        "onBack": "welcome",
        "onError": "error-step"
      }
    },
    {
      "id": "quote-calculator",
      "name": "Quote Calculator",
      "view": {
        "type": "federated-module",
        "moduleId": "insurance-calculator",
        "moduleUrl": "https://modules.example.com/calculator/remoteEntry.js",
        "componentName": "InsuranceCalculator",
        "props": {
          "title": "Calculate Your Premium",
          "applicantData": "{{context.applicant}}",
          "quoteOptions": "{{context.quoteOptions}}",
          "onQuoteCalculated": "QUOTE_CALCULATED",
          "onError": "CALCULATION_ERROR"
        },
        "fallback": {
          "type": "loading",
          "title": "Loading Calculator",
          "message": "Please wait while we load the premium calculator..."
        }
      },
      "invoke": {
        "id": "calculate-quote",
        "src": "httpClient",
        "input": {
          "endpoint": "/api/calculate-quote",
          "method": "POST",
          "body": "{{context}}"
        },
        "onDone": {
          "target": "quote-result",
          "actions": "assignStepData"
        },
        "onError": {
          "target": "error-step",
          "actions": "assignError"
        }
      },
      "navigation": {
        "onNext": "quote-result",
        "onError": "error-step"
      }
    },
    {
      "id": "quote-result",
      "name": "Quote Result",
      "view": {
        "type": "display",
        "title": "Your Insurance Quote",
        "template": "Based on your information, here's your personalized quote:",
        "content": {
          "premium": "{{context.quote.premium}}",
          "coverage": "{{context.quote.coverage}}",
          "deductible": "{{context.quote.deductible}}"
        },
        "actions": [
          { "type": "button", "label": "Accept Quote", "event": "ACCEPT" },
          { "type": "button", "label": "Modify", "event": "MODIFY" },
          { "type": "button", "label": "Back", "event": "BACK" }
        ]
      },
      "navigation": {
        "onNext": "success",
        "onBack": "quote-calculator"
      }
    },
    {
      "id": "success",
      "name": "Success Screen",
      "view": {
        "type": "success",
        "title": "Application Complete!",
        "message": "Your insurance application has been submitted successfully.",
        "content": {
          "applicationId": "{{context.result.applicationId}}",
          "nextSteps": [
            "Check your email for confirmation",
            "Review your policy documents",
            "Payment will be processed within 24 hours"
          ]
        },
        "actions": [
          { "type": "button", "label": "View Policy", "event": "VIEW_POLICY" },
          { "type": "button", "label": "Start New Application", "event": "RESET" }
        ]
      }
    },
    {
      "id": "error-step",
      "name": "Error Screen",
      "view": {
        "type": "error",
        "title": "Something went wrong",
        "message": "We encountered an error processing your request.",
        "errors": "{{context.errors}}",
        "actions": [
          { "type": "button", "label": "Try Again", "event": "RETRY" },
          { "type": "button", "label": "Start Over", "event": "RESET" },
          { "type": "button", "label": "Contact Support", "event": "SUPPORT" }
        ]
      },
      "navigation": {
        "onNext": "welcome",
        "onRetry": "{{previousStep}}"
      }
    }
  ]
}
```

---

## 🚀 Getting Started

### **1. Install Dependencies**
```bash
npm install @xflows/core @xflows/plugin-react @xflows/plugin-http
```

### **2. Create Flow Configuration**
```typescript
import { FlowOrchestrator } from '@xflows/core';

const flowConfig = {
  id: 'my-flow',
  name: 'My Flow',
  initialStep: 'welcome',
  context: { /* initial data */ },
  steps: [ /* step definitions */ ]
};

const orchestrator = new FlowOrchestrator();
const machine = orchestrator.createMachine(flowConfig);
```

### **3. Use with React**
```typescript
import { FlowComponent } from '@xflows/plugin-react';

function App() {
  return <FlowComponent flowConfig={flowConfig} />;
}
```

### **4. Add Plugins**
```typescript
import { FlowOrchestrator } from '@xflows/core';
import { HttpActionPlugin } from '@xflows/plugin-http';

const orchestrator = new FlowOrchestrator({
  plugins: {
    http: new HttpActionPlugin()
  }
});
```

---

## 📚 Additional Resources

- [Architecture Guide](./architecture-guide.md)
- [API Reference](./api-reference.md)
- [Plugin System Guide](./plugin-system-guide.md)
- [XState v5 Guide](./xstate-v5-complete-guide.md)
- [Examples](./examples/)

---

*This guide provides comprehensive documentation for the XFlows Flow Configuration system. For specific implementation details, refer to the API reference and examples.*
