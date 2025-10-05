# @xflows/plugins

Plugin system for extending XFlows functionality.

## Features

- **Plugin Registry**: Manage plugin registration and lifecycle
- **Plugin Manager**: Load, unload, and manage plugins
- **Base Classes**: Abstract base classes for different plugin types
- **Type Safety**: Full TypeScript support for plugin development

## Plugin Types

- **Actor Plugins**: Asynchronous operations
- **Action Plugins**: Side effects and context updates
- **Guard Plugins**: Conditional logic
- **UI Component Plugins**: Custom UI components
- **Tool Plugins**: Utility functions

## Usage

```typescript
import { DefaultPluginManager, ActorPluginImpl } from '@xflows/plugins';

class MyActorPlugin extends ActorPluginImpl {
  async createActor(config) {
    // Implementation
  }
}

const manager = new DefaultPluginManager();
await manager.loadPlugin({
  id: 'my-plugin',
  name: 'My Plugin',
  version: '1.0.0',
  type: 'actor'
});
```
