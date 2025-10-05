# 💡 Examples & Tutorials

Real-world implementations and tutorials for XState Orchegesator.

## 🎯 Browse Examples by Category

### 🏢 Enterprise Applications

| Example | Description | Complexity | Technologies |
|---------|-------------|------------|--------------|
| [Insurance Quote Flow](./insurance-quote.md) | Complete insurance application process | Intermediate | React, Forms |
| [Financial Onboarding](./financial-onboarding.md) | Banking account opening flow | Advanced | React, Identity Verification |
| [E-commerce Checkout](./ecommerce-checkout.md) | Multi-step purchase flow | Intermediate | React, Payment APIs |

### 🛠️ Developer Tools

| Example | Description | Complexity | Technologies |
|---------|-------------|------------|--------------|
| [Multi-Framework Demo](./multi-framework.md) | Same flow in React, Vue, Vanilla | Beginner | React, Vue, Vanilla |
| [Testing Patterns](./testing-patterns.md) | Testing approaches and examples | Intermediate | Jest, Testing Library |
| [Migration Guide](./migration-guide.md) | Converting existing apps | Intermediate | Migration Tools |

### 🧩 Integration Examples

| Example | Description | Complexity | Technologies |
|---------|-------------|------------|--------------|
| [Form Libraries](./form-libraries.md) | React Hook Form, Formik integration | Intermediate | React Hook Form, Formik |
| [State Management](./state-management.md) | Redux, Zustand integration | Advanced | Redux Toolkit, Zustand |
| [API Integration](./api-integration.md) | REST, GraphQL service patterns | Intermediate | REST, GraphQL |

## 🚀 Quick Start Examples

### Simple Form Flow (5 minutes)

```json
{
  "id": "quick-contact-form",
  "initial": "form",
  "states": {
    "form": {
      "view": { "moduleId": "contact-form" },
      "on": {
        "SUBMIT": { "target": "submitted" }
      }
    },
    "submitted": {
      "type": "final",
      "view": { "moduleId": "thank-you" }
    }
  }
}
```

[→ View Complete Quick Form Tutorial](./quick-start-form.md)

### Multi-Step Process (15 minutes)

```json
{
  "id": "signup-process",
  "initial": "email",
  "context": { "user": {} },
  "states": {
    "email": {
      "view": { "moduleId": "email-form" },
      "on": { "NEXT": "password" }
    },
    "password": {
      "view": { "moduleId": "password-form" },
      "on": {
        "NEXT": "profile",
        "BACK": "email"
      }
    },
    "profile": {
      "view": { "moduleId": "profile-form" },
      "on": { "SUBMIT": "processing" }
    },
    "processing": {
      "invoke": [{ "type": "create-account" }],
      "onDone": "success",
      "onError": "email"
    },
    "success": { "type": "final" }
  }
}
```

[→ View Complete Multi-Step Tutorial](./multistep-signup.md)

## 📋 Example Format

All examples follow this structure:

### 📝 Example Overview
- **Purpose**: What this example demonstrates
- **Prerequisites**: Required knowledge and setup
- **Time**: Estimated completion time
- **Technologies**: Frameworks and tools used

### 🔧 Implementation
- **Flow Definition**: Complete JSON flow
- **Component Implementation**: Example UI components
- **Service Integration**: External service patterns
- **State Management**: Context and state patterns

### 🧪 Testing
- **Unit Tests**: Individual component tests
- **Integration Tests**: Full flow testing
- **Performance Tests**: Load and performance testing

### 📚 Learning Objectives
What you'll learn from this example:
- Key concepts demonstrated
- Best practices used
- Patterns you can reuse
- Common pitfalls to avoid

## 🌟 Featured Examples

### 🏆 Best Practice Examples

These examples showcase optimal patterns and architectures:

#### [Insurance Quote Flow](./insurance-quote.md) ⭐
**Why it's exemplary:**
- Complex business logic delegation to flows
- Proper error handling and retry logic
- Service integration patterns
- Multi-state verification process
- Real-world complexity management

```typescript
// Complex rating calculation handled in flow
{
  "risk-assessment": {
    "invoke": [{
      "type": "calculate-premium",
      "config": {
        "driverProfile": "{{context.applicant.profile}}",
        "vehicleData": "{{context.vehicle.data}}",
        "coverageOptions": "{{context.coverage.selected}}"
      }
    }],
    "onDone": {
      "actions": [{ "type": "assign", "to": "quote.premium", "fromEventPath": "data" }],
      "target": "quote-review"
    },
    "onError": { "target": "calculation-failed" }
  }
}
```

#### [Multi-Framework Demo](./multi-framework.md) ⭐
**Why it's exemplary:**
- Demonstrates adapter pattern effectiveness
- Shows true framework agnosticism
- Clean separation of flow logic from UI
- Identical behavior across different frameworks

### 🧑‍🎓 Educational Examples

Perfect for learning specific concepts:

#### [Testing Patterns](./testing-patterns.md)
- Flow testing strategies
- Component mocking approaches
- Integration testing patterns
- Performance testing methodology

#### [Migration Guide](./migration-guide.md)
- Converting existing React/Vue apps
- Moving from Redux to flows
- Upgrading legacy form libraries
- Incremental adoption strategies

## 🔗 Related Resources

### 📚 Additional Documentation
- [Getting Started Guide](../guides/getting-started.md) - Foundation concepts
- [Architecture Guide](../core/architecture-guide.md) - Deep system understanding  
- [Flow DSL Reference](../core/semantic-model-guide.md) - Complete syntax documentation
- [Adapter Development](../guides/adapters.md) - Framework integrations

### 🛠️ Development Tools
- [Flow Validator CLI](./tools/flow-validator.md) - Command-line validation
- [Visual Flow Editor](./tools/visual-editor.md) - Drag-and-drop builder
- [Debugging Tools](./tools/debugging.md) - Development debugging

### 🏢 Enterprise Resources
- [Scaling Patterns](./enterprise/scaling.md) - Large application patterns
- [Performance Optimization](./enterprise/performance.md) - Speed and efficiency
- [Security Best Practices](./enterprise/security.md) - Security considerations
- [Compliance Guidelines](./enterprise/compliance.md) - Regulatory compliance

## 🤝 Contributing Examples

We welcome contributions! See our [Contributing Guide](../../CONTRIBUTING.md) for details.

### Example Contribution Guidelines

✅ **Good Examples:**
- Real-world business problems
- Clean, readable code
- Comprehensive tests
- Clear documentation
- Multiple complexity levels

❌ **Avoid:**
- Toy examples without business value
- Overly complex academic examples
- Framework-specific implementations
- Incomplete implementations

### Example Review Process

1. **Proposal**: Open issue discussing example topic
2. **Implementation**: Develop complete example
3. **Testing**: Add comprehensive tests
4. **Documentation**: Write clear tutorial
5. **Review**: Maintainer review process
6. **Integration**: Merge into examples collection

---

**Ready to dive in?** 🚀 

Choose an example that matches your experience level and goals. Start with [Quick Start Form Tutorial](./quick-start-form.md) for beginners, or jump to [Insurance Quote Flow](./insurance-quote.md) for advanced patterns.
