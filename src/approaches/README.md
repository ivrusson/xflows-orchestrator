# 🚀 Aproximaciones para Canal de Ventas con XState

Este proyecto incluye **dos aproximaciones diferentes** para crear un orquestador de microfrontends basado en flujos JSON interpretados por XState.

## 📋 Resumen de Aproximaciones

### 🔵 **Aproximación 1: Flujos XState Declarativos (Complejos)**
- **Descripción**: DSL completo con guards, actions, dinámicos
- **Archivo**: `approach-1/`
- **Características**:
  - ✅ Guards con json-logic
  - ✅ Acciones interstep (HTTP, SignalR, Analytics)
  - ✅ Navegación dinámica condicional
  - ✅ Manejo de errores con severidades
  - ✅ Soporte para rollbacks/compensación
  - ✅ Resultados mapeados por JSONPath

### 🟢 **Aproximación 2: Host Orchestrator Minimalista**
- **Descripción**: JSON simple enfocado en vista/navegación
- **Archivo**: `approach-2/`
- **Características**:
  - ✅ JSON más simple, más directo
  - ✅ Focus en ciclo de vida de MFEs
  - ✅ Mock HTTP/service registry
  - ✅ Menos complejidad inicial
  - ✅ Fácil de extender gradualmente

---

## 🎯 **¿Cuál usar?**

### Usar **Aproximación 1** si:
- Necesitas **guards complejos** con validaciones avanzadas
- Requieres **pipelines de acciones** (HTTP, etc.)
- Tienes **navegación condicional** compleja
- Necesitas **manejo de errores robusto** con rollbacks
- El equipo está comprometido con **DSL declarativo completo**

### Usar **Aproximación 2** si:
- Quieres **implementar gradualmente** características
- El equipo prefiere **simplicidad inicial**
- Navegación **relativamente simple**
- Enfasis en **ciclo de vida de MFEs**
- **Mockups rápidos** para evaluación

---

## 🔄 **Migración entre aproximaciones**

### De 2 → 1:
```typescript
// Aproximación 2 (simple)
{
  "id": "quote.start",
  "view": { "moduleId": "mfe-quote" },
  "on": { "NEXT": "quote.coverage" }
}

// → Aproximación 1 (con guards y actions)
{
  "id": "quote.start",
  "viewId": "7006-quickquote",
  "guards": [{ "condition": {...}, "errorPage": "/error/session-expired" }],
  "interstep": {
    "beforeNext": [{ "type": "http", "url": "/api/save", "severity": "block" }]
  },
  "navigation": { "next": "quote.coverage" }
}
```

### De 1 → 2:
Simplificar eliminando guards/actions del JSON y mover lógica a código.

---

## 🏃‍♂️ **Quick Start**

### Ejecutar Aproximación 1:
```bash
bun dev
# Navega a http://localhost:3000/approach-1
```

### Ejecutar Aproximación 2:
```bash
bun dev
# Navega a http://localhost:3000/approach-2
```

---

## 📁 **Estructura del Proyecto**

```
src/
├── approaches/
│   ├── README.md           # Este archivo
│   ├── approach-1/         # Aproximación 1: DSL Completo
│   │   ├── components/    # Componentes React para Approach 1
│   │   ├── machines/      # Máquinas de estado
│   │   ├── flows/         # JSONs de ejemplo (7006-updated.json)
│   │   └── utils/         # Utilidades (guards, actions)
│   └── approach-2/         # Aproximación 2: Host Orquestador
│       ├── components/    # Componentes React para Approach 2
│       ├── core/          # Core logic (createFlowMachine, registry)
│       ├── flows/         # JSONs simples
│       └── examples/     # Ejemplos de migración
```

---

## 🧪 **Próximos Pasos**

1. **Explorar ambas aproximaciones** navegando por el código
2. **Ejecutar demos** para ver comportamiento en vivo
3. **Evaluar complejidad** vs funcionalidad necesaria
4. **Prototipar tus casos específicos** modificando los JSONs
5. **Decidir qué camino seguir** basándote en tu contexto

---

<p align="center">
  <strong>💡 Tip:</strong> Empieza con la <strong>Aproximación 2</strong> para entender el ciclo de vida básico, luego evalúa si necesitas la complejidad adicional de la <strong>Aproximación 1</strong>.
</p>
