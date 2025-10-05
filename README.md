# 🔄 XState Orchestrator

> **Enterprise-grade flow orchestration with developer-first DX**

A headless, framework-agnostic orchestrator that converts declarative JSON flows into powerful XState v5 machines. Built for complex user journeys, multi-step processes, and enterprise applications that need formal state semantics.

[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://typescriptlang.org)
[![XState](https://img.shields.io/badge/XState-v5-9CF)](https://stately.ai/blog/introducing-xstate-v5)
[![pnpm](https://img.shields.io/badge/pnpm-managed-orange)](https://pnpm.io)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Validate examples
pnpm validate:examples

# Run applications
pnpm sandbox       # Development sandbox (port 3000) - For development & testing
```

## ✨ Features

### 🎯 **Declarative Flow DSL**
Define complex user journeys in clean JSON format with support for:
- Hierarchical states and nested flows
- Conditional branching and loops  
- Service invocations and API calls
- Custom actions and side effects

### 🔧 **Framework Agnostic**
Same flows work across different UI frameworks:
- **React** - Full component integration
- **Vue** - Adapter compatible
- **Angular** - Works with adapter pattern
- **Vanilla JS** - First-class support

### 🛡️ **Enterprise-Ready Validation**
Multi-layer validation ensures reliability:
- **JSON Schema** - Structured validation with AJV
- **Runtime** - Type safety with Zod schemas
- **Linting** - Spectral rules for best practices

### 🧱 **Headless Architecture**
Separate your business logic from UI concerns:
- Pure state machines with formal semantics
- Testable flows independent of UI
- Observable state transitions
- Built-in debugging capabilities

## 📁 Project Structure

```
xflows/
├── 📚 apps/docs/               # Complete documentation
│   ├── getting-started.md     # Setup guide
│   ├── architecture.md        # System design
│   ├── flow-dsl.md           # JSON schema docs
│   ├── examples/             # Tutorials & examples
│   └── api-reference.md       # API documentation
├── 📦 examples/               # Flow examples
│   ├── sales-flow.json       # Simple sales example
│   └── README.md             # Examples guide
├── 📋 schemas/                # JSON Schema files
│   └── flow-schema.json      # Flow validation schema
├── 🔧 tools/                  # Development utilities
│   └── validate-flow.js      # Flow validator CLI
├── 🧪 experiments/             # Research & experiments preserved
├── 🖥️ apps/                   # Applications (sandbox + demos)
└── ⚙️  Package configuration files
```

## 📦 Packages Overview

| Package | Purpose | Status |
|---------|---------|--------|
| [`@xflows/core`](./packages/core/) | Headless XState engine | ✅ Ready |
| [`@xflows/plugin-react`](./packages/plugin-react/) | React integration | ✅ Ready |
| [`@xflows/plugin-http`](./packages/plugin-http/) | HTTP service integration | ✅ Ready |
| [`@xflows/renderer-core`](./packages/renderer-core/) | Renderer contracts | ✅ Ready |
| [`@xflows/sandbox`](./apps/sandbox/) | Development sandbox | ✅ Ready |

## 🏗️ Repository Architecture

**XFlows** is the repository containing:

- 🧪 **Research & Experiments**: Complete exploration of different approaches
- 📦 **Enterprise Packages**: Production-ready packages derived from research  
- 🖥️ **Demo Applications**: Implementation examples using packages
- 📚 **Documentation**: Complete guides and API references

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architectural overview.

## 🎯 Real-World Example

### Sales Quote Flow
```json
{
  "id": "salesFlow",
  "initial": "quote.start",
  "context": {
    "session": { "channel": "web" },
    "quote": {},
    "errors": {}
  },
  "states": {
    "quote": {
      "initial": "start",
      "states": {
        "start":

 {
          "view": { "moduleId": "quote-start" },
          "on": { "NEXT": "coverage" }
        },
        "coverage": {
          "view": { "moduleId": "coverage" },
          "on": { "NEXT": "summary" }
        },
        "summary": {
          "view": { "moduleId": "summary" },
          "on": { "CONFIRM": "done" }
        }
      }
    },
    "done": { "type": "final" }
  }
}
```

## 📖 Documentation

- 📚 [**Getting Started**](./apps/docs/guides/getting-started.md) - Complete setup and first flow
- 🏗️ [**Architecture Guide**](./apps/docs/core/architecture-guide.md) - Deep system design overview
- 🎨 [**Flow DSL Reference**](./apps/docs/core/semantic-model-guide.md) - Complete JSON schema documentation
- 🔧 [**Adapter Development**](./apps/docs/guides/adapters.md) - Framework integration patterns
- 🛡️ [**Validation Guide**](./apps/docs/guides/best-practices.md) - Schema validation and linting
- 🎯 [**Best Practices**](./apps/docs/guides/best-practices.md) - Enterprise patterns
- 💡 [**Examples & Tutorials**](./apps/docs/examples/) - Real-world implementations

## 🔧 Development Tools

### Flow Validation
```bash
# Validate specific flow
pnpm validate:flow examples/sales-flow.json

# Validate all examples
pnpm validate:examples

# Run linting rules
pnpm spectral:lint
```

### Development Workflow
```bash
# Start development server
pnpm dev

# Type checking
pnpm check

# Format code
pnpm format
```

## 📦 Available Examples

See [`./examples/`](./examples/) for implementation examples:

- **[Sales Flow](./examples/sales-flow.json)** - Basic quote generation
- **[Insurance Quote](./apps/docs/examples/insurance-quote.md)** - Complex enterprise pattern
- **[E-commerce Checkout](./apps/docs/examples/ecommerce-checkout.md)** - Multi-step payment process

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](./CONTRIBUTING.md) for:

- Development setup instructions
- Coding standards and practices  
- Pull request guidelines
- Release process

## 📈 Roadmap

🎯 **Currently Developed:**
- ✅ Core XState headless engine
- ✅ JSON Schema validation
- ✅ Spectral linting rules
- ✅ Complete documentation

🚀 **Planned Features:**
- 🔍 Visual flow editor (React Flow + Monaco)
- 📊 Analytics dashboard  
- 🧪 A/B testing framework
- 🔄 Flow versioning tools
- 🎨 Design system integration

## 🏢 Enterprise Use Cases

- **Financial Services**: Mortgage applications, loan processing
- **Insurance**: Quote generation, claims processing  
- **E-commerce**: Checkout flows, onboarding
- **Healthcare**: Patient intake, appointment booking
- **SaaS**: User onboarding, feature activation

## 📜 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

Built with ❤️ using [XState](https://stately.ai), [JSON Schema](https://json-schema.org), and modern web standards.

---

**Ready to revolutionize your user flows?** 🚀 [Get Started →](./apps/docs/guides/getting-started.md)