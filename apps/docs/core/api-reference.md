# 📚 API Reference

Complete API documentation for XFlows packages and functions.

## 📦 Package Overview

| Package | Version | Description | Main Exports |
|---------|---------|-------------|--------------|
| [`core`](#core) | 1.0.0 | Core flow orchestrator engine | `FlowOrchestrator`, `FlowConfig` |
| [`plugin-react`](#plugin-react) | 1.0.0 | React integration | `FlowComponent`, `useFlow` |
| [`plugin-http`](#plugin-http) | 1.0.0 | HTTP plugin | `HttpActionPlugin`, `HttpActorPlugin` |
| [`plugins`](#plugins) | 1.0.0 | Plugin system | `PluginManager`, `PluginRegistry` |
| [`renderer-core`](#renderer-core) | 1.0.0 | Renderer contracts | `ViewProps`, `HostRenderer` |

---

## core

Core flow orchestrator that converts FlowConfig definitions into XState machines.

### `FlowOrchestrator`

Main class for orchestrating complex flow processes from JSON definitions to XState machines.

#### Signature

```typescript
class FlowOrchestrator {
  constructor(options?: FlowOrchestratorOptions);
  createMachine(flowConfig: FlowConfig): StateMachine<any, any, any>;
  validateFlow(flowConfig: FlowConfig): ValidationResult;
}
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `options` | `FlowOrchestratorOptions` | Optional configuration |

#### Methods

| Method | Return Type | Description |
|--------|-------------|-------------|
| `createMachine(flowConfig)` | `StateMachine` | Creates XState machine from flow config |
| `validateFlow(flowConfig)` | `ValidationResult` | Validates flow configuration |

#### Example

```typescript
import { FlowOrchestrator } from 'core';
import myFlowConfig from './my-flow.json';

const orchestrator = new FlowOrchestrator();
const machine = orchestrator.createMachine(myFlowConfig);

// Validate before creating machine
const validation = orchestrator.validateFlow(myFlowConfig);
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```

### `Services`

Pre-built service implementations for common use cases.

#### `Services.httpRunner`

Generic HTTP service runner.

```typescript
async function httpRunner(config: HttpConfig, context: any): Promise<any>
```

**Parameters:**
- `config.endpoint`: API endpoint URL
- `config.method`: HTTP method (GET, POST, PUT, DELETE)
- `config.headers`: Request headers
- `config.body`: Request body data

**Example:**

```json
{
  "invoke": [{
    "type": "http",
    "config": {
      "endpoint": "/api/users",
      "method": "POST",
      "headers": { "Content-Type": "application/json" },
      "body": {
        "name": "{{context.user.name}}",
        "email": "{{context.user.email}}"
      }
    },
    "assignTo": "user.created"
  }]
}
```

### Types

#### `FlowConfig`

Complete flow definition interface.

```typescript
interface FlowConfig {
  id: string;                    // Unique flow identifier
  name: string;                  // Flow name
  version?: string;              // Flow version
  description?: string;          // Flow description
  initialStep: string;           // Initial step ID
  context: Record<string, unknown>; // Initial context data
  actions?: Record<string, ActionConfig>; // System actions
  guards?: Record<string, GuardConfig>;   // Navigation conditions
  actors?: Record<string, ActorConfig>;  // Async operations
  plugins?: Record<string, PluginConfig>; // Plugin configurations
  steps: Step[];                // Flow steps
}
```

#### `Step`

Individual step definition.

```typescript
interface Step {
  id: string;                   // Step identifier
  name: string;                 // Step name
  view: ViewConfig;             // UI configuration
  hooks?: {                     // Step hooks
    before?: Hook[];            // Pre-step hooks
    after?: Hook[];             // Post-step hooks
  };
  invoke?: InvokeConfig;        // Async operation
  navigation: Navigation;       // Navigation configuration
}
```

#### `ViewConfig`

UI component configuration.

```typescript
interface ViewConfig {
  type: 'form' | 'display' | 'decision' | 'loading' | 'error' | 'success' | 'federated-module' | 'custom-component';
  title?: string;               // View title
  subtitle?: string;            // View subtitle
  message?: string;             // View message
  template?: string;            // Template string
  fields?: FormField[];         // Form fields (for form type)
  content?: Record<string, unknown>; // Additional content
  actions?: ViewAction[];       // UI actions
  data?: string;                // Data template
  moduleId?: string;            // Module identifier (for federated modules)
  moduleUrl?: string;           // Module URL (for federated modules)
  componentName?: string;       // Component name (for federated modules)
  props?: Record<string, unknown>; // Component props
  fallback?: ViewConfig;        // Fallback view
  componentPath?: string;       // Component path
}
```

#### `FormField`

Form field configuration.

```typescript
interface FormField {
  name: string;                 // Field name
  type: 'text' | 'email' | 'number' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'file' | 'date';
  label: string;                // Field label
  placeholder?: string;         // Placeholder text
  required?: boolean;           // Required field
  min?: number;                 // Minimum value (for number)
  max?: number;                 // Maximum value (for number)
  step?: number;                // Step value (for number)
  rows?: number;                // Rows (for textarea)
  maxLength?: number;           // Maximum length
  accept?: string;              // Accept types (for file)
  maxSize?: string;             // Maximum file size
  options?: Array<{ value: string; label: string }>; // Options (for select/radio)
  validation?: {                // Validation rules
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}
```

#### `Hook`

Hook configuration for step processing.

```typescript
interface Hook {
  id: string;                   // Hook identifier
  type: 'http_call' | 'assign' | 'log' | 'analytics' | 'delay' | 'condition';
  endpoint?: string;             // HTTP endpoint
  method?: string;              // HTTP method
  body?: unknown;               // Request body
  headers?: Record<string, string>; // Request headers
  target?: string;              // Assignment target
  value?: unknown;              // Assignment value
  message?: string;             // Log message
  level?: 'info' | 'warn' | 'error'; // Log level
  event?: string;               // Analytics event
  data?: unknown;               // Analytics data
  duration?: number;            // Delay duration (ms)
  expression?: unknown;         // Condition expression
  onTrue?: Hook[];             // Actions on true condition
  onFalse?: Hook[];            // Actions on false condition
  updateContext?: string;       // Context update path
  onError?: 'fail' | 'ignore';  // Error handling
}
```

#### `Navigation`

Navigation configuration.

```typescript
interface Navigation {
  onNext?: string | NavigationConfig | NavigationConfig[];
  onBack?: string;
  onError?: string;
  onCancel?: string;
  conditions?: ConditionalNavigation[];
}
```

#### `NavigationConfig`

Detailed navigation configuration.

```typescript
interface NavigationConfig {
  target: string;               // Target step
  guard?: string;               // Guard condition
  actions?: string[];           // Actions to execute
}
```

#### `InvokeConfig`

Async operation configuration.

```typescript
interface InvokeConfig {
  id: string;                   // Operation identifier
  src: string;                  // Actor source
  input?: unknown;              // Input data
  onDone?: NavigationConfig;   // Success navigation
  onError?: NavigationConfig;  // Error navigation
}
```

---

## plugin-react

React-specific plugin implementation.

### `FlowComponent`

React component for rendering flows.

#### Signature

```typescript
interface FlowComponentProps {
  flowConfig: FlowConfig;
  plugins?: Record<string, Plugin>;
  onStateChange?: (state: any) => void;
  onError?: (error: Error) => void;
}

function FlowComponent(props: FlowComponentProps): ReactElement;
```

#### Example

```typescript
import { FlowComponent } from 'plugin-react';
import { FlowConfig } from 'core';

const flowConfig: FlowConfig = {
  id: 'my-flow',
  name: 'My Flow',
  initialStep: 'welcome',
  context: {},
  steps: [/* ... */]
};

function App() {
  return (
    <FlowComponent 
      flowConfig={flowConfig}
      onStateChange={(state) => console.log('State changed:', state)}
      onError={(error) => console.error('Flow error:', error)}
    />
  );
}
```

### `useFlow`

React hook for flow state management.

#### Signature

```typescript
function useFlow(flowConfig: FlowConfig): {
  state: StateSnapshot<any>;
  send: (event: any) => void;
  view: ViewConfig | undefined;
  context: any;
  isLoading: boolean;
  error: any;
}
```

#### Example

```typescript
import { useFlow } from 'plugin-react';

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

## plugin-http

HTTP plugin for making API calls.

### `HttpActionPlugin`

Plugin for HTTP actions in flows.

#### Signature

```typescript
class HttpActionPlugin implements Plugin {
  id: string;
  type: 'action';
  version: string;
  
  execute(config: HttpActionConfig, context: any): Promise<any>;
}
```

#### Example

```typescript
import { HttpActionPlugin } from 'plugin-http';

const httpPlugin = new HttpActionPlugin();

// Use in flow configuration
const flowConfig: FlowConfig = {
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

### `HttpActorPlugin`

Plugin for HTTP actors in flows.

#### Signature

```typescript
class HttpActorPlugin implements Plugin {
  id: string;
  type: 'actor';
  version: string;
  
  execute(config: HttpActorConfig, context: any): Promise<any>;
}
```

---

## plugins

Core plugin system.

### `PluginManager`

Manages plugin registration and execution.

#### Signature

```typescript
class PluginManager {
  register(plugin: Plugin): void;
  execute(pluginId: string, config: any, context: any): Promise<any>;
  getPlugin(pluginId: string): Plugin | undefined;
  getPluginsByType(type: string): Plugin[];
  hasPlugin(pluginId: string): boolean;
}
```

#### Example

```typescript
import { PluginManager } from 'plugins';
import { HttpActionPlugin } from 'plugin-http';

const pluginManager = new PluginManager();
pluginManager.register(new HttpActionPlugin());

// Execute plugin
const result = await pluginManager.execute('http-action', config, context);
```

### `PluginRegistry`

Singleton registry for plugins.

#### Signature

```typescript
class PluginRegistry {
  static getInstance(): PluginRegistry;
  register(plugin: Plugin): void;
  get(pluginId: string): Plugin | undefined;
  getAll(): Plugin[];
  clear(): void;
}
```

---

## renderer-core

Core contracts for renderer implementations.

### Types

#### `ViewProps`

Props passed to view components.

```typescript
interface ViewProps {
  flowId: string;      // Flow identifier
  nodeId: string;     // Node identifier
  contextSlice: any; // Flow context data
  send: (event: any) => void; // Event dispatcher
}
```

#### `HostRenderer`

Renderer interface for mounting UI components.

```typescript
interface HostRenderer {
  mount(
    moduleId: string,
    slot: string | undefined,
    props: ViewProps
  ): ViewInstance;
}
```

---

## Utility Functions

### Template Resolution

XFlows supports template expressions using `{{expression}}` syntax.

#### `resolveTemplate(template, context)`

Resolves template expressions in configuration objects.

```typescript
function resolveTemplate(template: string, context: any): any
```

**Example:**

```typescript
const template = 'User: {{context.user.name}}, Email: {{context.user.email}}';
const context = {
  user: {
    name: 'John Doe',
    email: 'john@example.com'
  }
};

const resolved = resolveTemplate(template, context);
// Result: "User: John Doe, Email: john@example.com"
```

### Path Resolution

#### `setByPath(object, path, value)`

Sets a nested property value using dot notation.

```typescript
function setByPath(object: any, path: string, value: any): any
```

**Example:**

```typescript
const ctx = { user: { profile: {} } };
const updated = setByPath(ctx, 'user.profile.name', 'John');
// Result: { user: { profile: { name: 'John' } } }
```

#### `getByPath(object, path)`

Gets a nested property value using dot notation.

```typescript
function getByPath(object: any, path: string): any
```

**Example:**

```typescript
const ctx = { user: { profile: { name: 'John' } } };
const name = getByPath(ctx, 'user.profile.name');
// Result: "John"
```

### Error Handling

#### Validation Errors

When flows fail validation, detailed error information is provided:

```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

#### Flow Errors

Flow execution errors follow XState conventions:

```typescript
interface FlowError {
  error: Error;
  data?: any;
  type: string;
}
```

---

## Troubleshooting

### Common Issues

1. **Flow Validation Errors**
   ```
   Error: Invalid step configuration
   ```
   **Solution**: Check step configuration matches FlowConfig interface

2. **Plugin Resolution Errors**
   ```
   Error: Unknown plugin: undefined-plugin
   ```
   **Solution**: Ensure plugin is registered in PluginManager

3. **Template Resolution Errors**
   ```
   Error: Cannot resolve template expression
   ```
   **Solution**: Check template syntax and context data availability

4. **Navigation Errors**
   ```
   Error: Target step not found
   ```
   **Solution**: Ensure target step exists in flow configuration

### Debug Mode

Enable debug mode for development:

```typescript
const orchestrator = new FlowOrchestrator({
  debug: true, // Enable debug logging
  logLevel: 'info'
});
```

---

**For more examples and advanced patterns, see our [Examples & Tutorials](./examples/) documentation.**
