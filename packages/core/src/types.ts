// ============================================================================
// XFLOWS CORE TYPES
// ============================================================================

export interface FlowConfig {
  id: string;
  name: string;
  version?: string;
  description?: string;
  initialStep: string;
  context: Record<string, unknown>;
  actions?: Record<string, ActionConfig>;
  guards?: Record<string, GuardConfig>;
  actors?: Record<string, ActorConfig>;
  plugins?: Record<string, PluginConfig>;
  steps: Step[];
}

export interface Step {
  id: string;
  name: string;
  view: ViewConfig;
  hooks?: {
    before?: Hook[];
    after?: Hook[];
  };
  invoke?: InvokeConfig;
  navigation: Navigation;
}

export interface ViewConfig {
  type: 'form' | 'display' | 'decision' | 'loading' | 'error' | 'success' | 'federated-module' | 'custom-component';
  title?: string;
  subtitle?: string;
  message?: string;
  template?: string;
  fields?: FormField[];
  content?: Record<string, unknown>;
  actions?: ViewAction[];
  data?: string;
  moduleId?: string;
  moduleUrl?: string;
  componentName?: string;
  props?: Record<string, unknown>;
  fallback?: ViewConfig;
  componentPath?: string;
}

export interface FormField {
  name: string;
  type: 'text' | 'email' | 'number' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'file' | 'date';
  label: string;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  maxLength?: number;
  accept?: string;
  maxSize?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface ViewAction {
  type: 'submit' | 'button';
  label: string;
  event: string;
}

export interface Hook {
  id: string;
  type: 'http_call' | 'assign' | 'log' | 'analytics' | 'delay' | 'condition';
  endpoint?: string;
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  target?: string;
  value?: unknown;
  message?: string;
  level?: 'info' | 'warn' | 'error';
  event?: string;
  data?: unknown;
  duration?: number;
  expression?: unknown;
  onTrue?: Hook[];
  onFalse?: Hook[];
  updateContext?: string;
  onError?: 'fail' | 'ignore';
}

export interface Navigation {
  onNext?: string | NavigationConfig | NavigationConfig[];
  onBack?: string;
  onError?: string;
  onCancel?: string;
  [key: string]: unknown;
}

export interface NavigationConfig {
  target: string;
  guard?: string;
  actions?: string | string[];
}

export interface InvokeConfig {
  id: string;
  src: string;
  input: unknown;
  onDone?: NavigationConfig;
  onError?: NavigationConfig;
}

export interface ActionConfig {
  type: 'assign' | 'log' | 'analytics';
  target?: string;
  value?: unknown;
  message?: string;
  event?: string;
  data?: unknown;
}

export interface GuardConfig {
  type: 'jsonLogic' | 'simple';
  expression?: unknown;
  condition?: string;
}

export interface ActorConfig {
  type: 'fromPromise';
  endpoint?: string;
  method?: string;
  body?: unknown;
}

export interface PluginConfig {
  type: 'actor' | 'action';
  config: unknown;
}

export interface TemplateData {
  context: Record<string, unknown>;
  event: Record<string, unknown>;
  step: Record<string, unknown>;
}
