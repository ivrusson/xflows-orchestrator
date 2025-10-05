# 🔌 Plugin System Guide - XFlows Extension Framework

> **⚠️ Status: In Development**  
> The plugin system is currently in active development. The APIs documented here may change in future versions.

## 🎯 Executive Summary

**The XFlows Plugin System is a modular architecture that enables extensible functionality through plugins.** The current implementation provides basic plugin support with plans for more advanced features in future versions.

### 🌟 Current Features
- ✅ **Basic Plugin Interface** - Core plugin contract
- ✅ **Plugin Manager** - Registration and execution
- ✅ **HTTP Plugin** - HTTP request functionality
- ✅ **React Plugin** - React integration
- 🔄 **Advanced Plugin System** - Coming soon

---

## 🏗️ Current Architecture

### 📦 Available Plugins

| Plugin | Status | Description | Package |
|--------|--------|-------------|---------|
| **HTTP Action** | ✅ Ready | HTTP request actions | `@xflows/plugin-http` |
| **HTTP Actor** | ✅ Ready | HTTP async operations | `@xflows/plugin-http` |
| **React Integration** | ✅ Ready | React components and hooks | `@xflows/plugin-react` |
| **Plugin Manager** | ✅ Ready | Core plugin system | `@xflows/plugins` |

### 🏛️ System Components

```
🌟 Current Plugin System
├── 📋 Plugin Interface (types.ts)
├── 🔌 Plugin Manager (PluginManager.ts)
├── 🔄 Plugin Registry (PluginRegistry.ts)
├── 🌐 HTTP Plugin (HttpActionPlugin.ts)
└── ⚛️ React Plugin (FlowComponent.tsx)
```

---

## 🚀 Quick Start Guide

### 1. 🔧 Basic Plugin Usage

```typescript
import { PluginManager } from '@xflows/plugins';
import { HttpActionPlugin } from '@xflows/plugin-http';

// Create plugin manager
const pluginManager = new PluginManager();

// Register HTTP plugin
pluginManager.register(new HttpActionPlugin());

// Execute plugin
const result = await pluginManager.execute('http-action', {
  endpoint: '/api/users',
  method: 'POST',
  body: { name: 'John Doe' }
}, context);
```

### 2. ⚛️ React Integration

```typescript
import { FlowComponent } from '@xflows/plugin-react';
import { FlowOrchestrator } from '@xflows/core';

const flowConfig = {
  id: 'my-flow',
  name: 'My Flow',
  initialStep: 'welcome',
  context: {},
  steps: [
    {
      id: 'welcome',
      name: 'Welcome',
      view: {
        type: 'form',
        title: 'Welcome',
        fields: [
          {
            name: 'name',
            type: 'text',
            label: 'Name',
            required: true
          }
        ],
        actions: [
          { type: 'submit', label: 'Continue', event: 'NEXT' }
        ]
      },
      navigation: {
        onNext: 'success'
      }
    }
  ]
};

function App() {
  return <FlowComponent flowConfig={flowConfig} />;
}
```

---

## 📋 Plugin Interface

### **Base Plugin Interface**

```typescript
interface Plugin {
  id: string;
  type: 'action' | 'actor' | 'guard' | 'ui';
  version: string;
  execute(config: any, context: any): Promise<any>;
}
```

### **Plugin Types**

#### **Action Plugin**
```typescript
class MyActionPlugin implements Plugin {
  id = 'my-action';
  type = 'action' as const;
  version = '1.0.0';

  async execute(config: any, context: any): Promise<any> {
    // Action implementation
    console.log('Action executed:', config);
    return { success: true };
  }
}
```

#### **Actor Plugin**
```typescript
class MyActorPlugin implements Plugin {
  id = 'my-actor';
  type = 'actor' as const;
  version = '1.0.0';

  async execute(config: any, context: any): Promise<any> {
    // Async operation implementation
    const result = await this.performAsyncOperation(config);
    return result;
  }

  private async performAsyncOperation(config: any): Promise<any> {
    // Implementation details
  }
}
```

---

## 🔧 Plugin Manager

### **Registration**

```typescript
import { PluginManager } from '@xflows/plugins';

const pluginManager = new PluginManager();

// Register plugins
pluginManager.register(new HttpActionPlugin());
pluginManager.register(new MyCustomPlugin());

// Check if plugin exists
if (pluginManager.hasPlugin('http-action')) {
  console.log('HTTP plugin is available');
}
```

