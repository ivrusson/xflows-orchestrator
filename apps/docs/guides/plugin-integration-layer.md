# 🎯 XFlows - Capa de Integración Plugin-XState

## 🎯 Problema Identificado

### ❌ **Problema Actual:**
- HTTP mezclado directamente en la configuración
- No hay capa clara de integración plugin-XState
- Plugins no pueden afectar el contexto de XState
- Falta abstracción entre plugins y máquina de estados

### ✅ **Solución: Capa de Integración**
- **HTTP como plugin** independiente
- **Capa de integración** que conecta plugins con XState
- **Plugins pueden afectar contexto** de XState
- **Abstracción clara** entre plugins y máquina

---

## 🏗️ Arquitectura con Capa de Integración

### **Estructura JSON con Plugins:**

```typescript
const flowConfig = {
  id: 'insurance-quote',
  name: 'Insurance Quote Flow',
  
  // Contexto inicial
  initialContext: {
    applicant: {},
    quote: {},
    errors: [],
    retryCount: 0
  },
  
  // Steps del flujo
  steps: [
    {
      id: 'collect-info',
      name: 'Collect Applicant Information',
      type: 'form',
      
      // View configuration
      view: {
        title: 'Personal Information',
        fields: [
          {
            name: 'name',
            label: 'Full Name',
            type: 'text',
            required: true
          },
          {
            name: 'age',
            label: 'Age',
            type: 'number',
            required: true,
            min: 18,
            max: 80
          },
          {
            name: 'email',
            label: 'Email Address',
            type: 'email',
            required: true
          }
        ],
        submitButton: {
          text: 'Continue',
          event: 'SUBMIT'
        }
      },
      
      // Transiciones desde este step
      transitions: {
        SUBMIT: {
          target: 'validate',
          actions: [
            'assignApplicantData',
            'clearErrors',
            'trackFormSubmission'
          ]
        }
      }
    },
    
    {
      id: 'validate',
      name: 'Validate Applicant Data',
      type: 'processing',
      
      // View configuration
      view: {
        title: 'Validating Information',
        description: 'Please wait while we validate your information',
        loadingMessage: 'Validating applicant data...',
        showProgress: true
      },
      
      // Invoke con plugin HTTP
      invoke: {
        id: 'validateApplicant',
        src: 'httpPlugin',  // Plugin HTTP
        input: {
          // Configuración del plugin HTTP
          method: 'POST',
          url: '/api/validate-applicant',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer {{context.authToken}}'
          },
          body: {
            applicant: '{{context.applicant}}',
            timestamp: '{{context.timestamp}}'
          },
          timeoutMs: 30000,
          retry: {
            max: 3,
            backoffMs: 1000
          },
          cacheTtlMs: 30000,
          expect: {
            status: 200,
            schema: 'ValidationResponseSchema'
          },
          // Mapeo de resultado a contexto XState
          mapToContext: {
            'validationResult': '$.data',
            'validationStatus': '$.status',
            'validationTimestamp': '$.timestamp'
          }
        },
        onDone: {
          target: 'calculate-premium',
          actions: 'assignValidationResult'
        },
        onError: {
          target: 'show-errors',
          actions: 'assignValidationErrors'
        }
      },
      
      // Timeout configuration
      timeout: {
        duration: 30000,
        message: 'Validation is taking longer than expected'
      }
    },
    
    {
      id: 'calculate-premium',
      name: 'Calculate Insurance Premium',
      type: 'processing',
      
      // View configuration
      view: {
        title: 'Calculating Premium',
        description: 'We are calculating your insurance premium',
        loadingMessage: 'Calculating premium...',
        showProgress: true
      },
      
      // Invoke con plugin HTTP
      invoke: {
        id: 'calculatePremium',
        src: 'httpPlugin',  // Plugin HTTP
        input: {
          method: 'POST',
          url: '/api/calculate-premium',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer {{context.authToken}}'
          },
          body: {
            applicant: '{{context.applicant}}',
            validationResult: '{{context.validationResult}}'
          },
          timeoutMs: 45000,
          retry: {
            max: 2,
            backoffMs: 2000
          },
          expect: {
            status: 200,
            schema: 'QuoteResponseSchema'
          },
          // Mapeo de resultado a contexto XState
          mapToContext: {
            'quote': '$.data.quote',
            'quoteId': '$.data.quoteId',
            'expirationDate': '$.data.expirationDate'
          }
        },
        onDone: {
          target: 'show-quote',
          actions: 'assignQuoteData'
        },
        onError: {
          target: 'retry-calculation',
          actions: 'assignCalculationError'
        }
      }
    },
    
    {
      id: 'show-quote',
      name: 'Display Insurance Quote',
      type: 'display',
      
      // View configuration con Mustache templates
      view: {
        title: 'Your Insurance Quote',
        description: 'Here is your personalized insurance quote',
        template: `
          <div class="quote-display">
            <h2>{{quote.title}}</h2>
            <div class="quote-details">
              <p><strong>Premium:</strong> ${{quote.premium}}/month</p>
              <p><strong>Coverage:</strong> ${{quote.coverageAmount}}</p>
              <p><strong>Policy Type:</strong> {{quote.type}}</p>
              <p><strong>Valid Until:</strong> {{quote.expirationDate}}</p>
            </div>
            <div class="actions">
              <button onclick="send('ACCEPT')" class="primary">
                Accept Quote
              </button>
              <button onclick="send('MODIFY')" class="secondary">
                Modify Quote
              </button>
            </div>
          </div>
        `,
        buttons: [
          {
            text: 'Accept Quote',
            event: 'ACCEPT',
            primary: true
          },
          {
            text: 'Modify Quote',
            event: 'MODIFY',
            secondary: true
          }
        ]
      },
      
      // Transiciones desde este step
      transitions: {
        ACCEPT: {
          target: 'processing',
          actions: [
            'trackQuoteAcceptance',
            'assignAcceptanceData'
          ]
        },
        MODIFY: {
          target: 'collect-info',
          actions: 'trackQuoteModification'
        }
      }
    }
  ],
  
  // Configuración global
  config: {
    initialStep: 'collect-info',
    finalSteps: ['completed', 'cancelled', 'show-error'],
    timeoutSteps: ['validate', 'calculate-premium', 'processing']
  }
};
```

