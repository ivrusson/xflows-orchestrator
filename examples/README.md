# XFlows Examples

Este directorio contiene ejemplos de implementación que demuestran las capacidades del framework XFlows.

## Ejemplos disponibles

### Definiciones de flujos
- [`updated-flow-example.json`](./updated-flow-example.json) - Flujo completo de onboarding con validación de formularios y llamadas API

### Aplicaciones React
- [`react-demo/`](./react-demo/) - Aplicación React completa con Vite mostrando la integración de XFlows

## Inicio rápido

### Ejecutar el demo de React

```bash
# Instalar dependencias
pnpm install

# Iniciar el demo de React
pnpm --filter @xflows/react-demo dev
```

El demo estará disponible en `http://localhost:3001`

## Características demostradas

### Configuración de flujos
- **Gestión de pasos**: Flujos multi-paso con navegación
- **Tipos de vista**: Display, form, success, error views
- **Tipos de campos**: Text, email, select, checkbox, textarea
- **Validación**: Validación del lado del cliente con reglas personalizadas
- **Hooks**: Procesamiento antes/después de pasos
- **Acciones**: Assign, log, analytics actions
- **Navegación**: Transiciones condicionales e incondicionales

### Integración React
- **useFlow Hook**: Hook de React para gestión de estado del flujo
- **ViewRenderer**: Renderizado dinámico de componentes
- **Manejo de formularios**: Generación automática de formularios y validación
- **Debug de estado**: Inspección de estado del flujo en tiempo real
- **Manejo de eventos**: Interacción del usuario y navegación
- **Actualizaciones de contexto**: Sincronización automática del contexto

## Desarrollo

### Validar ejemplos de flujos

```bash
# Validar todos los ejemplos de flujos
pnpm validate:examples

# Validar flujo específico
pnpm validate:flow examples/updated-flow-example.json
```

### Construir el demo de React

```bash
# Construir el demo de React
pnpm --filter @xflows/react-demo build

# Previsualizar el demo construido
pnpm --filter @xflows/react-demo preview
```

---

**Estos ejemplos sirven tanto como material de aprendizaje como plantillas copy-paste para implementaciones reales de XFlows.**