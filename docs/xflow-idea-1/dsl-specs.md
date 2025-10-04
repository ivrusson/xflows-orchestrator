# @repo/schemas

Shared JSON Schemas and TypeScript types for NN Sales Funnel DSL and data models.

## 📦 Contents

```
src/
├── flow-dsl-v2.schema.json   # Flow DSL v2.0 JSON Schema
├── flows/                      # Flow definitions
│   ├── 7006-updated.json      # Vida - Flujo Completo
│   └── ...
└── types/                      # TypeScript type definitions
    └── flow.types.ts          # Generated from schema
```

## 🎯 Flow DSL v2.0 Schema

### Features

- **XState Integration**: Declarative flow orchestration with state machine
- **json-logic Guards**: Powerful validation with json-logic expressions
- **Interstep Actions**: HTTP calls, SignalR events, analytics tracking
- **Dynamic Navigation**: Conditional routing based on context
- **Error Handling**: Severity-based error management (warn/block/fatal)
- **Rollback Support**: Compensating transactions for failed operations
- **Module Federation**: Remote MFE loading via viewId

### Schema Location

```
$schema: "https://nn.com/schemas/flow-dsl-v2.json"
```

**File**: `src/flow-dsl-v2.schema.json`

## 📝 Usage

### 1. IDE Validation

Add schema reference to your flow JSON:

```json
{
  "$schema": "https://nn.com/schemas/flow-dsl-v2.json",
  "id": "7006",
  "name": "Vida - Flujo Completo",
  "version": "2.0.0",
  "steps": [...]
}
```

**VS Code** will automatically validate and provide autocomplete.

### 2. Programmatic Validation

```typescript
import Ajv from 'ajv';
import flowSchema from '@repo/schemas/flow-dsl-v2.schema.json';
import flowDefinition from '@repo/schemas/flows/7006-updated.json';

const ajv = new Ajv();
const validate = ajv.compile(flowSchema);

if (!validate(flowDefinition)) {
  console.error('Validation errors:', validate.errors);
}
```

### 3. TypeScript Types

```typescript
import type { FlowDefinition, Step, Guard, HttpAction } from '@repo/schemas';

const flow: FlowDefinition = {
  id: '7006',
  name: 'Vida - Flujo Completo',
  version: '2.0.0',
  steps: [
    {
      id: 'quickquote',
      title: 'Calculadora',
      type: 'mfe',
      viewId: '7006-quickquote',
      // ... TypeScript autocomplete here!
    }
  ]
};
```

## 🔑 Key Concepts

### Guards (json-logic)

Validation rules executed by XState guards:

```json
{
  "guards": [
    {
      "id": "hasDossierId",
      "condition": {
        "!!": [{"var": "context.dossierId"}]
      },
      "errorPage": "/error/session-expired"
    }
  ]
}
```

**Available variables in conditions**:
- `context.*` - State machine context (dossierId, riskScore, etc.)
- `session.*` - User session data (form data by step)
- `results.*` - Action results (namespace: `results[stepId][actionId]`)
- `stepData.*` - Current step data
- `env.*` - Environment variables (locale, channel, etc.)
- `history.length` - Navigation history

### Interstep Actions

Actions executed in `beforeNext` pipeline:

```json
{
  "interstep": {
    "beforeNext": [
      {
        "id": "saveToDossier",
        "type": "http",
        "method": "PUT",
        "url": "/api/dossier/{{context.dossierId}}/steps/quickquote",
        "body": "{{session.quickquote}}",
        "mapResult": {
          "results.quickquote.saveToDossier.status": "$.status",
          "context.savedAt": "$.timestamp"
        },
        "severity": "block"
      }
    ]
  }
}
```

**Action Types**:
- `http` - HTTP API call
- `signalr` - Real-time event emission
- `analytics` - Event tracking (future)
- `storage` - Local storage operations (future)

### Dynamic Navigation

Conditional routing with json-logic:

```json
{
  "navigation": {
    "next": {
      "default": "personal-data",
      "conditions": [
        {
          "if": {
            ">": [{"var": "context.riskScore"}, 80]
          },
          "to": "error-step",
          "effects": [
            {
              "assign": {
                "session.errorReason": "high-risk"
              }
            }
          ]
        }
      ]
    }
  }
}
```

### Error Severities

| Severity | Behavior | Navigation | Continue Pipeline |
|----------|----------|------------|-------------------|
| `warn` | Log only | No | Yes |
| `block` | Abort pipeline | Stay or custom | No |
| `fatal` | Abort flow | Error step | No |

### mapResult (Result Storage)

