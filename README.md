# 🚀 XFlows - Revolutionary Sales Channel Orchestrator

![XFlows Banner](https://via.placeholder.com/1200x300/007ACC/FFFFFF?text=XFlows+-+Revolutionary+Sales+Channel+Orchestrator)

> **El futuro de la orquestación de canales de venta** con **JSON-Logic-JS**, **EJS Templates** y **XState** para flujos complejos con microfrontends

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Bun](https://img.shields.io/badge/runtime-Bun-1.2-orange?logo=bun)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-18.x-blue?logo=react)](https://reactjs.org)
[![Vite](https://://img.shields.io/badge/Vite-5.x-purple?logo=vite)](https://vitejs.dev)
[![XState](https://img.shields.io/badge/XState-5.x-green?logo=xstate)](https://xstate.js.org)
[![JSON Logic](https://img.shields.io/badge/JSON--Logic-JS-orange)](https://jsonlogic.com/)

---

## 📋 Tabla de Contenidos

- [🎯 Overview](#overview)
- [🏆 Approaches](#approaches)
- [🛠️ Setup](#setup)
- [🚀 Scripts](#scripts)
- [📁 Estructura](#estructura)
- [✨ Features](#features)
- [🎪 Demo](#demo)
- [📚 Documentación](#documentación)
[🤝 Contributing](#contributing)
- [📄 License](#license)

---

## 🎯 Overview

**XFlows** es un orquestador revolucionario de canales de ventas que permite manejar flujos complejos usando **JSON-Logic-JS** para lógica de negocio declarativa y **EJS** para contenido dinámico.

### ✨ **¿Por qué XFlows?**

| Problema | Approach 1 | Approach 2 | **Approach 3** |
|----------|------------|------------|----------------|
| **Flexibilidad** | 🔴 Baja | 🟢 Alta | 🟢 **Máxima** |
| **Lifecycle hooks** | 🟡 Manual | 🔴 Limitado | 🟢 **Completo** |
| **Tipado fuerte** | 🟢 Excelente | 🟡 Medio | 🟢 **Excelente** |
| **Mantenimiento** | 🔴 Alto | 🟢 Bajo | 🟢 **Muy bajo** |
| **Performance** | 🟢 Bueno | 🟡 Medio | 🟢 **Excelente** |
| **🧠 JSON Logic** | 🔴 No | 🔴 No | 🟢 **Completo** |
| **🎨 EJS Templating** | 🔴 No | 🔴 No | 🟢 **Integrado** |
| **🔄 UI Dinámico** | 🔴 Estático | 🔴 Estático | 🟢 **Adaptativo** |
| **💬 Mensajes Personalizados** | 🔴 No | 🔴 No | 🟢 **Completos** |
| **📊 Validaciones Complejas** | 🔴 Código manual | 🔴 Limitadas | 🟢 **JSON declarativo** |

### 🚀 **Características Revolucionarias**

- ✅ **Validaciones complejas** escritas como JSON declarativo usando JSON-Logic-JS
- ✅ **Cálculos dinámicos** de premium usando lógica de negocio avanzada
- ✅ **UI que se adapta** automáticamente al contexto del usuario
- ✅ **Mensajes personalizados** generados dinámicamente con templates EJS
- ✅ **Reglas de negocio** configurables sin cambios de código
- ✅ **Campos condicionales** que aparecen/desaparecen según criterios JSON Logic
- ✅ **Lifecycle completo** con hooks de entrada/salida explícitos
- ✅ **Debugging avanzado** con visual logging y state inspection
- ✅ **Testing integrado** con escenarios predefinidos

### 🔌 **Sistema de Plugins Extensible**

El sistema de plugins revoluciona la arquitectura permitiendo extensibilidad infinita:

- ✅ **Arquitectura Modular** - Plugins categorizados: Actors, UI, Tools, Guards, Actions
- ✅ **Integración Enterprise** - AWS (S3, CloudWatch, SES), Google (Analytics, Sheets), Slack
- ✅ **Terceros Compatibles** - SendGrid, MySQL, MapBox, Microsoft Azure
- ✅ **Carga Dinámica** - Descubrimiento y instalación de plugins en runtime
- ✅ **Type-Safe** - Soporte completo de TypeScript con validación de esquemas
- ✅ **Zero-Code Integration** - Integrar servicios sin tocar código core
- ✅ **Plugin Demo Interactivo** - Interface completa para testear y gestionar plugins

```typescript
// Ejemplo: Integración con AWS S3
const enhancedMachine = createPluginEnhancedMachine({
  plugins: {
    tools: {
      'document-uploader': {
        id: 'aws-s3-upload',
        config: {
          bucket: 'insurance-documents',
          keyTemplate: 'policies/{{dossierId}}/{{filename}}'
        },
        enabled: true
      }
    },
    ui: {
      'metrics-dashboard': {
        id: 'aws-cloudwatch',
        config: {
          namespace: 'Insurance/Processing',
          metrics: ['DocumentUploadTime', 'ProcessingRate']
        },
        enabled: true
      }
    }
  }
});
```

---

## 🏆 Approaches

### 🎯 **Approach 1: DSL Completo**
Máximo control con XState puro:
```typescript
// Máquina XState completa con toda la lógica hardcoded
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

### 🎯 **Approach 2: Host Orchestrator Simple**
Configuración JSON simple:
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

### 🏆 **Approach 3: Hybrid (REVOLUCIONARIO)**
¡Lo mejor de ambos mundos + JSON Logic!
```typescript
const hybridFlow = createHybridFlowMachine({
  id: 'insuranceSales',
  states: {
    'quote.validation': {
      // 🧠 JSON Logic para validaciones complejas
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
      
      // 🎨 UI completamente dinámico
      ui: {
        title: 'Validación de <%= context.quote?.type %>',
        fields: [
          {
            name: 'premium',
            template: 'Premium: $<%= context.quote?.premium?.toLocaleString() %>',
            visibility: { "!=": [{"var": "quote.premium"}, null] }
          }
        ],
        buttons: [
          {
            text: 'Continuar',
            event: 'CONTINUE',
            enabled: {
              "and": [
                {"!=": [{"var": "applicant.age"}, null]},
                {">": [{"var": "quote.coverageAmount"}, 0]}
              ]
            }
          }
        ]
      }
    }
  }
});
```

---

## 🛠️ Setup

Este proyecto usa **Bun** como package manager para máxima velocidad:

### **Prerequisitos**

```bash
# Instalar Bun (si no lo tienes)
curl -fsSL https://bun.sh/install | bash
```

### **Instalación**

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd xflows

# 2. Instalar dependencias con Bun
bun install

# 3. Ejecutar el servidor de desarrollo  
bun dev

# 4. Abrir el navegador
open http://localhost:3000
```

### **🐛 Debugging**

```bash
# Limpiar caché si hay problemas
bun pm cache rm

# Reinstalar dependencias si es necesario
rm -rf node_modules bun.lock
bun install
```

---

## 🚀 Scripts

```bash
# 🚀 Desarrollo
bun dev          # Servidor de desarrollo (http://localhost:3000)
bun build        # Build de producción optimizado
bun preview      # Preview del build de producción

# 🔍 Calidad de código
bun lint         # Ejecutar Biomejs linter
bun lint:fix     # Arreglar problemas automáticamente
bun format       # Formatear código con Biomejs
bun check        # Linting + formato (recomendado para commits)

# 🎯 Testing
# (Próximamente: testing automático integrado)
```

---

## 📁 Estructura del Proyecto

```
xflows/
├── 📚 docs/                              # Documentación completa
│   ├── hybrid-approach-guide.md          # Guía completa Approach 3
│   ├── json-logic-integration.md         # Guía específica JSON Logic
│   └── comparison-architecture.md        # Comparación de approaches
│
├── 🎨 src/
│   ├── App.tsx                           # Componente principal con tabs
│   ├── approaches/                       # Los 3 approaches implementados
│   │   ├── approach-1/                  # DSL Completo
│   │   │   ├── sales-flow-machine.ts    # Máquina XState completa
│   │   │   ├── simple-working-machine.ts # Máquina simplificada para demo
│   │   │   └── components/
│   │   │       └── FlowOrchestrator.tsx # Orquestador con logging visual
│   │   ├── approach-2/                  # Host Orchestrator Simple
│   │   │   ├── createFlowMachine.ts     # Factory de máquinas desde JSON
│   │   │   └── components/
│   │   │       └── SimpleFlowOrchestrator.tsx # Orquestador simple
│   │   └── approach-3/                  # 🏆 Hybrid (REVOLUCIONARIO)
│   │       └── hybrid-flow-machine.ts    # Sistema híbrido con JSON Logic
│   │
│   ├── core/                            # Sistema de validación y templating
│   │   ├── validation/
│   │   │   ├── schemaValidator.ts       # Validación con Zod + AJV
│   │   │   └── flowValidator.ts         # Validadores específicos de flujos
│   │   ├── templating/
│   │   │   └── templateEngine.ts        # EJS + JSON-Logic-JS
│   │   └── demo/
│   │       └── ValidationDemo.tsx       # Demo de validación y templating
│   │
│   └── components/
│       └── TestingHelper.tsx           # Widget de testing avanzado
│
├── ⚙️ Configuración
│   ├── package.json                     # Dependencies con Bun
│   ├── vite.config.ts                  # Configuración Vite
│   ├── tsconfig.json                   # Configuración TypeScript
│   ├── biome.json                      # Configuración Biomejs
│   └── .gitignore                      # Archivos ignorados
│
└── 📝 README.md                        # Este archivo
```

---

## ✨ Features

### 🧠 **JSON-Logic-JS Integration**

Validaciones complejas sin código:

```typescript
// Validación multicriterio por país y tipo de seguro
{
  "if": [
    {"==": [{"var": "applicant.country"}, "MEX"]},
    {"and": [
      {"!=": [{"var": "applicant.rfc"}, ""]},
      {"in": [{"var": "quote.type"}, ["life", "health", "auto"]]}
    ]},
    true
  ]
}
```

### 🎨 **EJS Templating Dinámico**

Contenido personalizado basado en contexto:

```javascript
// Templates que se adaptan automáticamente
`¡Hola <%= context.applicant?.name || 'Cliente' %>!

Tu cobertura de <%= context.quote?.type %> por 
$<%= context.quote?.coverageAmount?.toLocaleString() %> está 
<%= context.riskScore > 80 ? '🔴 Alta' : '🟢 Aceptable' %>.`
```

### 🔄 **UI Completamente Adaptativo**

Campos y botones que cambian según el contexto:

```typescript
// Campo RFC solo visible para México
{
  name: 'rfc_field',
  type: 'input',
  visibility: {
    "==": [{"var": "applicant.country"}, "MEX"]
  },
  required: {
    "and": [
      {"==": [{"var": "applicant.country"}, "MEX"]},
      {">": [{"var": "quote.coverageAmount"}, 50000]}
    ]
  }
}
```

### 📊 **Sistema de Cálculo Avanzado**

Premium dinámico con JSON Logic:

```typescript
// Cálculo de premium complejo
const premiumExpression = {
  "+": [
    {"*": [{"var": "baseRate"}, {"var": "coverageAmount"}]},
    {
      "if": [
        {">": [{"var": "applicant.age"}, 50]},
        {"*": [{"var": "baseRate"}, 0.5]},  // +50% por edad
        0
      ]
    },
    {
      "if": [
        {"==": [{"var": "riskScore"}, "high"]},
        {"*": [{"var": "baseRate"}, 0.3]},  // +30% por riesgo
        0
      ]
    }
  ]
};
```

---

## 🎪 Demo

### **🚀 Servidor de Desarrollo**

```bash
bun dev
```

Visita [http://localhost:3000](http://localhost:3000) para explorar:

- 📋 **Overview**: Comparación de los 3 approaches
- 🎯 **Approach 1**: DSL Completo con logging visual
- 🎯 **Approach 2**: Host Orchestrator Simple
- 🧪 **Testing Mode**: Comparación lado a lado + Testing Helper
- ✅ **Validation**: Demo de Zod + AJV + EJS

### **🎮 Testing Helper**

Widget flotante con:
- ✅ **Escenarios predefinidos**: Happy Path, Error Recovery, Navigation
- 📊 **Log visual en tiempo real**: Estados, eventos, contextos
- 🔄 **Control manual**: Botones para cada transición
- 📈 **Progress tracking**: Seguimiento de flujo completo

---

## 📚 Documentación

### 📖 **Guías Completas**

1. **[Hybrid Approach Guide](./docs/hybrid-approach-guide.md)**
   - Arquitectura completa del Approach 3
   - Sistema de guards, actions y actors
   - Lifecycle hooks y data binding
   - Ejemplos prácticos de uso

2. **[JSON Logic Integration](./docs/json-logic-integration.md)**
   - Integración completa con JSON-Logic-JS
   - Guards avanzados con lógica declarativa
   - Actions con templating EJS
   - UI dinámico y validaciones complejas
   - Ejemplos de cálculo de premium

3. **[Architecture Comparison](./docs/comparison-architecture.md)**
   - Comparación detallada de los 3 approaches
   - Tablas de pros/cons por caso de uso
   - Recomendaciones de uso

### 🎯 **Casos de Uso Ideales**

**Approach 3 es perfecto para:**
- 🏢 **Canales de venta multi-producto**: Seguros, créditos, inversiones
- 🌍 **Flujos con múltiples variaciones**: Diferentes países/regulaciones  
- 👥 **Equipos grandes**: Múltiples desarrolladores trabajando en paralelo
- 🔄 **Cambios frecuentes de negocio**: Regulaciones, productos nuevos
- 🎯 **A/B testing**: Diferentes versiones del mismo flujo
- 🔗 **Microfrontends complejos**: Múltiples MFEs interconectados

---

## 🌐 Tecnologías

### **Frontend Stack**
- ⚡ **[Vite](https://vitejs.dev)** - Build tool ultrarrápido
- ⚛️ **[React 18](https://reactjs.org)** - Biblioteca de UI moderna
- 🔷 **[TypeScript](https://www.typescriptlang.org)** - Tipado fuerte
- 📦 **[Bun](https://bun.sh)** - Runtime y package manager ultrarrápido

### **Orquestación**
- 🎯 **[XState](https://xstate.js.org)** - State management avanzado
- 🧠 **[JSON-Logic-JS](https://jsonlogic.com)** - Lógica declarativa
- 🎨 **[EJS](https://ejs.co)** - Template engine dinámico

### **Validación & Schemas**
- ✅ **[Zod](https://zod.dev)** - Schema validation TypeScript-first
- 🔍 **[AJV](https://ajv.js.org)** - Schema validator JSON rápido
- 📋 **[AJV Formats](https://ajv.js.org/packages/formats.html)** - Formatos adicionales

### **Styling & Development**
- 🎨 **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS (CDN)
- 🔧 **[Biomejs](https://Biomejs.dev)** - Linter y formatter ultra-rápido

---

## 🤝 Contributing

### **🚀 Getting Started**

1. **Fork** el repositorio
2. **Clone** tu fork: `git clone <tu-fork-url>`
3. **Install** dependencias: `bun install`
4. **Create** feature branch: `git checkout -b feature/amazing-feature`

### **🔧 Development**

```bash
# Desarrollo
bun dev                    # Servidor con hot reload

# Quality checks
bun check                  # Lint + format antes de commit
bun lint:fix              # Arreglar problemas automáticamente

# Testing (próximamente)
# bun test                # Testing automatizado
```

### **📝 Commit Guidelines**

```bash
# Mensajes de commit descriptivos
git commit -m "feat: add JSON Logic validation to Approach 3"
git commit -m "docs: update hybrid approach guide with examples"
git commit -m "fix: resolve EJS template rendering error"
```

### **🚀 Pull Request**

1. **Test** tus cambios: `bun check`
2. **Commit** con mensaje claro
3. **Push** a tu feature branch
4. **Open** Pull Request con descripción detallada

---

## 📄 License

Este proyecto está licenciado bajo la **MIT License** - ver el archivo [LICENSE](LICENSE) para detalles.

---

## 🎯 Roadmap

### **🔮 Próximas Features**

- [ ] **Visual Flow Builder**: Editor drag & drop para crear flows
- [ ] **Performance Monitoring**: Dashboards de rendimiento del flujo  
- [ ] **A/B Testing Engine**: Automatización de testing
- [ ] **State Persistence**: Recuperación automática de estados
- [ ] **Flow Analytics**: Métricas detalladas de conversión
- [ ] **Multi-language Support**: Configuración en varios idiomas
- [ ] **Testing Framework**: Jest/Vitest integration automática
- [ ] **CI/CD Pipeline**: GitHub Actions con Bun
- [ ] **Docker Support**: Containerización del proyecto

### **🏆 Versión 1.0**

- [x] ✅ Approach 1: DSL Completo
- [x] ✅ Approach 2: Host Orchestrator Simple  
- [x] ✅ Approach 3: Hybrid con JSON Logic
- [x] ✅ Validación con Zod + AJV
- [x] ✅ Template engine EJS
- [x] ✅ Testing helper avanzado
- [x] ✅ Documentación completa
- [x] ✅ Git repository setup

---

<p align="center">
  <strong>🚀 Built with ⚡ Vite • 🎯 XState • 🧠 JSON-Logic-JS • 🎨 EJS • 📦 Bun</strong><br>
  <em>The future of sales channel orchestration</em>
</p>