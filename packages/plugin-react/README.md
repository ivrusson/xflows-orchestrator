# @xflows/plugin-react

React integration for XFlows framework.

## Features

- **useFlow Hook**: React hook for consuming flows
- **View Renderer**: Framework-agnostic view rendering
- **Flow Component**: Complete flow component
- **Type Safety**: Full TypeScript support

## Usage

```typescript
import React from 'react';
import { FlowComponent, useFlow } from '@xflows/plugin-react';

function MyApp() {
  const flowConfig = {
    id: 'my-flow',
    initialStep: 'welcome',
    steps: [/* ... */]
  };

  return <FlowComponent flowConfig={flowConfig} />;
}

// Or use the hook directly
function CustomFlow() {
  const { view, context, send } = useFlow(flowConfig);
  
  return (
    <div>
      {/* Custom rendering */}
    </div>
  );
}
```

## View Types

- **form**: Form inputs and validation
- **display**: Information display
- **decision**: Choice selection
- **loading**: Loading states
- **error**: Error handling
- **success**: Success states
- **federated-module**: Module Federation components
- **custom-component**: Custom components
