# XFlows - Enterprise Sales Channel Orchestrator

> The future of sales channel orchestration with JSON Logic, EJS Templates, and XState for complex microfrontend flows

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Bun](https://img.shields.io/badge/runtime-Bun-1.2-orange?logo=bun)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-18.x-blue?logo=react)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5.x-purple?logo=vite)](https://vitejs.dev)
[![XState](https://img.shields.io/badge/XState-5.x-green?logo=xstate)](https://xstate.js.org)
[![JSON Logic](https://img.shields.io/badge/JSON--Logic-JS-orange)](https://jsonlogic.com/)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**XFlows** is a revolutionary sales channel orchestrator that enables complex flow management using **JSON Logic** for declarative business logic and **EJS** for dynamic content rendering.

### Core Features

- ✅ **Declarative Business Logic** - Complex validations written as JSON expressions
- ✅ **Dynamic Content Rendering** - EJS templates for personalized messaging  
- ✅ **Adaptive User Interfaces** - UI that changes automatically based on context
- ✅ **Advanced State Management** - XState-powered orchestration with lifecycle hooks
- ✅ **Plugin Architecture** - Extensible system for actors, UI components, tools, guards, and actions
- ✅ **Enterprise Integration** - AWS, Google, Microsoft, Slack out-of-the-box
- ✅ **Type Safety** - Full TypeScript support with configurable schemas
- ✅ **Performance Optimized** - Built for scalability and maintainability

### Plugin System Architecture

XFlows features a modular plugin architecture that enables infinite extensibility:

- **🎭 Actors** - Async operations (HTTP, WebSocket, polling)
- **🎨 UI Components** - Display interfaces (charts, tables, maps, forms)
- **🔧 Tools** - Business operations (HTTP clients, databases, file processors)
- **🛡️ Guards** - Conditional logic (time-based, location-based, rate limiting)
- **⚡ Actions** - Side effects (notifications, analytics, storage)

---

## Architecture

XFlows implements three architectural approaches optimized for different use cases:

### Approach 1: Explicit State Machine
Maximum control with pure XState implementation:

```typescript
const salesFlowMachine = createMachine({
  id: 'salesFlow',
  initial: 'quote.start',
  states: {
    'quote.start': {
      invoke: {
        src: 'loadQuoteData',
        onDone: {
          target: 'risk.assessment',
          actions: assign({ quoteData: (_, event) => event.data })
        }
      }
    }
  }
});
```

### Approach 2: Host Orchestrator
Simple JSON-based configuration:

```json
{
  "states": {
    "quote.start": {
      "view": { "moduleId": "mfe-quote-start" },
      "on": {
        "SUBMIT": { "target": "risk.assessment" }
      }
    }
  }
}
```

### Approach 3: Hybrid Framework (Recommended)
Combines the best of both worlds with JSON Logic integration:

```typescript
const hybridFlow = createHybridFlowMachine({
  id: 'insuranceSales',
  states: {
    'quote.validation': {
      // JSON Logic for complex validations
      logic: {
        conditions: [
          {
            name: 'validAgeForLifeInsurance',
            expression: {
              "and": [
                {">": [{"var": "applicant.age"}, 18]},
                {"<=": [{"var": "applicant.age"}, 70]},
                {"==": [{"var": "quote.type"}, "life"]}
              ]
            }
          }
        ]
      },
      
      // Dynamic UI based on context
      ui: {
        title: 'Validation for <%= context.quote?.type %>',
        fields: [
          {
            name: 'premium',
            template: 'Premium: $<%= context.quote?.premium?.toLocaleString() %>',
            visibility: { "!=": [{"var": "quote.premium"}, null] }
          }
        ]
      }
    }
  }
});
```

---

## Quick Start

### Prerequisites

```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash
```

### Installation

```bash
# Clone repository
git clone <repository-url>
cd xflows

# Install dependencies
bun install

# Start development server
bun dev

# Open browser
open http://localhost:3000
```

### Development Commands

```bash
# Development
bun dev          # Development server (http://localhost:3000)
bun build        # Production build
bun preview      # Preview production build

# Code Quality
bun lint         # Run linter
bun lint:fix     # Fix linting issues
bun format       # Format code
bun check        # Run all checks

# Schema Validation
bun schema:validate    # Validate JSON schemas
bun schema:test       # Test schema examples
bun schema:help       # Show schema help
```

---

## Documentation

### Complete Guides

1. **[Architecture Guide](docs/architecture-guide.md)** - Comprehensive overview of all three approaches
2. **[JSON Logic Integration](docs/json-logic-guide.md)** - Advanced business logic with JSON Logic
3. **[Plugin System Guide](docs/plugin-system-guide.md)** - Extensible plugin architecture
4. **[Schema Reference](schemas/README.md)** - JSON Schema definitions and validation

### API Reference

- **[Hybrid Flow Machine](src/approaches/approach-3/)** - Recommended approach implementation
- **[Plugin System](src/core/plugins/)** - Plugin architecture and examples
- **[Template Engine](src/core/templating/)** - EJS and JSON Logic integration
- **[Schema Validation](src/core/validation/)** - Zod and AJV validation

### Examples

- **[Insurance Sales Flow](schemas/v1/examples/insurance-flow.json)** - Complete enterprise example
- **[Plugin Examples](src/core/plugins/examples/)** - AWS, Google, Microsoft integrations
- **[Testing Scenarios](src/components/TestingHelper.tsx)** - Interactive testing tools

---

## Technology Stack

### Core Framework
- **[Vite](https://vitejs.dev)** - Ultra-fast build tool
- **[React 18](https://reactjs.org)** - Modern UI library
- **[TypeScript](https://www.typescriptlang.org)** - Strong typing
- **[Bun](https://bun.sh)** - Ultra-fast runtime and package manager

### Flow Orchestration
- **[XState](https://xstate.js.org)** - Advanced state management
- **[JSON-Logic-JS](https://jsonlogic.com)** - Declarative business logic
- **[EJS](https://ejs.co)** - Dynamic templating engine

### Validation & Schemas
- **[Zod](https://zod.dev)** - TypeScript-first schema validation
- **[AJV](https://ajv.js.org)** - Fast JSON schema validator
- **[AJV Formats](https://ajv.js.org/packages/formats.html)** - Additional formats

### Development Tools
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS (CDN)
- **[Biomejs](https://biomejs.dev)** - Ultra-fast linter and formatter

---

## Contributing

### Development Setup

1. **Fork** the repository
2. **Clone** your fork: `git clone <your-fork-url>`
3. **Install** dependencies: `bun install`
4. **Create** feature branch: `git checkout -b feature/amazing-feature`

### Development Workflow

```bash
# Development
bun dev                    # Development server with hot reload

# Quality checks
bun check                  # Lint + format before commit
bun lint:fix              # Fix issues automatically

# Schema validation
bun schema:validate       # Validate schemas
bun schema:test          # Test schema examples
```

### Commit Guidelines

```bash
# Descriptive commit messages
git commit -m "feat: add JSON Logic validation to hybrid approach"
git commit -m "docs: update architecture guide with examples"
git commit -m "fix: resolve EJS template rendering error"
```

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## Roadmap

### Version 1.0 ✅
- [x] Approach 1: Explicit State Machine
- [x] Approach 2: Host Orchestrator  
- [x] Approach 3: Hybrid Framework with JSON Logic
- [x] Schema validation with Zod + AJV
- [x] EJS template engine
- [x] Plugin system architecture
- [x] Complete documentation
- [x] Git repository setup

### Future Releases 🔮
- [ ] Visual Flow Builder - Drag & drop flow editor
- [ ] Performance Monitoring - Flow performance dashboards
- [ ] A/B Testing Engine - Automated flow testing
- [ ] State Persistence - Automatic state recovery
- [ ] Flow Analytics - Detailed conversion metrics
- [ ] Multi-language Support - International configuration
- [ ] Testing Framework - Jest/Vitest integration
- [ ] CI/CD Pipeline - GitHub Actions with Bun
- [ ] Docker Support - Containerization

---

<p align="center">
  <strong>Built with ⚡ Vite • 🎯 XState • 🧠 JSON-Logic-JS • 🎨 EJS • 📦 Bun</strong><br>
  <em>The future of sales channel orchestration</em>
</p>