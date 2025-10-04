# 📋 XFlows JSON Schemas

## 🎯 Purpose

Esta carpeta contiene todos los esquemas JSON utilizados por el sistema XFlows para validación y configuración. Los esquemas están organizados por versión para permitir evolución controlada.

## 📁 Structure

```
schemas/
├── v1/                           # Version 1 schemas
│   ├── types.ts                 # TypeScript type definitions
│   ├── plugins.json            # Plugin system schemas  
│   ├── flows.json              # Flow configuration schemas
│   ├── json-logic.json         # JSON Logic expression schemas
│   ├── templates.json          # Template and EJS schemas
│   │   └── examples/           # Example configurations
│   │       └── insurance-flow.json # Complete insurance flow example
│   └── README.md               # Schema documentation
└── README.md                   # This file
```

## 🔧 Schema Versions

### v1 (Current)
- **Plugins**: AWS, Google, Slack, SendGrid, MySQL plugins
- **Flows**: Complete state machine configuration
- **JSON Logic**: Business rules and conditional logic
- **Templates**: EJS templates and dynamic content
- **Examples**: Real-world insurance flow implementation

## 📖 Usage

### Validating Plugin Configuration

```typescript
import Ajv from 'ajv';
import pluginSchema from './v1/plugins.json';

const ajv = new Ajv();
const validatePlugin = ajv.compile(pluginSchema.definitions.awsS3Config);

const isValid = validatePlugin({
  bucket: 'my-insurance-bucket',
  region: 'us-east-1',
  accessKeyId: 'AKIA...',
  secretAccessKey: 'secret...'
});
```

### ValidATING Flow Configuration

```typescript
import ajv from 'ajv-formats';
import flowSchema from './v1/flows.json';

const ajv = new Ajv();
ajv.addFormat("email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
const validateFlow = ajv.compile(flowSchema.definitions.flowConfig);

const isValid = validateFlow({
  id: 'my-flow',
  initial: 'start',
  context: {},
  states: { /* ... */ }
});
```

### Generating TypeScript Types

```bash
# Install json-schema-to-typescript
npm install -g json-schema-to-typescript

# Generate types from schemas
json2ts schemas/v1/plugins.json src/types/plugin-schemas.d.ts
json2ts schemas/v1/flows.json src/types/flow-schemas.d.ts
```

## 🏗️ Schema Architecture

### 🎨 Design Principles

1. **Versioning**: Clear semantic versioning with backward compatibility
2. **Modularity**: Separate schemas for different concerns (plugins, flows, logic)
3. **Extensibility**: Easy to extend with new properties without breaking changes
4. **Validation**: Strict validation with helpful error messages
5. **Documentation**: Rich descriptions and examples in each schema

### 📋 Schema Categories

#### 🔌 Plugin Schemas (`plugins.json`)
- **Plugin Metadata**: Core plugin information and configuration
- **AWS Services**: S3, CloudWatch, SES, Textract configurations
- **Google Services**: Analytics, Sheets configurations  
- **Third-party**: Slack, SendGrid, MySQL configurations

#### 🔄 Flow Schemas (`flows.json`)
- **Flow Configuration**: Overall flow structure and metadata
- **State Configuration**: Individual state definitions
- **Plugin Integration**: Plugin invocation, UI, and action configurations
- **Transition Logic**: State transitions and guards

#### 🧠 JSON Logic Schemas (`json-logic.json`)
- **Expression Structure**: JSON Logic expression validation
- **Operators**: Binary, unary, logical, comparison operators
- **Variables**: Context variable definitions and scoping
- **Business Rules**: Rule definitions and validation

#### 🎨 Template Schemas (`templates.json`)
- **Template Configuration**: EJS template structure and context
- **Filters**: Template filter definitions and parameters
- **Functions**: Custom template functions and implementations
- **Output Formats**: HTML, text, JSON output configurations

## 🔧 Development

### Adding New Schemas

1. **Create schema file** in `v1/` directory
2. **Add TypeScript types** to `types.ts`
3. **Include examples** in `examples/` folder
4. **Update this README** with schema description
5. **Test validation** with example configurations

