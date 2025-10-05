# @xflows/core

Core framework for XFlows flow orchestrator and utilities.

## Features

- **Flow Orchestrator**: Orchestrates complex flow processes from JSON definitions to XState machines
- **Defensive Validation**: Comprehensive input validation with detailed error reporting
- **Schema Validation**: JSON Schema validation using Ajv
- **Runtime Type Checking**: Runtime type validation with custom type definitions
- **Error Handling**: Robust error handling with custom error types and logging
- **Template Parser**: Dynamic template evaluation with `{{variable}}` syntax
- **JSON Logic Evaluator**: Complex condition evaluation
- **HTTP Client**: HTTP request handling for hooks and actors
- **Hook Processor**: Before/after action processing

## Usage

```typescript
import { FlowOrchestrator, FlowConfig } from '@xflows/core';

const flowConfig: FlowConfig = {
  id: 'my-flow',
  name: 'My Flow',
  initialStep: 'welcome',
  context: { /* initial context */ },
  steps: [ /* flow steps */ ]
};

const orchestrator = new FlowOrchestrator();
const machine = orchestrator.orchestrate(flowConfig);
```

## Architecture

```
src/
├── types.ts                    # Core types
├── engine/
│   └── flow-orchestrator.ts    # Main orchestrator with validation
├── parser/
│   └── template-parser.ts      # Template parsing
├── validation/
│   ├── schema-validator.ts      # JSON Schema validation
│   └── runtime-type-validator.ts # Runtime type checking
└── utils/
    ├── json-logic-evaluator.ts # JSON Logic evaluation
    ├── http-client.ts          # HTTP client
    └── hook-processor.ts       # Hook processing
```

## Error Handling

The FlowOrchestrator provides comprehensive error handling:

```typescript
import { FlowOrchestrator, ValidationError, ConfigurationError } from '@xflows/core';

try {
  const orchestrator = new FlowOrchestrator();
  const machine = orchestrator.orchestrate(flowConfig);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation failed:', error.message);
    console.error('Context:', error.context);
  } else if (error instanceof ConfigurationError) {
    console.error('Configuration error:', error.message);
  }
}
```

## Validation

The core provides multiple validation layers:

```typescript
import { schemaValidator, runtimeTypeValidator } from '@xflows/core';

// JSON Schema validation
const schemaResult = schemaValidator.validateFlowConfig(data);

// Runtime type validation
const typeResult = runtimeTypeValidator.validateFlowConfig(data);
```