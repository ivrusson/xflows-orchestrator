# 🧠 JSON-Logic-JS Integration en Approach 3

## 🎯 Resumen

**¡Ahora sí tenemos json-logic-js completamente integrado!** El Approach 3 es la evolución natural que combina:

- ✅ **JSON Logic** para validaciones complejas
- ✅ **EJS Templating** para contenido dinámico  
- ✅ **Sistema híbrido** de guards, actions y UI
- ✅ **Tipado fuerte** con TypeScript

---

## 🔧 Características Principales

### 🛡️ **Sistema de Guards Avanzado**

```typescript
// 🎯 Guards usando JSON Logic directamente
guards: {
  hasValidQuoteData: {
    "and": [
      {"!=": [{"var": "quote.type"}, null]},
      {"!=": [{"var": "quote.coverageAmount"}, null]},
      {">": [{"var": "quote.coverageAmount"}, 0]},
      {"!=": [{"var": "applicant.age"}, null]},
      {">=": [{"var": "applicant.age"}, 18]},
      {"<=": [{"var": "applicant.age"}, 80]}
    ]
  },

  isAcceptableRiskLogic: {
    "and": [
      {"<=": [{"var": "riskScore"}, 80]},
      {
        "if": [
          {"==": [{"var": "quote.type"}, "life"]},
          {"<=": [{"var": "applicant.age"}, 70]},      // Vida hasta 70
          {"<=": [{"var": "applicant.age"}, 75]}       // Otros hasta 75
        ]
      }
    ]
  }
}
```

### ⚡ **Actions con Templating**

```typescript
// 🎨 Actions que usan templating EJS
actions: {
  renderPersonalizedMessage: {
    type: 'renderTemplate',
    template: 'Hola <%= context.applicant?.name || "Cliente" %>, tu cotización de <%= context.quote?.type %> está <%= context.quote?.validationStatus %>.',
    target: 'notification.personalizedMessage'
  },

  validateWithLogic: {
    type: 'validateWithLogic',
    rules: [
      {
        field: 'applicant.age',
        expression: {
          "and": [
            {">=": [{"var": "applicant.age"}, 18]},
            {"<=": [{"var": "applicant.age"}, 80]}
          ]
        },
        errorMessage: 'Edad debe estar entre 18 y 80 años'
      }
    ]
  }
}
```

---

## 🎨 Sistema de UI Dinámico

### 📋 **Campos Condicionales**

```typescript
ui: {
  fields: [
    {
      name: 'age',
      type: 'text',
      template: 'Edad: <%= context.applicant?.age %> años',
      visibility: {
        "!=": [{"var": "applicant.age"}, null]        // Solo si tiene edad
      }
    },
    {
      name: 'premium_estimate',
      type: 'text', 
      template: 'Premium estimado: $<%= context.quote?.premium %>',
      visibility: {
        "!=": [{"var": "quote.premium"}, null]       // Solo si se calculó premium
      }
    }
  ]
}
```

### 🔘 **Botones Inteligentes**

```typescript
buttons: [
  {
    text: 'Continuar',
    event: 'VALIDATION_APPROVED',
    visibility: {
      "==": [{"var": "quote.validationStatus"}, "approved"]  // Solo si aprobado
    },
    enabled: {
      "and": [
        {"!=": [{"var": "applicant.age"}, null]},
        {"!=": [{"var": "quote.coverageAmount"}, null]},
        {">": [{"var": "quote.coverageAmount"}, 0]}
      ]
    }
  },
  
  {
    text: 'Rechazar',
    event: 'VALIDATION_REJECTED',
    visibility: {
      "or": [                                            // Mostrar si algún criterio negativo
        {"<": [{"var": "applicant.age"}, 18]},
        {">": [{"var": "applicant.age"}, 80]},
        {">": [{"var": "quote.coverageAmount"}, 5000000]}
      ]
    }
  }
]
```

---

## 🧮 Sistema de Lógica Avanzada

### 📊 **Computed Properties**

```typescript
logic: {
  computed: [
    {
      field: 'quote.validationStatus',
      expression: {
        "if": [
          {
            "and": [                                    // Si todas las condiciones se cumplen
              {">=": [{"var": "applicant.age"}, 18]},
              {"<=": [{"var": "applicant.age"}, 80]},
              {">=": [{"var": "quote.coverageAmount"}, 1000]},
              {"<=": [{"var": "riskScore"}, 80]}
            ]
          },
          "approved",                                   // Entonces: aprobado
          "pending_review"                              // Sino: revisión manual
        ]
      },
      cache: true                                      // Cache resultado
    },
    
    {
      field: 'quote.premiumMultiplier',
      expression: {
        "+": [
          1.0,                                          // Base
          {
            "if": [{">": [{"var": "applicant.age"}, 50]}, 0.5, 0]  // Penalidad por edad
          },
          {
            "if": [{"==": [{"var": "riskScore"}, "high"]], 0.3, 0]  // Penalidad por riesgo
          }
        ]
      }
    }
  ]
}
```