### Schema Best Practices

```json
{
  "$schema": "https://json-schema.org/draft/2019-09/schema",
  "$id": "https://schemas.xflows.com/v1/new-schema",
  "title": "Descriptive Schema Name",
  "description": "Clear description of purpose",
  "version": "1.0.0",
  "author": "XFlows Development Team",
  "lastUpdated": "2024-12-19T15:00:00Z",
  
  "definitions": {
    "yourDefinition": {
      "type": "object",
      "properties": {
        "requiredProperty": {
          "type": "string",
          "description": "Required property description"
        },
        "optionalProperty": {
          "type": "string",
          "description": "Optional property description",
          "default": "defaultValue"
        }
      },
      "required": ["requiredProperty"],
      "additionalProperties": false
    }
  }
}
```

### Validation Testing

```bash
# Validate example configurations
ajv-validate schemas/v1/flows.json schemas/v1/examples/insurance-flow.json

# Test schema against invalid data
ajv-validate schemas/v1/plugins.json test-data/invalid-config.json

# Run all schema tests
npm run test:schemas
```

## 🚀 Integration

### VS Code Support

Add to workspace settings for schema validation:

```json
{
  "json.schemas": [
    {
      "fileMatch": ["**/plugins/**/*.json"],
      "url": "./schemas/v1/plugins.json"
    },
    {
      "fileMatch": ["**/flows/**/*.json"], 
      "url": "./schemas/v1/flows.json"
    },
    {
      "fileMatch": ["**/business-rules/**/*.json"],
      "url": "./schemas/v1/json-logic.json"
    }
  ]
}
```

### CI/CD Integration

```yaml
# GitHub Actions schema validation
name: Schema Validation
on: [push, pull_request]
jobs:
  validate-schemas:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install AJV CLI
        run: npm install -g ajv-cli
      - name: Validate Schema Files
        run: |
          ajv compile -s schemas/v1/plugins.json
          ajv compile -s schemas/v1/flows.json
          ajv compile -s schemas/v1/json-logic.json
          ajv compile -s schemas/v1/templates.json
```

## 📚 Examples

### Complete Insurance Flow

El archivo `examples/insurance-flow.json` contiene un ejemplo completo de configuración de flujo de seguros con integración completa de plugins:

```json
{
  "flowConfig": {
    "id": "insuranceSalesFlow",
    "initial": "quote.start",
    "context": { /* ... */ },
    "states": {
      "risk.validation": {
        "pluginInvoke": [{
          "id": "documentAnalyzer",
          "pluginId": "aws-textract",
          "pluginType": "tool",
          "config": { /* ... */ }
        }]
      }
    },
    "plugins": {
      "tools": {
        "documentAnalyzer": { /* plugin configuration */ }
      }
    }
  }
}
```

Este ejemplo demuestra:
- ✅ **Plugin Integration** - AWS Textract, CloudWatch, Google Analytics
- ✅ **State Management** - Complete flow with error handling
- ✅ **Business Logic** - Risk validation with ML integration
- ✅ **Notifications** - Slack notifications for manual review
- ✅ **Data Storage** - MySQL policy creation with email confirmations

## 🔄 Versioning Strategy

### Major Version Changes (v1 → v2)
- Breaking changes in schema structure
- Removal of deprecated properties
- Fundamental architectural changes

### Minor Version Changes (v1.0 → v1.1)
- Addition of new optional properties
- New schema definitions
- Enhanced validation rules

### Patch Version Changes (v1.0.0 → v1.0.1)
- Bug fixes in validation rules
- Documentation updates
- Example improvements

## 🎯 Future Plans

- **v1.1**: Enhanced validation rules, additional plugins
- **v1.2**: Performance optimization schemas  
- **v1.3**: Multi-language template schemas
- **v2.0**: Breaking changes for plugin architecture v2

---

*Este documento es parte del sistema de schemas XFlows v1. Para más información, consulta la [documentación principal](../README.md).*
