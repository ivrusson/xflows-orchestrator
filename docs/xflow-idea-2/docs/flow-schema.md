# Flow JSON Schema (Concept)

This document explains the **shape** of a flow JSON. A formal `JSON Schema` could be derived from this; here we show the intent and constraints in prose + examples.

## Top-level
```jsonc
{
  "id": "salesFlow",
  "initial": "quote.start",
  "context": { /* arbitrary bag of data */ },
  "states": { /* state nodes (hierarchical allowed) */ }
}
```

- `id`: unique flow identifier.
- `initial`: path to the initial state (can be nested, e.g. `"parent.child"`).
- `context`: initial machine context (serializable).
- `states`: object tree of state nodes.

## State Node
```jsonc
{
  "view": { "moduleId": "mfe-coverage", "slot": "main" },
  "bind": [
    { "from": "query.token", "to": "session.token" }
  ],
  "invoke": [
    {
      "id": "getCoverages",
      "type": "http",
      "config": { "url": "/bff/coverages?productId={quote.basic.productId}" },
      "assignTo": "quote.coverages"
    }
  ],
  "on": {
    "COVERAGE.CHANGE": {
      "actions": [
        { "type": "assign", "to": "quote.selection", "fromEventPath": "payload" }
      ]
    },
    "NEXT": "summary",
    "BACK": "#salesFlow.quote.start"
  },
  "states": { /* nested states */ },
  "initial": "start",
  "type": "final" // optional
}
```

### Semantics
- `view`: optional. If present, the Host should mount the given MFE on `entry` and unmount on `exit`. Also put it in `state.meta.view`.
- `bind`: optional array. Declarative inputs mapping from sources (`query`, `storage`, `context`) into the machine `context`.
- `invoke`: optional array of effects; each must reference a `type` existing in the Services Registry (e.g. `"http"`). `assignTo` is a context path to store the result.
- `on`: transition table. Values can be:
  - `string` target path
  - object `{ target?: string; actions?: ActionSpec[] }`
- `type: "final"`: leaf final state.
- `states` + `initial`: standard hierarchical states.

### ActionSpec minimal
```jsonc
{ "type": "assign", "to": "path.in.context", "fromEventPath": "payload.field" }
{ "type": "track", "event": "CoverageChanged", "props": { "source": "coverage" } }
```

### Bind Source Grammar (suggested)
- `"from": "query.token"` → read from URL query
- `"from": "storage.sessionKey"` → read from sessionStorage/localStorage
- `"from": "context.path.to.value"` → read from current context
- Templates in strings supported: `"{quote.basic.productId}"`

> See `src/core/utils/templateResolver.ts` for template rules.