### ✅ **Validaciones Automáticas**

```typescript
validations: [
  {
    field: 'applicant.age',
    expression: {
      ": "and": [
        {">=": [{"var": "applicant.age"}, 18]},
        {"<=": [{"var": "applicant.age"}, 80]}
      ]
    },
    errorMessage: 'La edad debe estar entre 18 y 80 años'
  },
  
  {
    field: 'quote.coverageAmount',
    expression: {
      ": "and": [
        {">=": [{"var": "quote.coverageAmount"}, 1000]},
        {"<=": [{"var": "quote.coverageAmount"}, 5000000]}
      ]
    },
    errorMessage: 'La cobertura debe estar entre $1,000 y $5,000,000'
  }
]
```

---

## 💰 Cálculo de Premium Dinámico

### 🧮 **Lógica Compleja con JSON Logic**

```typescript
// Premium calculation usando JSON Logic
const premiumExpression: RulesLogic = {
  "+": [
    {"map": [                                          // Para cada monto de cobertura
      {"var": "quote.coverageAmounts"},
      {
        "*": [                                         // Multiplicar: monto × tasa × multiplicadores
          {"var": ""},                                  // Cantidad de cobertura
          {"var": "baseRate"},                           // Tasa base ($100 por $1000)
          {
            "if": [                                     // Multiplicador por tipo
              {"==": [{"var": "quote.type"}, "life"]},   // Si es vida
              {
                "if": [
                  {"<=": [{"var": "applicant.age"}, 30]},  // Si joven ≤30
                  1.2,                                         // Multiplicador joven
                  2.0                                          // Multiplicador adulto
                and: [
                  {"><=": [{"var": "applicant.age"}, 30]},  // Si joven ≤30
                  1.2,                                         // Multiplicador joven
                  2.0                                          // Multiplicador adulto
                ]
              },
              {
                "if": [                                 // Si es salud
                  {"==": [{"var": "quote.type"}, "health"]},
                  1.8,                                     // Multiplicador salud
                  1.5                                      // Otros tipos
                ]
              }
            ]
          },
          {
            "if": [                                     // Penalidad por riesgo alto
              {"==": [{"var": "riskScore"}, "high"]},
              1.5,                                         // Penalidad +50%
              1.0                                          // Sin penalidad
            ]
          }
        ]
      }
    ]},
    {
      "if": [                                           // Cargo adicional por cobertura alta
        {">": [{"var": "quote.coverageAmount"}, 1000000]},
        50,                                                // Cargo $50
        0
      ]
    }
  ]
};
```

---

## 🎭 Templates Dinámicos con EJS

### 📝 **Mensajes Personalizados**

```typescript
// Generación de mensajes usando templates EJS
generateMessage: assign((context, { messageType }) => {
  let template = '';
  
  switch (messageType) {
    case 'welcome':
      template = `¡Bienvenido <%= context.session.user?.name || 'Cliente' %>! 
                 Estás cotizando un <%= context.quote?.type || 'seguro' %> 
                 por <%= context.quote?.coverageAmount?.toLocaleString() || '$0' %> con 
                 riesgo <%= context.riskScore > 80 ? 'alto' : context.riskScore > 50 ? 'medio' : 'bajo' %>.`;
      break;
    
    case 'approval':
      template = `🎉 ¡Felicidades <%= context.applicant?.name %>! 
                 Tu póliza de <%= context.quote?.type %> ha sido aprobada. 
                 Premium: $<%= context.quote?.premium?.toLocaleString() %>/mes`;
      break;
    
    case 'rejection':
      template = `😔 Lo sentimos <%= context.applicant?.name %>, 
                 tu solicitud no pudo ser procesada debido a: 
                 <%= context.errors?.join(', ') || 'criterios no cumplidos' %>`;
      break;
  }

  const message = templateEngine.renderEjsTemplate(template, context);
  return { ...context, notification: { type: messageType, message } };
})
```

---

## 🔄 Ciclo de Vida del Flow

### 📊 **Flujo Completo con JSON Logic**

```typescript
// 1. 📥 Inicialización
'initialization': {
  lifecycle: {
    onEnter: ['logInitialization', 'setupSession', 'renderPersonalizedMessage:welcome']
  },
  binding: {
    inputs: [
      { source: 'url.query.token', target: 'session.token' },
      { source: 'url.query.channel', target: 'session.channel' }
    ]
  }
},

// 2. 📋 Validación con JSON Logic
'quote.validation': {
  lifecycle: {
    onEnter: ['calculatePremium', 'generateMessage:welcome']
  },
  logic: {
    computed: [
      {
        field: 'quote.validationStatus',
        expression: { "if": [{"condition": "allValid"}, "approved", "pending_review"] }
      }
    ]
  },
  ui: {
    title: 'Validación de <%= context.quote?.type || "cotización" %>',
    subtitle: '<%= context.applicant?.name ? "Cliente: " + context.applicant.name : "Validando..." %>'
  }
},

// 3. 🛡️ Evaluación de Riesgo  
'risk.assessment': {
  on: {
    LOW_RISK: {
      target: 'risk.approved',
      cond: 'isAcceptableRiskLogic',                   // JSON Logic guard
      actions: ['logLowRisk']
    },
    HIGH_RISK: {
      target: 'risk.review',
      cond: 'requiresManualReview',                   // JSON Logic guard
      actions: ['generateMessage:review_required']
    }
  }
}
```

