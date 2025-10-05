# @xflows/plugin-http

HTTP plugins for XFlows framework.

## Features

- **HTTP Actor Plugin**: HTTP-based actors for async operations
- **HTTP Action Plugin**: HTTP-based actions for context updates
- **Template Support**: Dynamic request body and header parsing
- **Error Handling**: Configurable error handling strategies

## Usage

```typescript
import { HttpActorPlugin, HttpActionPlugin } from '@xflows/plugin-http';

// Register plugins
const httpActor = new HttpActorPlugin();
const httpAction = new HttpActionPlugin();

await httpActor.initialize();
await httpAction.initialize();

// Use in flow configuration
const flowConfig = {
  actors: {
    httpClient: {
      type: 'fromPromise',
      endpoint: '/api/data',
      method: 'POST'
    }
  },
  steps: [{
    hooks: {
      after: [{
        type: 'http_call',
        endpoint: '/api/save',
        body: '{{context, event}}',
        updateContext: 'savedData'
      }]
    }
  }]
};
```