---

## 🔌 Sistema de Plugins con Capa de Integración

### **Plugin HTTP:**

```typescript
class HttpPlugin {
  name = 'httpPlugin';
  
  async execute(input: HttpPluginInput, context: any) {
    const {
      method,
      url,
      headers,
      body,
      timeoutMs,
      retry,
      cacheTtlMs,
      expect,
      mapToContext
    } = input;
    
    try {
      // Ejecutar request HTTP
      const response = await this.makeRequest({
        method,
        url: this.interpolate(url, context),
        headers: this.interpolate(headers, context),
        body: this.interpolate(body, context),
        timeoutMs
      });
      
      // Validar respuesta
      if (expect) {
        this.validateResponse(response, expect);
      }
      
      // Mapear resultado a contexto
      const mappedResult = this.mapResult(response.data, mapToContext);
      
      return {
        success: true,
        data: response.data,
        mappedContext: mappedResult
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: null,
        mappedContext: null
      };
    }
  }
  
  private async makeRequest(config: any) {
    // Implementación del request HTTP
    const response = await fetch(config.url, {
      method: config.method,
      headers: config.headers,
      body: JSON.stringify(config.body),
      signal: AbortSignal.timeout(config.timeoutMs)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return {
      data: await response.json(),
      status: response.status,
      headers: response.headers
    };
  }
  
  private interpolate(template: any, context: any) {
    // Interpolación de variables del contexto
    if (typeof template === 'string') {
      return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
        return this.getNestedValue(context, path.trim());
      });
    }
    
    if (typeof template === 'object' && template !== null) {
      const result = {};
      for (const [key, value] of Object.entries(template)) {
        result[key] = this.interpolate(value, context);
      }
      return result;
    }
    
    return template;
  }
  
  private getNestedValue(obj: any, path: string) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }
  
  private validateResponse(response: any, expect: any) {
    if (expect.status && response.status !== expect.status) {
      throw new Error(`Expected status ${expect.status}, got ${response.status}`);
    }
    
    if (expect.schema) {
      // Validar schema si está definido
      this.validateSchema(response.data, expect.schema);
    }
  }
  
  private mapResult(data: any, mapToContext: any) {
    if (!mapToContext) return {};
    
    const result = {};
    for (const [contextKey, dataPath] of Object.entries(mapToContext)) {
      result[contextKey] = this.getNestedValue(data, dataPath);
    }
    return result;
  }
  
  private validateSchema(data: any, schema: string) {
    // Implementar validación de schema
    console.log(`Validating data against schema: ${schema}`);
  }
}
```

---

## 🔄 Capa de Integración Plugin-XState

### **Plugin Manager:**

```typescript
class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private contextUpdater: ContextUpdater;
  
  constructor(contextUpdater: ContextUpdater) {
    this.contextUpdater = contextUpdater;
    this.registerDefaultPlugins();
  }
  
  private registerDefaultPlugins() {
    // Registrar plugin HTTP
    this.plugins.set('httpPlugin', new HttpPlugin());
    
    // Registrar plugin de validación
    this.plugins.set('validationPlugin', new ValidationPlugin());
    
    // Registrar plugin de template
    this.plugins.set('templatePlugin', new TemplatePlugin());
    
    // Registrar plugin personalizado
    this.plugins.set('customPlugin', new CustomPlugin());
  }
  
  async executePlugin(pluginName: string, input: any, context: any) {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not found`);
    }
    
    // Ejecutar plugin
    const result = await plugin.execute(input, context);
    
    // Si el plugin tiene mapeo de contexto, actualizar XState
    if (result.mappedContext) {
      await this.contextUpdater.updateContext(result.mappedContext);
    }
    
    return result;
  }
  
  registerPlugin(name: string, plugin: Plugin) {
    this.plugins.set(name, plugin);
  }
}
```

### **Context Updater:**

```typescript
class ContextUpdater {
  private send: (event: any) => void;
  