### **Execution**

```typescript
// Execute plugin
try {
  const result = await pluginManager.execute('http-action', config, context);
  console.log('Plugin result:', result);
} catch (error) {
  console.error('Plugin execution failed:', error);
}

// Get plugin by ID
const plugin = pluginManager.getPlugin('http-action');
if (plugin) {
  console.log('Plugin found:', plugin.id);
}

// Get plugins by type
const actionPlugins = pluginManager.getPluginsByType('action');
console.log('Action plugins:', actionPlugins.length);
```

---

## 🌐 HTTP Plugin

### **HTTP Action Plugin**

```typescript
import { HttpActionPlugin } from '@xflows/plugin-http';

const httpPlugin = new HttpActionPlugin();

// Use in flow configuration
const flowConfig = {
  // ...
  actions: {
    'fetch-user-data': {
      type: 'http_call',
      endpoint: '/api/users',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer {{context.token}}'
      }
    }
  }
};
```

### **HTTP Actor Plugin**

```typescript
import { HttpActorPlugin } from '@xflows/plugin-http';

const httpActorPlugin = new HttpActorPlugin();

// Use in flow steps
const step = {
  id: 'fetch-data',
  name: 'Fetch Data',
  invoke: {
    id: 'fetch-user',
    src: 'httpClient',
    input: {
      endpoint: '/api/user/{{context.userId}}',
      method: 'GET'
    },
    onDone: {
      target: 'success'
    },
    onError: {
      target: 'error'
    }
  }
};
```

---

## ⚛️ React Plugin

### **FlowComponent**

```typescript
import { FlowComponent } from '@xflows/plugin-react';

interface FlowComponentProps {
  flowConfig: FlowConfig;
  plugins?: Record<string, Plugin>;
  onStateChange?: (state: any) => void;
  onError?: (error: Error) => void;
}

function MyFlowApp() {
  return (
    <FlowComponent 
      flowConfig={flowConfig}
      onStateChange={(state) => {
        console.log('Flow state:', state);
      }}
      onError={(error) => {
        console.error('Flow error:', error);
      }}
    />
  );
}
```

### **useFlow Hook**

```typescript
import { useFlow } from '@xflows/plugin-react';

function MyFlowComponent() {
  const { state, send, view, context, isLoading, error } = useFlow(flowConfig);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{view?.title}</h1>
      <button onClick={() => send({ type: 'NEXT' })}>
        Next Step
      </button>
    </div>
  );
}
```

---

## 🚧 Roadmap

### **Phase 1: Current (v1.0)**
- ✅ Basic plugin interface
- ✅ Plugin manager and registry
- ✅ HTTP plugin implementation
- ✅ React integration

### **Phase 2: Enhanced Plugins (v1.1)**
- 🔄 **Advanced Plugin Categories**
  - Database plugins
  - Authentication plugins
  - Analytics plugins
  - Notification plugins

### **Phase 3: Plugin Ecosystem (v1.2)**
- 🔄 **Plugin Marketplace**
  - Third-party plugin support
  - Plugin discovery and installation
  - Plugin versioning and updates

### **Phase 4: Advanced Features (v2.0)**
- 🔄 **Dynamic Plugin Loading**
  - Runtime plugin loading
  - Hot-swappable plugins
  - Plugin dependencies

---

## 📚 Additional Resources

- [API Reference](../core/api-reference.md) - Complete API documentation
- [Flow Configuration Guide](../core/semantic-model-guide.md) - Flow configuration syntax
- [Getting Started Guide](./getting-started.md) - Quick start tutorial
- [Examples](../examples/) - Practical examples

---

## 🤝 Contributing

The plugin system is actively developed. Contributions are welcome!

### **Areas for Contribution**
- New plugin implementations
- Plugin system improvements
- Documentation updates
- Example plugins

### **Development Setup**
```bash
# Clone the repository
git clone https://github.com/your-org/xflows.git
cd xflows

# Install dependencies
pnpm install

# Build packages
pnpm build

# Run tests
pnpm test
```

---

*This guide covers the current state of the XFlows plugin system. For the latest updates and roadmap, check the project repository.*