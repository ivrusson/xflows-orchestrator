# 🤝 Contributing to XState Orchestrator

Thank you for your interest in contributing to XState Orchestrator! This document outlines how to contribute effectively to the project.

## 📖 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Contributing Guide](#contributing-guide)
- [Package Guidelines](#package-guidelines)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)

## 📜 Code of Conduct

This project follows our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to abide by its terms.

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **pnpm** 8+ (preferred package manager)
- **Git** for version control
- Basic knowledge of **TypeScript**, **XState**, and **modern JavaScript**

### Development Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/your-username/xstate-orchestrator.git
cd xstate-orchestrator

# 2. Install dependencies
pnpm install

# 3. Run validation to ensure everything works
pnpm validate:flow

# 4. Start development server
pnpm dev:react

# 5. Verify setup
pnpm test
```

### Repository Structure

```
xstate-orchestrator/
├── packages/           # Core packages
│   ├── core/          # Headless orchestrator engine
│   ├── adapter-react/ # React integration
│   ├── adapter-vanilla/# Vanilla JS integration
│   └── renderer-core/ # Adapter contracts
├── apps/              # Demo applications
│   ├── demo-react/    # React demo
│   └── demo-vanilla/  # Vanilla JS demo
├── flows/             # Sample flows and validation
├── apps/docs/         # Documentation
└── tools/             # Build and development tools
```

## 🔄 Development Workflow

### Branch Naming

Use descriptive branch names following these patterns:

```
feature/flow-validation-improvements
bugfix/service-registry-memory-leak
docs/api-documentation-update
performance/component-mount-optimization
```

### Commit Messages

Follow conventional commit format:

```
type(scope): brief description

Detailed explanation of the change, motivation, and implementation
details where necessary.

Closes #123
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `perf`: Performance improvements
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(core): add support for parallel states in flow DSL

Implemented parallel state execution using XState's parallel state machines.
This enables concurrent execution of independent sub-flows.

- Add parallel state detection in state builder
- Update TypeScript definitions for parallel states  
- Add comprehensive tests for parallel state scenarios

Closes #45

fix(adapter-react): resolve component unmount race condition

Fixed race condition where components could attempt to unmount after
their DOM container was removed.

- Add cleanup guard in React renderer unmount logic
- Prevent unmount operations on non-existent elements
- Add integration test for unmount race condition

Fixes #67
```

## 📦 Package Guidelines

### Core Package (`@core/orchestrator`)

The core package should remain **pure and focused**:

#### ✅ Good Contributions
- Enhanced state machine building logic
- New action types (assign, track, invoke, etc.)
- Service registry improvements
- Better error handling and validation
- Performance optimizations

#### ❌ Avoid
- UI-specific logic
- Framework dependencies
- Browser APIs (use in adapters instead)
- Application-specific business logic

#### Code Style Example

```typescript
// ✅ Good: Pure function with clear responsibilities
export function buildAction(actionSpec: ActionSpec, context: any): XStateAction {
  switch (actionSpec.type) {
    case 'assign':
      return assign((ctx, event) => ({
        ...ctx,
        [actionSpec.to]: resolveEventPath(event, actionSpec.fromEventPath)
      }));
    case 'track':
      return () => trackEvent(actionSpec.event, actionSpec.props);
    default:
      throw new Error(`Unknown action type: ${actionSpec.type}`);
  }
}

// ❌ Avoid: Browser-specific code in core
export function fetchData(url: string): Promise<any> {
  return fetch(url).then(r => r.json()); // ❌ Browser API in core
}
```

### Adapter Packages

Adapters bridge the core with specific UI frameworks:

#### ✅ Good Contributions
- New framework integration
- Performance optimizations for specific frameworks
- Better TypeScript support
- Framework-specific debugging tools

#### Example: Vue Adapter

```typescript
// packages/adapter-vue/src/index.ts

import { createApp, defineComponent } from 'vue';
import type { ViewProps, HostRenderer } from '@renderer-core/contracts';

// ✅ Good: Clean Vue integration
export function createVueRenderer(registry: ViewRegistry): HostRenderer {
  return {
    mount(moduleId, slot, props) {
      const Component = registry.resolve(moduleId);
      if (!Component) {
        throw new Error(`Unknown Vue component: ${moduleId}`);
      }

      const element = document.getElementById(slot || 'app');
      const app = createApp(Component, props);
      const instance = app.mount(element);

      return {
        unmount: () => {
          app.unmount();
          element.innerHTML = '';
        }
      };
    }
  };
}

// Vue component helper
export function defineFlowComponent(options: any) {
  return defineComponent({
    props: ['flowId', 'nodeId', 'contextSlice', 'send'],
    ...options
  });
}
```

### Flow Packages (`@flows/*`)

Flow definitions should be **real-world examples**:

#### ✅ Good Examples
```json
{
  "id": "mortgage-application",
  "initial": "personal-details",
  "context": {
    "applicant": {},
    "property": {},
    "financials": {}
  },
  "states": {
    "personal-details": {
      "view": { "moduleId": "applicant-form" },
      "on": {
        "NEXT": {
          "target": "property-assessment",
          "actions": [{
            "type": "assign",
            "to": "applicant",
            "fromEventPath": "payload"
          }]
        }
      }
    }
    // ... more states
  }
}
```

#### ❌ Avoid in Examples
- Toy/hello-world examples  
- Unrealistic flow definitions
- Overly complex flows without clear business value

## 🧪 Testing

### Test Structure

```
packages/
├── core/
│   ├── src/
│   └── tests/
├── adapter-react/
│   ├── src/
│   └── tests/
└── flows/
    └── tests/
```

### Writing Tests

#### Unit Tests

```typescript
// packages/core/tests/host.test.ts
import { createHeadlessHost } from '../src/host';
import type { FlowSpec } from '../src/types';

describe('createHeadlessHost', () => {
  it('should create valid state machine from simple flow', () => {
    const simpleFlow: FlowSpec = {
      id: 'test-flow',
      initial: 'start',
      states: {
        start: {
          on: { NEXT: 'end' }
        },
        end: { type: 'final' }
      }
    };

    const host = createHeadlessHost(simpleFlow, {
      services: {},
      apis: {
        lifecycle: { enter: () => {}, leave: () => {} },
        readFrom: (event, path) => path ? event.path?.split('.').reduce((a,k) => a?.[k], event) : event,
        track: () => {}
      }
    });

    expect(host.actor.getSnapshot().value).toBe('start');
    
    host.send({ type: 'NEXT' });
    expect(host.actor.getSnapshot().value).toBe('end');
  });
});
```

#### Integration Tests

```typescript
// packages/adapter-react/tests/integration.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { createHeadlessHost } from '@core/orchestrator';
import { createReactRenderer } from '../src';

describe('React Adapter Integration', () => {
  it('should handle complete user flow', async () => {
    const TestComponent = ({ contextSlice, send }) => {
      const [step, setStep] = useState('initial');
      
      return (
        <div>
          <button onClick={() => send({ type: 'START_FLOW' })}>
            Start Test Flow
          </button>
        </div>
      );
    };

    const registry = {
      resolve(id: string) {
        if (id === 'test-component') return asReactView(TestComponent);
        return undefined;
      }
    };

    const host = createHeadlessHost(testFlow, mockDeps);
    const renderer = createReactRenderer(registry);

    render(<TestApp host={host} renderer={renderer} />);
    
    fireEvent.click(screen.getByText('Start Test Flow'));
    
    expect(host.actor.getSnapshot().value).toBe('processing');
  });
});
```

### Test Coverage

Maintain high test coverage:

```bash
# Run tests with coverage
pnpm test --coverage

# Current coverage targets:
# - Core package: >90%
# - Adapter packages: >85%
# - Flow examples: >75%
```

## 📝 Documentation

### Documentation Standards

1. **Always document new features** with examples
2. **Update README** for user-facing changes
3. **Add API documentation** for new exports
4. **Include migration guides** for breaking changes

### API Documentation

Use TSDoc format:

```typescript
/**
 * Creates a headless XState orchestrator host from a flow definition.
 * 
 * @param flow - The flow definition specifying states, transitions, and views
 * @param deps - Dependencies including services and API implementations
 * @returns Host instance with actor, send function, and view resolution
 * 
 * @example
 * ```typescript
 * const host = createHeadlessHost(registrationFlow, {
 *   services: { http: httpService },
 *   apis: { track: analytics.track }
 * });
 * 
 * host.send({ type: 'USER_REGISTER', payload: userData });
 * ```
 */
export function createHeadlessHost(
  flow: FlowSpec, 
  deps: HostCoreDeps
): HostInstance {
  // Implementation...
}
```

## 🔄 Pull Request Process

### Before Submitting

1. **Ensure tests pass**: `pnpm test`
2. **Validate flows**: `pnpm validate:flow`
3. **Check linting**: `pnpm lint`
4. **Update documentation** if needed
5. **Verify no breaking changes** without migration path

### PR Template

Use this PR template:

```markdown
## Description
Brief description of changes and motivation.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)  
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement

