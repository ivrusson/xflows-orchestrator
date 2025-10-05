# XFlows JSON Schemas

Esta carpeta contiene los esquemas JSON para validación y configuración del sistema XFlows.

## Estructura

```
schemas/
├── v1/
│   └── flows.json              # Schema de configuración de flujos
├── validate.js                 # Herramienta de validación
└── README.md                   # Este archivo
```

## Uso

### Validación de configuración de flujos

```typescript
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import flowSchema from './v1/flows.json';

const ajv = new Ajv();
addFormats(ajv);
const validateFlow = ajv.compile(flowSchema);

const isValid = validateFlow({
  id: 'my-flow',
  name: 'My Flow',
  initialStep: 'welcome',
  context: {},
  states: { /* ... */ }
});
```

### Soporte en VS Code

```json
{
  "json.schemas": [
    {
      "fileMatch": ["**/flows/**/*.json"], 
      "url": "./schemas/v1/flows.json"
    }
  ]
}
```