Store HTTP response data in context/results:

```json
{
  "mapResult": {
    "context.applicantId": "$.applicantId",
    "results.personalData.createApplicant.id": "$.applicantId",
    "results.personalData.createApplicant.createdAt": "$.createdAt"
  }
}
```

**JSONPath expressions**:
- `$.field` - Root-level field
- `$.data.nested.field` - Nested field
- Simple key - Direct property access

### Rollback Actions

Compensating transactions for failed operations:

```json
{
  "id": "createApplicant",
  "type": "http",
  "method": "POST",
  "url": "/api/applicants/create",
  "severity": "fatal",
  "rollback": [
    {
      "type": "http",
      "method": "DELETE",
      "url": "/api/dossier/{{context.dossierId}}/steps/personal-data"
    }
  ]
}
```

## 🧪 Validation Rules

### Step ID
- Pattern: `^[a-z0-9-]+$` (kebab-case)
- Example: `quickquote`, `personal-data`

### View ID
- Pattern: `^[0-9]{4,}-[a-z0-9-]+$`
- Format: `{productId}-{stepId}`
- Example: `7006-quickquote`

### API URLs
- Must start with `/api/`
- No absolute URLs (http://, https://)
- Example: `/api/dossier/123/update`

### Error Pages
- Pattern: `^/error/[a-z0-9-]+$`
- Example: `/error/session-expired`

### Remote Module
- Name: MFE application name (`mfe_quotation`, `mfe_quick_quote`)
- Module: Pascal case view component (`./QuickQuoteView`)

## 📚 Examples

### Minimal Flow

```json
{
  "$schema": "https://nn.com/schemas/flow-dsl-v2.json",
  "id": "7005",
  "name": "Quick Quote",
  "version": "1.0.0",
  "steps": [
    {
      "id": "quote",
      "title": "Cotización",
      "type": "mfe",
      "viewId": "7005-quote",
      "remote": {
        "name": "mfe_quick_quote",
        "module": "./QuoteView"
      },
      "navigation": {
        "next": null,
        "back": null,
        "final": true
      }
    }
  ]
}
```

### Complex Flow with Guards and Actions

See `flows/7006-updated.json` for a complete example with:
- ✅ 5 steps with MFE modules
- ✅ json-logic guards (hasDossierId, isTotalPercentage100, etc.)
- ✅ 12+ interstep actions (HTTP calls, SignalR events)
- ✅ Dynamic navigation (underwriting → error-step if riskScore > 80)
- ✅ Result storage with mapResult
- ✅ Rollback support
- ✅ Error handling with 9 error pages

## 🔧 Development

### Build Package

```bash
npm run build
```

### Dev Package (Module Federation)

```bash
npm run mf-dev
```

### Generate TypeScript Types (Future)

```bash
npm run generate-types
```

Uses `json-schema-to-typescript` to generate types from schema.

### Validate All Flows (Future)

```bash
npm run validate-flows
```

Validates all JSON files in `src/flows/` against the schema.

### Add New Flow

1. Create `src/flows/{productId}.json`
2. Add schema reference: `"$schema": "https://nn.com/schemas/flow-dsl-v2.json"`
3. Run validation: `npm run validate-flows`
4. Test in host: Import and use with `useFlowMachine(flowDef, processId)`

## 📖 Related Documentation

- **[Flow DSL Implementation](../../../docs/flow-interstep-actions.md)** - Complete specification
- **[XState Integration](../../../docs/xstate-state-machine.md)** - State machine architecture
- **[Flow Events Reference](../../../docs/flow-events-reference.md)** - Event system
- **[json-logic Documentation](https://jsonlogic.com/)** - Condition syntax

## 🚀 Migration Guide

### From v1.0 to v2.0

| v1.0 | v2.0 | Notes |
|------|------|-------|
| `next: "stepId"` | `navigation.next: "stepId"` | Nested in navigation object |
| N/A | `guards: [{condition: {...}}]` | New: json-logic guards |
| N/A | `interstep.beforeNext: [...]` | New: Action pipeline |
| String conditions | json-logic objects | Use json-logic instead of strings |
| `onSuccess.action` | `onSuccess.navigate` | Renamed for clarity |

**Breaking Changes**:
- `next` is now inside `navigation` object
- Guards must use json-logic (no string expressions)
- Actions require explicit `type` field

**Backward Compatibility**: Legacy flows still work via adapter in `useFlowMachine`.

---

**Version**: 2.0.0  
**Last Updated**: 4 de octubre de 2025  
**Maintainers**: Equipo Arquitectura DSL

