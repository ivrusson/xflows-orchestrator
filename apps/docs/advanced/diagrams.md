# 📊 XFlows Visual Diagrams

This section contains all visual diagrams of the state machine and its flows.

---

## 📚 Available Diagrams

### Core Diagrams

- **[State Machine Overview](#state-machine-overview)** ⭐
- **[Action Pipeline Flow](#action-pipeline-flow)**
- **[Lifecycle Hooks](#lifecycle-hooks)**
- **[Dynamic Transitions](#dynamic-transitions)**
- **[Error Handling](#error-handling)**

---

## State Machine Overview

Visual representation of the core XFlows state machine with all states and transitions.

```mermaid
stateDiagram-v2
    [*] --> idle
    idle --> loading: INIT
    loading --> active: success
    loading --> error: failure
    active --> navigating: NEXT
    navigating --> active: success
    navigating --> error: failure
    error --> active: RETRY
    active --> completed: FINISH
    completed --> [*]
```

### State Descriptions

| State | Description | Actions |
|-------|-------------|---------|
| `idle` | Initial state, waiting for flow initialization | Initialize context |
| `loading` | Loading flow definition and dependencies | Load DSL, validate schema |
| `active` | Flow is running, user can interact | Render UI, handle events |
| `navigating` | Executing beforeNext pipeline | Run actions, resolve transitions |
| `error` | Error state with recovery options | Show error UI, handle retry |
| `completed` | Flow finished successfully | Cleanup, final actions |

---

## Action Pipeline Flow

Detailed flow of action execution in the `beforeNext` pipeline.

```mermaid
flowchart TD
    Start([Step Complete]) --> Load[Load Step Definition]
    Load --> HasActions{Has beforeNext?}
    
    HasActions -->|No| Resolve[Resolve Next Step]
    HasActions -->|Yes| Pipeline[Execute Action Pipeline]
    
    Pipeline --> Action[Load Action Definition]
    Action --> Cache{Check Cache}
    Cache -->|Hit| UseCache[Use Cached Result]
    Cache -->|Miss| Execute[Execute Action]
    
    Execute --> HTTP{HTTP Action?}
    HTTP -->|Yes| MakeRequest[Make HTTP Request]
    HTTP -->|No| CustomAction[Execute Custom Action]
    
    MakeRequest --> Retry{Retry Needed?}
    Retry -->|Yes| Wait[Wait Backoff]
    Wait --> MakeRequest
    Retry -->|No| ProcessResult[Process Result]
    
    CustomAction --> ProcessResult
    UseCache --> ProcessResult
    ProcessResult --> MapResult[Map Result to Context]
    MapResult --> NextAction{More Actions?}
    
    NextAction -->|Yes| Action
    NextAction -->|No| Resolve
    
    Resolve --> Conditions{Has Conditions?}
    Conditions -->|No| Default[Use Default Target]
    Conditions -->|Yes| EvalConditions[Evaluate Conditions]
    
    EvalConditions --> Match{Any Match?}
    Match -->|Yes| ApplyEffects[Apply Effects]
    Match -->|No| Default
    
    ApplyEffects --> Navigate[Navigate to Target]
    Default --> Navigate
    Navigate --> End([Navigation Complete])
```

### Pipeline Components

| Component | Purpose | Configuration |
|-----------|---------|---------------|
| **Action Loader** | Load action definitions | Global actions or inline |
| **Cache Layer** | Avoid redundant executions | `cacheTtlMs` |
| **HTTP Client** | Make API calls | Method, URL, headers, body |
| **Retry Logic** | Handle transient failures | `retry.max`, `retry.backoffMs` |
| **Result Mapper** | Update context | `mapResult` object |
| **Condition Evaluator** | Dynamic transitions | JSON Logic expressions |

---

## Lifecycle Hooks

Visual representation of the lifecycle hook execution order.

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant Host
    participant Hooks
    participant Actions
    participant API

    User->>UI: Submit Form
    UI->>Host: onFinish(data)
    
    Note over Host: lifecycle.pre
    Host->>Hooks: Execute pre hooks
    Hooks->>API: Track step start
    API-->>Hooks: Success
    Hooks-->>Host: Complete
    
    Note over Host: beforeNext pipeline
    Host->>Actions: Execute beforeNext actions
    Actions->>API: Verify data
    API-->>Actions: Response
    Actions-->>Host: Update context
    
    Note over Host: lifecycle.post
    Host->>Hooks: Execute post hooks
    Hooks->>API: Additional enrichment
    API-->>Hooks: Success
    Hooks-->>Host: Complete
    
    Note over Host: Resolve next step
    Host->>Host: Evaluate conditions
    Host->>Host: Apply effects
    
    Note over Host: lifecycle.preNavigate
    Host->>Hooks: Execute preNavigate
    Hooks->>API: Audit step complete
    API-->>Hooks: Success
    Hooks-->>Host: Complete
    
    Host->>UI: Navigate to next step
    UI-->>User: Show next step
    
    Note over Host: lifecycle.postNavigate (async)
    Host-->>Hooks: Execute postNavigate
    Hooks->>API: Send notifications
    API-->>Hooks: Success
```

### Hook Types

| Hook | Timing | Purpose | Can Block |
|------|--------|---------|-----------|
| **pre** | Before any processing | Preparation, validation | ✅ |
| **beforeNext** | After pre, before transition | Business logic | ✅ |
| **post** | After actions, before navigation | Additional processing | ✅ |
| **preNavigate** | Before navigation | Final checks, overrides | ✅ |
| **postNavigate** | After navigation | Side effects, analytics | ❌ |

---

## Dynamic Transitions

Flow of dynamic transition resolution with conditions and effects.

```mermaid
flowchart TD
    Start([Transition Request]) --> LoadStep[Load Step Definition]
    LoadStep --> CheckNext{Next Type?}
    
    CheckNext -->|String| DirectTarget[Use Direct Target]
    CheckNext -->|Object| ProcessObject[Process Transition Object]
    
    ProcessObject --> LoadDefault[Load Default Target]
    LoadDefault --> HasConditions{Has Conditions?}
    
    HasConditions -->|No| UseDefault[Use Default Target]
    HasConditions -->|Yes| EvalFirst[Evaluate First Condition]
    
    EvalFirst --> ConditionTrue{Condition True?}
    ConditionTrue -->|Yes| ApplyEffects[Apply Effects]
    ConditionTrue -->|No| NextCondition{More Conditions?}
    
    NextCondition -->|Yes| EvalNext[Evaluate Next Condition]
    EvalNext --> ConditionTrue
    NextCondition -->|No| UseDefault
    
    ApplyEffects --> AssignEffects[Apply Assign Effects]
    AssignEffects --> ClearEffects[Apply Clear Effects]
    ClearEffects --> UseConditionTarget[Use Condition Target]
    
    UseConditionTarget --> Navigate[Navigate to Target]
    UseDefault --> Navigate
    DirectTarget --> Navigate
    
    Navigate --> End([Navigation Complete])
```

### Condition Types

```json
{
  "conditions": [
    {
      "if": { "===": [{ "var": "status" }, "APPROVED"] },
      "to": "approved-step",
      "effects": [
        { "assign": { "context.flag": "approved" } }
      ]
    },
    {
      "if": { "and": [
        { ">=": [{ "var": "score" }, 80] },
        { "!==": [{ "var": "status" }, "PENDING"] }
      ]},
      "to": "high-score-step"
    }
  ]
}
```

---

## Error Handling

Error handling flow with retry logic and fallback mechanisms.

```mermaid
flowchart TD
    Start([Action Execution]) --> Execute[Execute Action]
    Execute --> Success{Success?}
    
    Success -->|Yes| Complete[Action Complete]
    Success -->|No| ErrorType{Error Type?}
    
    ErrorType -->|Timeout| TimeoutHandler[Handle Timeout]
    ErrorType -->|4xx| ClientError[Handle Client Error]
    ErrorType -->|5xx| ServerError[Handle Server Error]
    ErrorType -->|Network| NetworkError[Handle Network Error]
    
    TimeoutHandler --> RetryCheck{Can Retry?}
    ServerError --> RetryCheck
    NetworkError --> RetryCheck
    ClientError --> LogError[Log Business Error]
    
    RetryCheck -->|Yes| Backoff[Calculate Backoff]
    RetryCheck -->|No| FailAction[Fail Action]
    
    Backoff --> Wait[Wait Backoff Time]
    Wait --> Execute
    
    LogError --> ContinueFlow[Continue Flow]
    FailAction --> ErrorPolicy{Error Policy?}
    
    ErrorPolicy -->|Continue| ContinueFlow
    ErrorPolicy -->|Block| BlockFlow[Block Flow]
    ErrorPolicy -->|Retry| RetryFlow[Retry Flow]
    
    ContinueFlow --> Complete
    BlockFlow --> ShowError[Show Error UI]
    RetryFlow --> Execute
    
    Complete --> End([Action Complete])
    ShowError --> End
```

### Error Policies

| Policy | Description | Use Case |
|--------|-------------|----------|
| **Continue** | Log error, continue flow | Non-critical actions |
| **Block** | Stop flow, show error | Critical validations |
| **Retry** | Retry action with backoff | Transient failures |

### Retry Configuration

```json
{
  "retry": {
    "max": 3,
    "backoffMs": 1000,
    "backoffMultiplier": 2,
    "maxBackoffMs": 10000
  }
}
```

---

## Back Navigation Flow

Flow for handling back navigation with history and validation.

```mermaid
flowchart TD
    Start([Back Request]) --> CheckAllowBack{Allow Back?}
    CheckAllowBack -->|No| BlockBack[Block Back Navigation]
    CheckAllowBack -->|Yes| LoadHistory[Load Navigation History]
    
    LoadHistory --> HasHistory{Has History?}
    HasHistory -->|No| NoHistory[No Previous Step]
    HasHistory -->|Yes| GetPrevious[Get Previous Step]
    
    GetPrevious --> CheckPrevious{Previous Allow Back?}
    CheckPrevious -->|No| BlockBack
    CheckPrevious -->|Yes| ApplyPolicy{Apply Policy?}
    
    ApplyPolicy -->|Yes| ClearData[Clear Forward Data]
    ClearData --> Revalidate[Revalidate Previous Step]
    Revalidate --> Navigate[Navigate to Previous]
    
    ApplyPolicy -->|No| Navigate
    
    Navigate --> UpdateHistory[Update History]
    UpdateHistory --> End([Back Navigation Complete])
    
    BlockBack --> ShowMessage[Show Blocked Message]
    NoHistory --> ShowMessage
    ShowMessage --> End
```

### Back Navigation Policies

```json
{
  "back": {
    "allowed": ["step1", "step2"],
    "default": "step1",
    "policy": {
      "revalidateOnReturn": true,
      "clearForwardData": true,
      "preserveContext": false
    }
  }
}
```

---

## Cache Flow

Action result caching mechanism.

```mermaid
flowchart TD
    Start([Action Request]) --> GenerateKey[Generate Cache Key]
    GenerateKey --> CheckCache{Check Cache}
    
    CheckCache -->|Hit| ValidateTTL{Valid TTL?}
    CheckCache -->|Miss| Execute[Execute Action]
    
    ValidateTTL -->|Yes| ReturnCache[Return Cached Result]
    ValidateTTL -->|No| Invalidate[Invalidate Cache]
    Invalidate --> Execute
    
    Execute --> Success{Success?}
    Success -->|Yes| StoreCache[Store in Cache]
    Success -->|No| ReturnError[Return Error]
    
    StoreCache --> ReturnResult[Return Result]
    ReturnCache --> ReturnResult
    ReturnError --> End([Action Complete])
    ReturnResult --> End
```

### Cache Configuration

```json
{
  "cacheTtlMs": 60000,
  "cacheKey": "custom-key",
  "cacheInvalidate": ["related-action"]
}
```

---

## How to Use Diagrams

### Viewing in Docsify

Diagrams are automatically rendered in Docsify using Mermaid. They will appear as interactive SVG diagrams.

### Editing Diagrams

1. **Modify the Mermaid code** in the corresponding section
2. **Preview changes** using [Mermaid Live Editor](https://mermaid.live)
3. **Test in Docsify** by serving the documentation locally

### Creating New Diagrams

Use this template for new diagrams:

```markdown
## Your Diagram Title

Brief description of what the diagram shows.

```mermaid
graph TD
    A[Start] --> B[Process]
    B --> C[End]
```

### Explanation

Detailed explanation of each element in the diagram.

### Configuration

Any relevant configuration options or parameters.
```

### Diagram Conventions

- **States**: Use lowercase (`idle`, `active`, `error`)
- **Events**: Use UPPERCASE (`NEXT`, `FINISH`, `RETRY`)
- **Actions**: Use camelCase (`executeAction`, `updateContext`)
- **Conditions**: Use descriptive names (`canProceed`, `hasErrors`)

---

## Tools and Resources

### Mermaid Resources

- [Mermaid Documentation](https://mermaid.js.org/)
- [Mermaid Live Editor](https://mermaid.live)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid)

### Diagram Export

To export diagrams as images:

1. Visit [Mermaid Live Editor](https://mermaid.live)
2. Paste the diagram code
3. Export as PNG, SVG, or PDF

### Integration

Diagrams are integrated into the documentation through:

- **Docsify Mermaid Plugin**: Automatic rendering
- **Syntax Highlighting**: Code blocks with `mermaid` language
- **Interactive Features**: Clickable elements and tooltips

---

## Related Documentation

- [Advanced Concepts](./advanced-concepts.md)
- [Flow DSL Reference](./flow-dsl.md)
- [API Reference](./api-reference.md)
- [Architecture Guide](./architecture.md)

---

<p align="center">
  <strong>Last Updated:</strong> October 2025
</p>
