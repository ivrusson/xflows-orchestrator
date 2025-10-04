# Host Orchestrator with XState v5 (Declarative Flow JSON)

This package shows a pragmatic architecture for a **Host** that orchestrates multiple **Module Federation** microfrontends (MFEs) using **XState v5**, driven by **declarative JSON flows**.

## What you get
- A **JSON contract** (`examples/flow.json`) to define views, transitions, services, and data bindings.
- A **machine factory** (`src/core/createFlowMachine.ts`) that converts flow JSON into an XState v5 machine.
- A **services registry** pattern (`src/core/registry.ts`) to plug HTTP or compute services.
- A minimal **Host runtime** (`src/host/index.ts`, `src/host/lifecycle.ts`) with lifecycle hooks.
- Utilities for **template resolving** and **assign-by-path**.
- **Documentation** for lifecycle, schema, and diagrams (Mermaid).

> This is not a full framework; it's a reference implementation you can paste into your monorepo and extend.

## Quick Start (Node + TS)
```bash
# install deps
pnpm add xstate @xstate/react zod
# or
npm i xstate @xstate/react zod
```

Run the example (node/ts-node):
```bash
# pseudo-run (adapt to your tooling)
ts-node examples/runExample.ts
```

## How it works
1. The Host loads and validates a `flow.json` (see `docs/flow-schema.md`).
2. The factory builds an **XState machine** with:
   - `entry/exit` lifecycle, `meta.view` with the MFE to mount
   - `invoke` for effects (HTTP/compute) and `assign` for results
   - `on` transitions that map **domain events** to navigation/effects
3. The Host observes the machine state, **mounts the MFE** indicated by `meta.view`, passes a **context slice** + a `send(event)` bridge, and listens to events emitted by the MFE.

## Contract Host ↔ MFE (minimal)
**Props to MFE**:
- `flowId`, `nodeId`, `contextSlice`, `send(event)`, `i18n`, `theme`, `featureFlags`

**Events from MFE**:
- Navigation: `NEXT`, `BACK`
- Domain: `FORM.SUBMIT`, `COVERAGE.CHANGE`, etc.

See `examples/mfe-dummy.ts` for a tiny mock.

## Diagrams
- `docs/diagrams/host-flow.mmd`
- `docs/diagrams/lifecycle.mmd`

Open them in any Mermaid-compatible viewer (or GitHub).

## Extend
- Add guards registry, advanced template functions, caching/retry/abort to `services/http.ts`
- Persist snapshots to storage/BFF
- Build MF wrappers for Module Federation remotes
