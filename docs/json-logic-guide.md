# JSON Logic Integration Guide

## Overview

XFlows integrates [JSON Logic](https://jsonlogic.com) to enable declarative business logic expressions. This powerful system allows complex business rules to be written as JSON structures rather than traditional code, providing flexibility, maintainability, and business-user configurable logic.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Core Operators](#core-operators)
- [Advanced Patterns](#advanced-patterns)
- [Practical Examples](#practical-examples)
- [Integration with XFlows](#integration-with-xflows)
- [Best Practices](#best-practices)
- [Testing JSON Logic](#testing-json-logic)

---

## Getting Started

### Basic Expression

JSON Logic expressions follow a simple pattern: `[operator, left_operand, right_operand]`

```json
{
  ">": [{"var": "age"}, 18]
}
```

This expression evaluates to `true` if the `age` variable is greater than 18.

### Variable Access

Use the `var` operator to access context variables:

```json
{
  "==": [{"var": "quote.type"}, "life"]
}
```

Access nested properties using dot notation:

```json
{
  "!=": [{"var": "applicant.personal.age"}, null]
}
```

Provide default values for undefined variables:

```json
{
  "var": ["missing_property", "default_value"]
}
```

---

## Core Operators

### Comparison Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `==` | Equality | `{"==": [{"var": "status"}, "approved"]}` |
| `!=` | Inequality | `{"!=": [{"var": "errors"}, null]}` |
| `>` | Greater than | `{">": [{"var": "riskScore"}, 80]}` |
| `>=` | Greater than or equal | `{">=": [{"var": "age"}, 18]}` |
| `<` | Less than | `{"<": [{"var": "age"}, 65]}` |
| `<=` | Less than or equal | `{"<=": [{"var": "amount"}, 50000]}` |

### Arithmetic Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `+` | Addition | `{"+": [{"var": "base"}, {"var": "bonus"}]}` |
| `-` | Subtraction | `{"-": [{"var": "price"}, {"var": "discount"}]}` |
| `*` | Multiplication | `{"*": [{"var": "base"}, 1.5]}` |
| `/` | Division | `{"/": [{"var": "total"}, {"var": "items"}]}` |
| `%` | Modulo | `{"%": [{"var": "number"}, 2]}` |

### Logical Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `and` | Logical AND | `{"and": [condition1, condition2, condition3]}` |
| `or` | Logical OR | `{"or": [condition1, condition2]}` |
| `not` | Logical NOT | `{"not": [condition]}` |

---

## Integration with XFlows

### Guards with JSON Logic

```typescript
const hybridMachine = createHybridFlowMachine({
  id: 'insuranceFlow',
  guards: {
    // Advanced JSON Logic guard
    canProceedToPayment: {
      "and": [
        {"var": "condition.validApplication"},
        {"var": "condition.riskAssessmentComplete"},
        {"!=": [{"var": "payment.method"}, null]}
      ]
    },
    
    // Complex business logic guard
    requiresManualReview: {
      "or": [
        {">": [{"var": "risk_score"}, 85]},
        {"<": [{"var": "applicant.age"}, 21]},
        {">": [{"var": "coverage_amount"}, 3000000]}
      ]
    }
  }
});
```

### Premium Calculation Logic

```json
{
  "+": [
    {"*": [{"var": "basePremium"}, 1.0]},
    {
      "if": [
        {">": [{"var": "applicant.age"}, 50]},
        {"*": [{"var": "basePremium"}, 0.5]},
        0
      ]
    },
    {
      "if": [
        {"==": [{"var": "risk_category"}, "high"]},
        {"*": [{"var": "basePremium"}, 0.3]},
        0
      ]
    }
  ]
}
```

---

## Best Practices

### 1. Expression Readability

**✅ Use named conditions**:

```json
{
  "logic": {
    conditions: [
      {
        name: 'isLifeInsurance',
        expression: {"==": [{"var": "type"}, "life"]}
      },
      {
        name: 'seniorApplicant',
        expression: {">": [{"var": "age"}, 50]}
      }
    ],
    computed: [
      {
        field: 'eligibleForSeniorLife',
        expression: {
          "and": [
            {"var": "condition.isLifeInsurance"},
            {"var": "condition.seniorApplicant"}
          ]
        }
      }
    ]
  }
}
```

### 2. Performance Optimization

**Cache computed values**:

```typescript
computed: [
  {
    field: 'riskMultiplier',
    expression: {
      "if": [
        {"in": [{"var": "risk_category"}, ["high", "critical"]]},
        1.5,
        {"in": [{"var": "risk_category"}, ["medium"]]},
        1.2,
        1.0
      ]
    },
    cache: true  // Cache this computation
  }
]
```

---

## Conclusion

JSON Logic integration transforms XFlows into a powerful business rules engine. By using declarative expressions, organizations can adapt quickly to changing requirements without code changes.