  constructor(send: (event: any) => void) {
    this.send = send;
  }
  
  async updateContext(mappedContext: any) {
    // Enviar evento para actualizar contexto en XState
    this.send({
      type: 'UPDATE_CONTEXT',
      data: mappedContext
    });
  }
}
```

---

## 🎯 Factory de Máquinas con Integración de Plugins

### **Conversión Steps a XState:**

```typescript
function createFlowMachineFromSteps(flowConfig: any, pluginManager: PluginManager) {
  const states = {};
  
  // Convertir cada step a estado XState
  for (const step of flowConfig.steps) {
    states[step.id] = {
      // Meta información del step
      meta: {
        stepName: step.name,
        stepType: step.type,
        view: step.view
      },
      
      // Transiciones
      on: {
        UPDATE_CONTEXT: {
          actions: 'updateContextFromPlugin'
        }
      },
      
      // Invoke con plugin
      invoke: step.invoke ? {
        id: step.invoke.id,
        src: 'executePlugin',
        input: {
          pluginName: step.invoke.src,
          pluginInput: step.invoke.input
        },
        onDone: {
          target: step.invoke.onDone?.target,
          actions: step.invoke.onDone?.actions
        },
        onError: {
          target: step.invoke.onError?.target,
          actions: step.invoke.onError?.actions
        }
      } : undefined,
      
      // Timeout si existe
      after: step.timeout ? {
        [step.timeout.duration]: {
          target: step.transitions.TIMEOUT?.target,
          actions: step.transitions.TIMEOUT?.actions
        }
      } : undefined,
      
      // Tipo de estado
      type: step.type === 'final' ? 'final' : undefined
    };
    
    // Procesar transiciones
    if (step.transitions) {
      for (const [event, transition] of Object.entries(step.transitions)) {
        if (event !== 'SUCCESS' && event !== 'ERROR' && event !== 'TIMEOUT') {
          states[step.id].on[event] = {
            target: transition.target,
            actions: transition.actions
          };
        }
      }
    }
  }
  
  return createMachine({
    id: flowConfig.id,
    initial: flowConfig.config.initialStep,
    context: flowConfig.initialContext,
    states,
    
    // Actores
    actors: {
      executePlugin: fromPromise(async ({ input }) => {
        const { pluginName, pluginInput } = input;
        return await pluginManager.executePlugin(pluginName, pluginInput, context);
      })
    },
    
    // Acciones
    actions: {
      updateContextFromPlugin: assign((context, event) => ({
        ...context,
        ...event.data
      })),
      
      assignApplicantData: assign({
        applicant: (_, event) => event.data
      }),
      
      clearErrors: assign({
        errors: []
      }),
      
      trackFormSubmission: (context, event) => {
        analytics.track('form_submitted', {
          userId: context.userId,
          formData: event.data
        });
      },
      
      assignValidationResult: assign({
        validationResult: (_, event) => event.output.data
      }),
      
      assignValidationErrors: assign({
        errors: (_, event) => [event.error]
      }),
      
      assignQuoteData: assign({
        quote: (_, event) => event.output.data
      }),
      
      assignCalculationError: assign({
        errors: (_, event) => [event.error]
      }),
      
      trackQuoteAcceptance: (context, event) => {
        analytics.track('quote_accepted', {
          userId: context.userId,
          quoteId: context.quote.id,
          premium: context.quote.premium
        });
      },
      
      assignAcceptanceData: assign({
        acceptanceData: (_, event) => ({
          timestamp: Date.now(),
          quoteId: context.quote.id
        })
      }),
      
      trackQuoteModification: (context, event) => {
        analytics.track('quote_modified', {
          userId: context.userId,
          quoteId: context.quote.id
        });
      }
    }
  });
}
```

---

## 🎯 Ventajas de la Capa de Integración

### ✅ **Plugins Independientes**
- **HTTP como plugin** separado
- **Plugins pueden afectar contexto** de XState
- **Abstracción clara** entre plugins y máquina
- **Fácil agregar nuevos plugins**

### ✅ **Capa de Integración Robusta**
- **PluginManager** maneja ejecución
- **ContextUpdater** actualiza XState
- **Mapeo automático** de resultados
- **Manejo de errores** centralizado

### ✅ **Flexibilidad Total**
- **Plugins configurables** desde JSON
- **Mapeo de contexto** automático
- **Validación de respuestas** integrada
- **Retry y cache** en plugins

### ✅ **Separación Clara**
- **Steps** definen flujo
- **Plugins** manejan lógica externa
- **Capa de integración** conecta ambos
- **XState** maneja estados

---

## 🎯 Conclusión

La **capa de integración** es la clave:

1. **HTTP como plugin** independiente
2. **PluginManager** ejecuta plugins
3. **ContextUpdater** actualiza XState
4. **Mapeo automático** de resultados
5. **Abstracción clara** entre capas

**Resultado:** Sistema **modular y extensible** donde **plugins pueden afectar XState** de manera controlada.

¿Te parece correcta esta capa de integración?