## Testing
- [ ] Tests pass locally
- [ ] Added tests for new functionality
- [ ] Updated existing tests for changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Documentation updated
- [ ] No breaking changes without migration guide
- [ ] Flow validation passes

## Related Issues
Closes #XXX
```

### Review Process

1. **Automated Checks**: CI runs tests, linting, and validation
2. **Code Review**: At least one maintainer reviews PR
3. **Testing**: Reviewer validates changes locally
4. **Approval**: Maintainer approves when ready
5. **Merge**: PR merged and released

## 🚀 Release Process

### Semantic Versioning

We follow [SemVer](https://semver.org/):

- **MAJOR**: Breaking changes, major architectural changes
- **MINOR**: New features, additions (backward compatible)
- **PATCH**: Bug fixes, documentation updates

### Version Bumps

```bash
# Patch release (1.0.0 → 1.0.1)
pnpm version patch

# Minor release (1.0.1 → 1.1.0) 
pnpm version minor

# Major release (1.1.0 → 2.0.0)
pnpm version major
```

### Release Checklist

1. **Update CHANGELOG.md** with release notes
2. **Run full test suite**: `pnpm test`
3. **Validate all flows**: Bump version
4. **Tag release**: `git tag v1.1.0`
5. **Publish packages**: `pnpm publish --recursive`
6. **Create GitHub release** with notes

## 📞 Getting Help

### Community Support

- **GitHub Discussions**: Ask questions, share ideas
- **Discord**: Real-time chat (link TBD)
- **GitHub Issues**: Report bugs, request features

### Maintainers

- **@your-username**: Lead maintainer
- **@team-member**: Core contributor

### Contributing Guidelines Summary

✅ **DO:**
- Create focused, single-purpose PRs
- Write comprehensive tests
- Update documentation
- Follow naming conventions  
- Use conventional commits

❌ **DON'T:**
- Submit unfinished code
- Break existing APIs without migration path
- Add framework coupling in core
- Skip tests or documentation
- Submit multiple unrelated changes in one PR

---

**Thank you for contributing to XState Orchestrator!** 🎉

Your contributions help make enterprise-grade flow orchestration accessible to developers everywhere. Every contribution, from bug fixes to documentation improvements, is valuable.
