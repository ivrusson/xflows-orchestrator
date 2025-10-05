# 💼 Sales Flow Example

A comprehensive sales quote generation flow demonstrating enterprise patterns.

## Overview

This example shows a complete sales process with:
- Multi-step quote generation
- Coverage selection
- Summary and confirmation
- Error handling and validation

## Flow Definition

```json
{
  "id": "salesFlow",
  "initial": "quote.start",
  "context": {
    "session": {
      "channel": "web"
    },
    "quote": {},
    "errors": {}
  },
  "states": {
    "quote": {
      "initial": "start",
      "states": {
        "start": {
          "view": {
            "moduleId": "quote-start",
            "slot": "app"
          },
          "on": {
            "NEXT": "coverage"
          }
        },
        "coverage": {
          "view": {
            "moduleId": "coverage",
            "slot": "app"
          },
          "on": {
            "NEXT": "summary",
            "BACK": "#salesFlow.quote.start"
          }
        },
        "summary": {
          "view": {
            "moduleId": "summary",
            "slot": "app"
          },
          "on": {
            "CONFIRM": "#salesFlow.done",
            "BACK": "coverage"
          }
        }
      }
    },
    "done": {
      "type": "final"
    }
  }
}
```

## Implementation Features

### 1. Hierarchical States
The flow uses nested states to organize the quote process:
- `quote` parent state contains all quote-related steps
- Individual steps are child states with specific responsibilities

### 2. Navigation Patterns
- **Forward navigation**: `"NEXT": "coverage"`
- **Backward navigation**: `"BACK": "#salesFlow.quote.start"`
- **Cross-hierarchy navigation**: `"CONFIRM": "#salesFlow.done"`

### 3. Context Management
```json
{
  "context": {
    "session": { "channel": "web" },
    "quote": {},
    "errors": {}
  }
}
```

### 4. View Binding
Each state specifies which component to render:
```json
{
  "view": {
    "moduleId": "quote-start",
    "slot": "app"
  }
}
```

## React Implementation

```tsx
import React from 'react';
import { createHeadlessHost } from '@xflows/core';
import { createReactRenderer, asReactView } from '@xflows/adapter-react';
import salesFlow from './sales-flow.json';

// Components
const QuoteStart = ({ nodeId, contextSlice, send }) => (
  <div className="quote-start">
    <h2>Welcome to Our Quote System</h2>
    <p>Let's get started with your insurance quote.</p>
    <button onClick={() => send({ type: 'NEXT' })}>
      Start Quote
    </button>
  </div>
);

const Coverage = ({ nodeId, contextSlice, send }) => {
  const [selectedCoverage, setSelectedCoverage] = useState('basic');

  return (
    <div className="coverage">
      <h2>Select Coverage</h2>
      <div className="coverage-options">
        <label>
          <input 
            type="radio" 
            value="basic"
            checked={selectedCoverage === 'basic'}
            onChange={(e) => setSelectedCoverage(e.target.value)}
          />
          Basic Coverage
        </label>
        <label>
          <input 
            type="radio" 
            value="premium"
            checked={selectedCoverage === 'premium'}
            onChange={(e) => setSelectedCoverage(e.target.value)}
          />
          Premium Coverage
        </label>
      </div>
      <div className="navigation">
        <button onClick={() => send({ type: 'BACK' })}>
          Back
        </button>
        <button onClick={() => send({ type: 'NEXT', payload: { coverage: selectedCoverage } })}>
          Next
        </button>
      </div>
    </div>
  );
};

const Summary = ({ nodeId, contextSlice, send }) => (
  <div className="summary">
    <h2>Quote Summary</h2>
    <div className="quote-details">
      <p>Coverage: {contextSlice.quote?.coverage || 'Not selected'}</p>
      <p>Channel: {contextSlice.session?.channel}</p>
    </div>
    <div className="navigation">
      <button onClick={() => send({ type: 'BACK' })}>
        Back
      </button>
      <button onClick={() => send({ type: 'CONFIRM' })}>
        Confirm Quote
      </button>
    </div>
  </div>
);

// Registry
const registry = {
  resolve(moduleId: string) {
    switch(moduleId) {
      case 'quote-start': return asReactView(QuoteStart);
      case 'coverage': return asReactView(Coverage);
      case 'summary': return asReactView(Summary);
      default: return undefined;
    }
  }
};

// Services and APIs
const services = {};
const apis = {
  lifecycle: { enter: () => {}, leave: () => {} },
  readFrom: (event, path) => path ? event.path?.split('.').reduce((a,k) => a?.[k], event) : event,
  track: (event, props) => console.log('Analytics:', event, props)
};

// Create host and renderer
const host = createHeadlessHost(salesFlow, { services, apis });
const renderer = createReactRenderer(registry);

export { host, renderer };
```

## Key Patterns Demonstrated

### 1. State Hierarchy
- Parent state (`quote`) groups related functionality
- Child states handle specific steps
- Clear separation of concerns

### 2. Navigation Control
- Forward/backward navigation within hierarchy
- Cross-hierarchy navigation for final states
- Contextual navigation based on user actions

### 3. Data Flow
- Context updates through actions
- Data persistence across state transitions
- Error state management

### 4. Component Organization
- One component per state
- Clear component responsibilities
- Reusable navigation patterns

## Advanced Features

### Error Handling
```json
{
  "error": {
    "view": { "moduleId": "error-display" },
    "on": {
      "RETRY": "quote.start",
      "CANCEL": "done"
    }
  }
}
```

### Service Integration
```json
{
  "processing": {
    "invoke": [{
      "type": "calculate-quote",
      "config": {
        "coverage": "{{context.quote.coverage}}",
        "customer": "{{context.session.customerId}}"
      },
      "assignTo": "quote.pricing"
    }],
    "onDone": "summary",
    "onError": "error"
  }
}
```

## Testing

```typescript
import { createHeadlessHost } from '@xflows/core';
import salesFlow from './sales-flow.json';

describe('Sales Flow', () => {
  let host: any;

  beforeEach(() => {
    host = createHeadlessHost(salesFlow, mockDeps);
  });

  it('should navigate through quote steps', () => {
    // Start quote
    host.send({ type: 'NEXT' });
    expect(host.actor.getSnapshot().value).toBe('quote.coverage');

    // Select coverage
    host.send({ type: 'NEXT', payload: { coverage: 'premium' } });
    expect(host.actor.getSnapshot().value).toBe('quote.summary');

    // Confirm
    host.send({ type: 'CONFIRM' });
    expect(host.actor.getSnapshot().value).toBe('done');
  });

  it('should handle back navigation', () => {
    // Navigate to coverage
    host.send({ type: 'NEXT' });
    host.send({ type: 'NEXT', payload: { coverage: 'basic' } });
    
    // Go back
    host.send({ type: 'BACK' });
    expect(host.actor.getSnapshot().value).toBe('quote.coverage');
  });
});
```

## Next Steps

- Explore [E-commerce Checkout](ecommerce-checkout.md) for complex multi-step flows
- Learn about [Advanced State Patterns](flow-dsl.md#advanced-state-patterns)
- See [Insurance Quote](insurance-quote.md) for enterprise patterns