---

## 📈 Ventajas del Approach 3 con JSON Logic

| Aspecto | Approach 1 | Approach 2 | **Approach 3 + JSON Logic** |
|---------|------------|------------|----------------------------|
| **Validaciones** | 🔴 Hardcoded | 🔴 Limitadas | 🟢 **Flexibles y potentes** |
| **Template engine** | 🔴 No | 🔴 No | 🟢 **EJS integrado** |
| **UI dinámico** | 🔴 Estático | 🔴 Estático | 🟢 **Completamente dinámico** |
| **Lógica de negocio** | 🔴 Código | 🔴 Básica | 🟢 **JSON declarativo** |
| **Mantenimiento** | 🔴 Alto | 🟡 Medio | 🟢 **Muy bajo** |
| **Flexibilidad** | 🔴 Baja | 🟡 Media | 🟢 **Máxima** |
| **Debugging** | 🟡 Medio | 🔴 Difícil | 🟢 **Excelente** |

---

## 🎯 Casos de Uso Específicos

### ✅ **JSON Logic es Perfecto Para:**

1. **Reglas de negocio complejas**: Cálculos de precio, validaciones multicriterio
2. **UI adaptativo**: Mostrar/ocultar elementos según contexto
3. **Flujos condicionales**: Navegación basada en múltiples factores  
4. **Validaciones dinámicas**: Reglas que cambian por tipo de producto
5. **Templates personalizados**: Mensajes únicos por cliente/situación
6. **A/B Testing**: Cambiar lógica sin cambiar código

### 📝 **Ejemplos Reales de Uso:**

```typescript
// 🎯 Validación por tipo de seguro y región
const regionValidation = {
  "if": [
    {"==": [{"var": "applicant.country"}, "MEX"]},    // Si México
    {
      "and": [
        {"!=": [{ "var": "applicant.rfc" }, ""]},     // Requiere RFC
        {"not": [{"==": [{"var": "applicant.rfc"}, "XAXX010101000"]}]}  // No genérico
      ]
    },
    {"!=": [{ "var": "applicant.taxId" }, ""]}       // Si no México, tax ID
  ]
};

// 🎯 Cálculo de descuento dinámico
const discountCalculation = {
  "+": [
    {
      "if": [                                          // Descuento por antigüedad
        {">=": [{"var": "applicant.age"}, 50]},
        {"*": [{"var": "quote.basePremium"}, 0.15]}   // 15% descuento senior
      ]
    },
    {
      "if": [                                          // Descuento por volumen
        {">": [{"var": "quote.coverageAmount"}, 2000000]},
        {"*": [{"var": "quote.basePremium"}, 0.10]}   // 10% descuento volumen
      ]
    },
    {
      "if": [                                          // Descuento por paquete
        {"in": [{"var": "applicant.clientType"}, ["business", "corporate"]]},
        {"*": [{"var": "quote.basePremium"}, 0.05]}   // 5% descuento corporate
      ]
    }
  ]
};

// 🎯 UI condicional avanzada
const buttonVisibility = {
  "and": [
    {">=": [{"var": "applicant.age"}, 18]},           // Mayor de edad
    {"!=": [{"var": "session.userId"}, null]},        // Usuario logueado
    {
      "if": [
        {"==": [{"var": "quote.type"}, "life"]},       // Si vida
        {"<=": [{"var": "applicant.age"}, 70]},        // Hasta 70 años
        {"<=": [{"var": "applicant.age"}, 75]}         // Otros hasta 75
      ]
    },
    {">": [{"var": "riskScore"}, 0]}                   // Riesgo calculado
  ]
};
```

---

## 🚀 Conclusión

**El Approach 3 con JSON Logic representa la evolución definitiva** de la arquitectura de flujos:

- 🧠 **Lógica de negocio declarativa** en lugar de código
- 🎨 **UI completamente adaptativo** con templates EJS
- 🔧 **Validaciones potentes** y flexibles
- 📊 **Cálculos dinámicos** complejos
- 🎯 **Mantenimiento mínimo** para cambios de negocio

**¡Es la solución perfecta para tu canal de seguros!** 🏆

La combinación de **XState + JSON Logic + EJS Templates** te da el poder máximo con la flexibilidad necesaria para evolucionar tu negocio sin cambiar código. 🚀✨
