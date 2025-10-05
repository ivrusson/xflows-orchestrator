# 🎯 Basic Demo

A simple example to get you started with XFlows.

## Overview

This demo shows a basic user registration flow with three steps:
1. Personal information
2. Email verification  
3. Success confirmation

## Flow Definition

```json
{
  "id": "basicDemo",
  "name": "Basic Demo Flow",
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
            "placeholder": "Enter your first name",
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
            "placeholder": "Enter your last name",
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
            "placeholder": "Enter your email address"
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
          { "type": "button", "label": "I've Verified", "event": "EMAIL_VERIFIED" },
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
        "template": "Hello {{context.user.personalInfo.firstName}}!",
        "actions": [
          { "type": "button", "label": "Continue", "event": "NEXT" }
        ]
      }
    }
  ]
}
```

## Implementation

### React Component

```tsx
import React from 'react';
import { FlowComponent } from '@xflows/plugin-react';
import basicDemoFlow from './basic-demo.json';

function BasicDemoApp() {
  return (
    <div className="basic-demo">
      <h1>XFlows Basic Demo</h1>
      <FlowComponent 
        flowConfig={basicDemoFlow}
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

export default BasicDemoApp;
```

### Using the useFlow Hook

```tsx
import React from 'react';
import { useFlow } from '@xflows/plugin-react';
import basicDemoFlow from './basic-demo.json';

function BasicDemoWithHook() {
  const { state, send, view, context, isLoading, error } = useFlow(basicDemoFlow);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="basic-demo">
      <h1>XFlows Basic Demo</h1>
      <div className="flow-state">
        <h2>Current Step: {view?.title}</h2>
        <p>Step: {state.value}</p>
        <p>Context: {JSON.stringify(context, null, 2)}</p>
      </div>
      
      {view?.type === 'form' && (
        <div className="form-view">
          <h3>{view.title}</h3>
          <p>{view.subtitle}</p>
          {/* Form fields would be rendered here by the FlowComponent */}
        </div>
      )}
      
      {view?.type === 'display' && (
        <div className="display-view">
          <h3>{view.title}</h3>
          <p>{view.message}</p>
          {view.actions?.map((action, index) => (
            <button 
              key={index}
              onClick={() => send({ type: action.event })}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
      
      {view?.type === 'success' && (
        <div className="success-view">
          <h3>{view.title}</h3>
          <p>{view.message}</p>
          <p>{view.template}</p>
        </div>
      )}
    </div>
  );
}

export default BasicDemoWithHook;
```

## Running the Demo

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Run the React demo:**
   ```bash
   pnpm --filter @xflows/react-demo dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3001`

## Key Concepts Demonstrated

- **Flow Configuration**: JSON-based flow definition using FlowConfig
- **View Types**: Different view types (form, display, success)
- **Form Fields**: Various field types with validation
- **Hooks System**: Before/after step processing
- **Navigation**: Step-to-step transitions
- **Template System**: Dynamic content with template expressions
- **React Integration**: FlowComponent and useFlow hook

## Next Steps

- Try the [Sales Flow Example](sales-flow.md) for a more complex scenario
- Explore [Advanced Patterns](../core/architecture-guide.md#advanced-patterns)
- Learn about [Plugin System](../guides/plugin-system-guide.md)
