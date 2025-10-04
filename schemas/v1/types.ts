// ============================================================================
// JSON SCHEMAS v1 - Core Types and Base Definitions
// ============================================================================

/**
 * 📋 Base Schema Configuration Interface
 */
export interface SchemaConfig {
  version: string;
  description: string;
  author: string;
  lastUpdated: string;
  namespace?: string;
  dependencies?: Record<string, string>;
}

/**
 * 🎯 Plugin Registry Schema Types
 */
export interface PluginRegistrySchema extends SchemaConfig {
  plugins: {
    actors: Record<string, AnySchema>;
    ui: Record<string, AnySchema>;
    tools: Record<string, AnySchema>;
    guards: Record<string, AnySchema>;
    actions: Record<string, AnySchema>;
  };
  metadata: Record<string, PluginMetadataSchema>;
}

export interface PluginMetadataSchema extends SchemaConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: 'actor' | 'ui' | 'tool' | 'guard' | 'action';
  tags: string[];
  configSchema?: AnySchema;
  examples?: PluginExampleSchema[];
}

export interface PluginExampleSchema {
  title: string;
  description: string;
  code: string | Record<string, unknown>;
  context?: Record<string, unknown>;
}

/**
 * 🔄 Flow Configuration Schema Types
 */
export interface FlowConfigSchema extends SchemaConfig {
  id: string;
  initial: string;
  context: Record<string, unknown>;
  states: Record<string, StateConfigSchema>;
  plugins?: PluginRegistrySchema;
}

export interface StateConfigSchema extends SchemaConfig {
  type?: 'final' | 'compound' | 'atomic';
  meta?: {
    view?: {
      moduleId: string;
      component?: string;
      slot?: string;
      plugin?: string;
      pluginConfig?: Record<string, unknown>;
    };
    description?: string;
    icon?: string;
  };
  pluginInvoke?: InvokeConfigSchema[];
  pluginUI?: UIConfigSchema;
  pluginActions?: ActionConfigSchema[];
  on?: Record<string, TransitionSchema>;
}

export interface InvokeConfigSchema {
  id: string;
  pluginId: string;
  pluginType: 'actor' | 'tool';
  config: Record<string, unknown>;
  timeout?: number;
  retryPolicy?: {
    attempts: number;
    retryDelay: number;
    backoff?: 'linear' | 'exponential';
  };
}

export interface UIConfigSchema {
  pluginId: string;
  config: Record<string, unknown>;
  slot?: string;
  responsive?: boolean;
}

export interface ActionConfigSchema {
  actionId: string;
  pluginId: string;
  config: Record<string, unknown>;
  condition?: Record<string, unknown>;
}

export interface TransitionSchema {
  target?: string;
  actions?: string | string[];
  guard?: string | Record<string, unknown>;
}

/**
 * 📊 Validation Schema Types
 */
export interface ValidationSchema extends SchemaConfig {
  rules: ValidationRuleSchema[];
  schemas: {
    zod?: Record<string, unknown>;
    ajv?: Record<string, unknown>;
  };
}

export interface ValidationRuleSchema {
  field: string;
  rules: {
    type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    enum?: string[];
    format?: string;
  };
  customValidation?: Record<string, unknown>;
}

/**
 * 🧠 JSON Logic Schema Types
 */
export interface JsonLogicSchema extends SchemaConfig {
  expressions: Record<string, LogicExpressionSchema>;
  operators?: Record<string, OperatorSchema>;
  variables?: Record<string, VariableSchema>;
}

export interface LogicExpressionSchema {
  id: string;
  name: string;
  description: string;
  expression: Record<string, unknown>;
  context: string[];
  examples?: LogicExampleSchema[];
}

export interface OperatorSchema {
  name: string;
  description: string [];
  category: 'comparison' | 'logical' | 'arithmetic' | 'string' | 'array' | 'custom';
  parameters: {
    min: number;
    max?: number;
    types: string[];
  };
  returnType: string;
  examples: OperatorExampleSchema[];
}

export interface VariableSchema {
  name: string;
  type: string;
  description?: string;
  scope: 'global' | 'local' | 'context';
  defaultValue?: unknown;
}

export interface LogicExampleSchema {
  title: string;
  description: string;
  expression: Record<string, unknown>;
  context: Record<string, unknown>;
  expectedResult: boolean | number | string;
}

export interface OperatorExampleSchema {
  title: string;
  expression: Record<string, unknown>;
  expectedResult: unknown;
}

/**
 * 🎨 Template Schema Types
 */
export interface TemplateSchema extends SchemaConfig {
  templates: Record<string, CustomTemplateSchema>;
  filters: Record<string, FilterSchema>;
  functions: Record<string, FunctionSchema>;
}

export interface CustomTemplateSchema {
  id: string;
  name: string;
  description: string;
  type: 'ejs' | 'handlebars' | 'mustache' | 'custom';
  content: string;
  variables: string[];
  outputs: TemplateOutputSchema[];
}

export interface FilterSchema {
  name: string;
  description: string;
  parameters: string[];
  function: string;
  category?: string;
}

export interface FunctionSchema {
  name: string;
  description: string;
  parameters: FunctionParameterSchema[];
  returnType: string;
  implementation?: string;
}

export interface TemplateOutputSchema {
  format: 'html' | 'text' | 'json' | 'xml';
  contentType: string;
  examples?: string[];
}

export interface FunctionParameterSchema {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  defaultValue?: unknown;
}

/**
 * 💾 Utility Schema Types
 */
export interface AnySchema {
  $schema?: string;
  type?: string | string[];
  properties?: Record<string, AnySchema>;
  required?: string[];
  enum?: unknown[];
  const?: unknown;
  default?: unknown;
  description?: string;
  examples?: unknown[];
  format?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  items?: AnySchema;
  additionalProperties?: boolean | AnySchema;
  patternProperties?: Record<string, AnySchema>;
  dependencies?: Record<string, unknown>;
  if?: AnySchema;
  then?: AnySchema;
  else?: AnySchema;
  oneOf?: AnySchema[];
  anyOf?: AnySchema[];
  allOf?: AnySchema[];
  not?: AnySchema;
  definitions?: Record<string, AnySchema>;
  $ref?: string;
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  SchemaConfig,
  PluginRegistrySchema,
  PluginMetadataSchema,
  PluginExampleSchema,
  FlowConfigSchema,
  StateConfigSchema,
  InvokeConfigSchema,
  UIConfigSchema,
  ActionConfigSchema,
  TransitionSchema,
  ValidationSchema,
  ValidationRuleSchema,
  JsonLogicSchema,
  LogicExpressionSchema,
  OperatorSchema,
  VariableSchema,
  LogicExampleSchema,
  OperatorExampleSchema,
  TemplateSchema,
  CustomTemplateSchema,
  FilterSchema,
  FunctionSchema,
  TemplateOutputSchema,
  FunctionParameterSchema,
  AnySchema
};
