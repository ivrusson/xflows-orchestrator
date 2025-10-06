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
  ToolPluginConfig,
  PluginType
} from '../types';

export abstract class BasePluginImpl implements BasePlugin {
  constructor(
    public id: string,
    public name: string,
    public version: string,
    public type: PluginType
  ) {}

  abstract initialize(): Promise<void>;
  abstract destroy(): Promise<void>;
}

export abstract class ActorPluginImpl extends BasePluginImpl implements ActorPlugin {
  public readonly type = 'actor' as const;
  
  constructor(id: string, name: string, version: string) {
    super(id, name, version, 'actor');
  }

  abstract createActor(config: ActorPluginConfig): Promise<unknown>;
}

export abstract class ActionPluginImpl extends BasePluginImpl implements ActionPlugin {
  public readonly type = 'action' as const;
  
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
  public readonly type = 'guard' as const;
  
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
  public readonly type = 'ui-component' as const;
  
  constructor(id: string, name: string, version: string) {
    super(id, name, version, 'ui-component');
  }

  abstract render(
    config: UIComponentPluginConfig, 
    props: Record<string, unknown>
  ): Promise<unknown>;
}

export abstract class ToolPluginImpl extends BasePluginImpl implements ToolPlugin {
  public readonly type = 'tool' as const;
  
  constructor(id: string, name: string, version: string) {
    super(id, name, version, 'tool');
  }

  abstract execute(
    config: ToolPluginConfig, 
    input: unknown
  ): Promise<unknown>;
}
