/**
 * Base Plugin Classes
 * Abstract base classes for different plugin types
 */

import type { 
  BasePlugin, 
  ActorPlugin, 
  ActionPlugin, 
  GuardPlugin, 
  UIComponentPlugin, 
  ToolPlugin,
  ActorPluginConfig,
  ActionPluginConfig,
  GuardPluginConfig,
  UIComponentPluginConfig,
  ToolPluginConfig
} from '../types';

export abstract class BasePluginImpl implements BasePlugin {
  constructor(
    public id: string,
    public name: string,
    public version: string,
    public type: string
  ) {}

  abstract initialize(): Promise<void>;
  abstract destroy(): Promise<void>;
}

export abstract class ActorPluginImpl extends BasePluginImpl implements ActorPlugin {
  constructor(id: string, name: string, version: string) {
    super(id, name, version, 'actor');
  }

  abstract createActor(config: ActorPluginConfig): Promise<unknown>;
}

export abstract class ActionPluginImpl extends BasePluginImpl implements ActionPlugin {
  constructor(id: string, name: string, version: string) {
    super(id, name, version, 'action');
  }

  abstract execute(
    config: ActionPluginConfig, 
    context: Record<string, unknown>, 
    event: Record<string, unknown>
  ): Promise<unknown>;
}

export abstract class GuardPluginImpl extends BasePluginImpl implements GuardPlugin {
  constructor(id: string, name: string, version: string) {
    super(id, name, version, 'guard');
  }

  abstract evaluate(
    config: GuardPluginConfig, 
    context: Record<string, unknown>, 
    event: Record<string, unknown>
  ): Promise<boolean>;
}

export abstract class UIComponentPluginImpl extends BasePluginImpl implements UIComponentPlugin {
  constructor(id: string, name: string, version: string) {
    super(id, name, version, 'ui-component');
  }

  abstract render(
    config: UIComponentPluginConfig, 
    props: Record<string, unknown>
  ): Promise<unknown>;
}

export abstract class ToolPluginImpl extends BasePluginImpl implements ToolPlugin {
  constructor(id: string, name: string, version: string) {
    super(id, name, version, 'tool');
  }

  abstract execute(
    config: ToolPluginConfig, 
    input: unknown
  ): Promise<unknown>;
}
