/**
 * 🚀 Approach 3: Hybrid Flow Machine
 * 
 * Esta aproximación híbrida combina lo mejor de los dos approaches anteriores:
 * - Estructura JSON declarativa (como Approach 2)
 * - Lifecycle hooks completos y tipado fuerte (como Approach 1)
 * - Semántica cercana a XState para evitar confusión
 * - Sistema de actions, guards y actors estándar
 * 
 * Características clave:
 * ✅ Lifecycle hooks explícitos (onEnter, onExit)
 * ✅ Data binding inteligente (inputs/outputs)
 * ✅ Sistema de guards y actions estándar
 * ✅ Actors async (HTTP, timers, promises)
 * ✅ Estados compuestos y jerarquía
 * ✅ Auto-transitions con delay
 * ✅ Meta información rica para UI
 * ✅ Tipado fuerte con TypeScript
 */

import { assign, createMachine, fromPromise } from 'xstate';
import jsonLogic, { type RulesLogic } from 'json-logic-js';
import { HybridTemplateEngine } from '../../core/templating/templateEngine';

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

/**
 * Configuración principal para máquinas híbridas
 */
export interface HybridFlowConfig {
  id: string;                             // Identificador único de la máquina
  initial: string;                         // Estado inicial
  context: Record<string, unknown>;         // Contexto inicial de XState
  states: Record<string, HybridStateConfig>; // Definición de estados
  guards?: Record<string, string | RulesLogic>; // Referencias a guards o JSON Logic
  actions?: Record<string, string>;        // Referencias a actions estándar
  actors?: Record<string, HybridActorConfig>; // Referencias a actores async
  
  // Sistema de templating y lógica avanzada
  templates?: Record<string, string>;      // Templates EJS configurables
  jsonLogic?: Record<string, RulesLogic>;  // Expresiones JSON Logic predefinidas
}

/**
 * Configuración de estado individual
 */
export interface HybridStateConfig {
  // Tipo de estado (semántica XState nativa)
  type?: 'final' | 'compound' | 'atomic';
  
  // Meta información para UI
  meta?: {
    view?: {
      moduleId: string;    // ID del microfrontend a cargar
      component?: string;   // Component específico dentro del MFE
      slot?: string;       // Slot donde renderizar (main, sidebar, etc.)
    };
    description?: string;   // Descripción legible del estado
    icon?: string;         // Icon para UI debugging
  };

  // Lifecycle hooks explícitos
  lifecycle?: {
    onEnter?: string[];    // Referencias a actions a ejecutar al entrar
    onExit?: string[];     // Referencias a actions a ejecutar al salir
  };

  // Data binding inteligente
  binding?: {
    inputs?: Array<{
      source: string;      // Origen: 'context.field' | 'url.query' | 'localStorage.key'
      target: string;      // Destino: 'context.field'
      transform?: string;  // Referencia a función de transformación
    }>;
    outputs?: Array<{
      source: string;      // Origen: 'context.field'
      target: string;      // Destino: 'url.query' | 'localStorage.key'
    }>;
  };

  // Invoking services/services externos
  invoke): Array<{
    id: string;
    src: string;           // Referencia a actor definido
    input?: Record<string, unknown>;
    onDone?: string | HybridTransitionConfig;
    onError?: string | HybridTransitionConfig;
  }>;

  // Transiciones con contexto
  on?: Record<string, string | HybridTransitionConfig>;

  // Estados hijos/sub-estados (compound states)
  states?: Record<string, HybridStateConfig>;

  // Auto-forward después de delay
  after?: Array<{
    delay: number;         // Milisegundos
    target: string;        // Estado destino
    description?: string;
  }>;

  // Activities continuas
  activities?: string[];   // Referencias a activities
  
  // Sistema de lógica avanzada por estado
  logic?: {
    // Condiciones JSON Logic dinámicas
    conditions?: Array<{
      name: string;                     // Nombre de la condición
      expression: RulesLogic;           // Expresión JSON Logic
      description?: string;             // Descripción legible
    }>;
    
    // Computed properties del estado
    computed?: Array<{
      field: string;                     // Campo donde guardar resultado
      expression: RulesLogic;            // Expresión para calcular valor
      cache?: boolean;                  // ¿Cachear resultado?
    }>;
    
    // Validaciones automáticas
    validations?: Array<{
      field: string;                     // Campo a validar
      expression: RulesLogic;            // Regla de validación
      errorMessage: string;              // Mensaje si falla
    }>;
  };
  
  // Sistema de UI dinámico
  ui?: {
    // Templates para contenido dinámico
    title?: string;                      // Template EJS para título
    subtitle?: string;                   // Template EJS para subtítulo
    fields?: Array<{
      name: string;                      // Nombre del campo
      type: string;                      // Tipo: text, number, select, etc.
      template?: string;                 // Template EJS para valor
      visibility?: RulesLogic;           // Regla JSON Logic para mostrar/ocultar
    }>;
    
    // Botones dinámicos
    buttons?: Array<{
      text: string;                      // Template EJS para texto
      event: string;                     // Evento XState
      visibility?: RulesLogic;           // Regla JSON Logic para mostrar/ocultar
      enabled?: RulesLogic;              // Regla JSON Logic para habilitar/deshabilitar
      style?: string;                    // Clases CSS
    }>;
  };
}

/**
 * Configuración de transición con metadata
 */
export interface HybridTransitionConfig {
  target: string;          // Estado destino
  actions?: string[];      // Referencias a actions
  cond?: string;           // Referencia a guard
  description?: string;    // Descripción de la transición
  
  // Data transformation en transición
  transform?: {
    context?: Record<string, string>; // target: source expressions
    preserve?: string[];               // Campos a preservar
  };
}

/**
 * Configuración de actores asíncronos
 */
export interface HybridActorConfig {
  type: 'promise' | 'http' | 'websocket' | 'timer';
  config?: Record<string, unknown>;
  
  // Para actors de tipo promise
  promise?: () => Promise<unknown>;
  
  // Para actors de tipo http
  http?: {
    url: string;
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  };
  
  // Para actors de tipo timer
  timer?: {
    interval?: number;
    timeout?: number;
  };
}

// ============================================================================
// SISTEMA DE GUARDS ESTÁNDAR
// ============================================================================

/**
 * Template engine global para evaluación dinámica
 */
const templateEngine = new HybridTemplateEngine();

/**
 * Colección de guards estándar + JSON Logic para validaciones avanzadas
 */
const guards = {
  /**
   * Verifica si un campo es null o undefined
   */
  isNull: (context: any, field: string) => {
    const value = getNestedValue(context, field);
    return value === null || value === undefined;
  },
  
  /**
   * Verifica si un campo tiene valor
   */
  isNotNull: (context: any, field: string) => {
    const value = getNestedValue(context, field);
    return value !== null && value !== undefined;
  },
  
  /**
   * Verifica si un campo es truthy
   */
  isTruthy: (context: any, field: string) => {
    const value = getNestedValue(context, field);
    return Boolean(value);
  },
  
  /**
   * Verifica si un campo es falsy
   */
  isFalsy: (context: any, field: string) => {
    const value = getNestedValue(context, field);
    return !Boolean(value);
  },
  
  /**
   * Compara igualdad exacta
   */
  equals: (context: any, field: string, expected: unknown) => {
    const value = getNestedValue(context, field);
    return value === expected;
  },
  
  /**
   * Compara mayor que
   */
  greaterThan: (context: any, field: string, threshold: number) => {
    const value = getNestedValue(context, field);
    return Number(value) > threshold;
  },

  /**
   * Compara menor que
   */
  lessThan: (context: any, field: string, threshold: number) => {
    const value = getNestedValue(context, field);
    return Number(value) < threshold;
  },
  
  /**
   * Verifica longitud mínima de string
   */
  hasMinLength: (context: any, field: string, minLength: number) => {
    const value = getNestedValue(context, field);
    return typeof value === 'string' && value.length >= minLength;
  },

  // ============================================================================
  // GUARDS AVANZADOS CON JSON LOGIC
  // ============================================================================

  /**
   * Evaluador de JSON Logic genérico
   */
  evaluateJsonLogic: (context: any, expression: RulesLogic) => {
    try {
      return templateEngine.evaluateJsonLogic(expression, context);
    } catch (error) {
      console.error('[JSON Logic Evaluation Error]', error);
      return false;
    }
  },

  /**
   * Guard para validaciones de cliente
   */
  isValidClient: (context: any) => {
    const expression: RulesLogic = {
      "and": [
        {"!=": { "var": "session.userId" }, null},
        {"!=": { "var": "session.token" }, ""},
        {"startsWith": [{"var": "applicant.email"}, "validator@"]}
      ]
    };
    return templateEngine.evaluateJsonLogic(expression, context);
  },

  /**
   * Guard para riesgo calculado dinámicamente
   */
  isAcceptableRisk: (context: any) => {
    const riskScore = getNestedValue(context, 'riskScore') || 0;
    const userAge = getNestedValue(context, 'applicant.age') || 0;
    const coverageAmount = getNestedValue(context, 'quote.coverageAmount') || 0;

    const expression: RulesLogic = {
      "and": [
        {"<=": [{"var": "riskScore"}, 80]},                    // Riesgo bajo
        {"<==": [{"var": "applicant.age"}, 65]},               // Edad aceptable
        {"<=": [{"var": "quote.coverageAmount"}, 500000]}      // Cobertura razonable
      ]
    };
    return templateEngine.evaluateJsonLogic(expression, context);
  },

  /**
   * Guard para datos de cotización válidos
   */
  hasValidQuoteData: (context: any) => {
    const expression: RulesLogic = {
      "and": [
        {"if": [
          {"==": [{"var": "quote.type"}, "life"]},              // Si es vida
          {"and": [
            {">": [{"var": "applicant.age"}, 18]},              // Mayor de edad
            {"<=": [{"var": "applicant.age"}, 70]}              // Menor de 65
          ]},
          {"and": [
            {">": [{"var": "applicant.age"}, 21]},              // Mayor de 21 para otros tipos
            {">=": [{"var": "quote.termLength"}, 5]}             // Término mínimo
          ]}
        ]},
        {"!=": { "var": "quote.coverageAmount" }, ""},          // Monto definido
        {">": [{ "var": "quote.coverageAmount" }, 1000]}        // Mínimo $1000
      ]
    };
    return templateEngine.evaluateJsonLogic(expression, context);
  },

  /**
   * Guard para documentos completos
   */
  hasRequiredDocuments: (context: any) => {
    const expression: RulesLogic = {
      "and": [
        {"!=": [{ "var": "applicant.idDocument" }, ""]},        // ID presente
        {"if": [
          {">=": [{"var": "quote.coverageAmount"}, 100000]},    // Si cobertura alta
          {"!=": [{ "var": "applicant.incomeProof" }, ""]},     // Requiere comprobante
          true                                                  // Si no, válido
        ]},
        {"if": [
          {"==": [{"var": "applicant.country"}, "MEX"]},        // Si es México
          {"!=": [{ "var": "applicant.rfc" }, ""]},             // Requiere RFC
          true                                                  // Si no México, válido
        ]}
      ]
    };
    return templateEngine.evaluateJsonLogic(expression, context);
  },

  /**
   * Guard para evaluación de negocio
   */
  isBusinessAcceptable: (context: any) => {
    const expression: RulesLogic = {
      "or": [
        {"==": [{"var": "applicant.clientType"}, "individual"]}, // Cliente individual siempre OK
        {
          "and": [                                                // Cliente business con validaciones
            {"!=": [{ "var": "applicant.businessLicense" }, ""]},
            {">=": [{"var": "applicant.revenue"}, 500000]},      // Revenue mínimo
            {"in": [                                              // Seguro aceptado para business
              {"var": "quote.type"}, 
              ["liability", "property", "workers-comp"]
            ]}
          ]
        }
      ]
    };
    return templateEngine.evaluateJsonLogic(expression, context);
  }
};

// ============================================================================
// SISTEMA DE ACTIONS ESTÁNDAR
// ============================================================================

/**
 * Colección de actions estándar para manipulaciones de contexto
 */
const actions = {
  /**
   * Asigna valor a campo del contexto
   */
  assignField: assign((context: any, { field, value }: { field: string; value: unknown }) => {
    const newContext = { ...context };
    setNestedValue(newContext, field, value);
    return newContext;
  }),
  
  /**
   * Genera ID único con prefijo
   */
  generateId: assign((context: any, { field, prefix }: { field: string; prefix: string }) => {
    const newContext = { ...context };
    setNestedValue(newContext, field, `${prefix}-${Date.now()}`);
    return newContext;
  }),
  
  /**
   * Copia valor entre campos
   */
  copyField: assign((context: any, { from, to }: { from: string; to: string }) => {
    const newContext = { ...context };
    const value = getNestedValue(newContext, from);
    setNestedValue(newContext, to, value);
    return newContext;
  }),
  
  /**
   * Limpia campo (asigna null)
   */
  clearField: assign((context: any, { field }: { field: string }) => {
    const newContext = { ...context };
    setNestedValue(newContext, field, null);
    return newContext;
  }),
  
  /**
   * Agrega elemento a array
   */
  accumulateArray: assign((context: any, { field, value }: { field: string; value: unknown }) => {
    const newContext = { ...context };
    const array = getNestedValue(newContext, field) || [];
    array.push(value);
    setNestedValue(newContext, field, array);
    return newContext;
  }),
  
  /**
   * Log con contexto
   */
  log: (context: any, { message, data }: { message: string; data?: unknown }) => {
    console.log(`[${new Date().toISOString()}] ${message}`, data || context);
  },

  // ============================================================================
  // ACTIONS AVANZADOS CON TEMPLATING Y JSON LOGIC
  // ============================================================================

  /**
   * Renderizar template EJS y asignar resultado
   */
  renderTemplate: assign((context: any, { template, target, data }: { 
    template: string; 
    target: string; 
    data?: Record<string, unknown> 
  }) => {
    try {
      const rendered = templateEngine.renderEjsTemplate(template, { ...context, ...data });
      const newContext = { ...context };
      setNestedValue(newContext, target, rendered);
      return newContext;
    } catch (error) {
      console.error('[Template Rendering Error]', error);
      return context;
    }
  }),

  /**
   * Evaluar expresión JSON Logic y guardar resultado
   */
  evaluateLogic: assign((context: any, { expression, target }: { 
    expression: RulesLogic; 
    target: string; 
  }) => {
    try {
      const result = templateEngine.evaluateJsonLogic(expression, context);
      const newContext = { ...context };
      setNestedValue(newContext, target, result);
      return newContext;
    } catch (error) {
      console.error('[JSON Logic Evaluation Error]', error);
      return context;
    }
  }),

  /**
   * Calcular premium dinámico usando JSON Logic
   */
  calculatePremium: assign((context: any) => {
    try {
      const contextData = {
        ...context,
        baseRate: 100,              // Tasa base por $1000 de cobertura
        ageMultipliers: {           // Multiplicadores por edad
          20: 1.0, 30: 1.2, 40: 1.5, 50: 2.0, 60: 3.0
        }
      };

      // Lógica compleja para calcular premium
      const premiumExpression: RulesLogic = {
        "+": [
          {"map": [
            {"var": "quote.coverageAmounts"},
            {
              "*": [
                {"var": ""},                                        // Amount
                {"var": "baseRate"},                                 // Base rate
                {
                  "if": [
                    {"==": [{"var": "quote.type"}, "life"]},         // Si es vida
                    {
                      "if": [
                        {"<=": [{"var": "applicant.age"}, 30]},      // Si joven
                        1.2,                                          // Multiplicador joven
                        2.0                                           // Multiplicador adulto
                      ]
                    },
                    {
                      "if": [
                        {"==": [{"var": "quote.type"}, "health"]},   // Si es salud
                        1.8,                                          // Multiplicador salud
                        1.5                                           // Otros tipos
                      ]
                    }
                  ]
                },
                {
                  "if": [
                    {"==": [{"var": "riskScore"}, "high"]},          // Si riesgo alto
                    1.5,                                              // Penalidad riesgo
                    1.0                                               // Sin penalidad
                  ]
                }
              ]
            }
          ]},
          {
            "if": [
              {">": [{"var": "quote.coverageAmount"}, 1000000]},    // Si cobertura alta
              50,                                                     // Cargo adicional
              0
            ]
          }
        ]
      };

      const premium = templateEngine.evaluateJsonLogic(premiumExpression, contextData);
      
      const newContext = { 
        ...context, 
        quote: {
          ...context.quote,
          premium: Math.round(premium as number),
          calculated: true,
          calculatedAt: Date.now()
        }
      };
      
      console.log(`[Premium Calculated] $${premium} for ${context.quote?.coverageAmount || 'unknown'} coverage`);
      
      return newContext;
    } catch (error) {
      console.error('[Premium Calculation Error]', error);
      return {
        ...context,
        quote: {
          ...context.quote,
          premium: 0,
          error: 'Failed to calculate premium',
          calculatedAt: Date.now()
        }
      };
    }
  }),

  /**
   * Generar mensaje personalizado basado en contexto
   */
  generateMessage: assign((context: any, { messageType }: { messageType: string }) => {
    try {
      let template = '';
      
      switch (messageType) {
        case 'welcome':
          template = `¡Bienvenido <%= context.session.user?.name || 'Cliente' %>! 
                     Estás cotizando un <%= context.quote?.type || 'seguro' %> 
                     por <%= context.quote?.coverageAmount || '$0' %> con 
                     riesgo <%= context.riskScore > 80 ? 'alto' : context.riskScore > 50 ? 'medio' : 'bajo' %>.`;
          break;
        
        case 'approval':
          template = `🎉 ¡Felicidades <%= context.applicant?.name %>! 
                     Tu póliza de <%= context.quote?.type %> ha sido aprobada. 
                     Premium: $<%= context.quote?.premium %>/mes`;
          break;
        
        case 'rejection':
          template = `😔 Lo sentimos <%= context.applicant?.name %>, 
                     tu solicitud no pudo ser procesada debido a: 
                     <%= context.errors?.join(', ') || 'criterios no cumplidos' %>`;
          break;
          
        default:
          template = `Estado: <%= String(context.state) || 'desconocido' %>`;
      }

      const message = templateEngine.renderEjsTemplate(template, context);
      const newContext = { 
        ...context, 
        notification: {
          type: messageType,
          message: message,
          timestamp: Date.now()
        }
      };
      
      console.log(`[Generated Message] ${messageType}: ${message}`);
      
      return newContext;
    } catch (error) {
      console.error('[Message Generation Error]', error);
      return context;
    }
  }),

  /**
   * Validar datos usando reglas JSON Logic y acumular errores
   */
  validateWithLogic: assign((context: any, { rules }: { rules: Array<{
    field: string;
    expression: RulesLogic;
    errorMessage: string;
  }> }) => {
    try {
      const errors: string[] = context.errors || [];
      
      rules.forEach(rule => {
        const isValid = templateEngine.evaluateJsonLogic(rule.expression, context);
        if (!isValid) {
          errors.push(`${rule.field}: ${rule.errorMessage}`);
        }
      });

      const newContext = { 
        ...context, 
        errors,
        isValid: errors.length === 0,
        validatedAt: Date.now()
      };
      
      console.log(`[Validation Results] ${errors.length} errors found:`, errors);
      
      return newContext;
    } catch (error) {
      console.error('[Validation Error]', error);
      return context;
    }
  })
};

// ============================================================================
// SISTEMA DE ACTORS ESTÁNDAR
// ============================================================================

/**
 * Colección de actores async estándar
 */
const actors = {
  /**
   * Actor para peticiones HTTP
   */
  httpRequest: fromPromise(async ({ input }: { input: Record<string, unknown> }) => {
    const { url, method = 'GET', headers = {}, body } = input as any;
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: body ? JSON.stringify(body) : undefined
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('[HTTP Request Failed]', { url, method, error });
      throw error;
    }
  }),
  
  /**
   * Actor para delays/timers
   */
  delay: fromPromise(async ({ input }: { input: Record<string, unknown> }) => {
    const delay = (input as any).ms || 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
    return { success: true, delay };
  }),
  
  /**
   * Actor para números aleatorios
   */
  randomNumber: fromPromise(async ({ input }: { input: Record<string, unknown> }) => {
    const { min = 0, max = 100 } = input as any;
    const result = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log(`[Random Number] Generated ${result} between ${min}-${max}`);
    return result;
  }),

  /**
   * Actor para validación mock
   */
  validateMock: fromPromise(async ({ input }: { input: Record<string, unknown> }) => {
    const { shouldSucceed = true, delayMs = 1000 } = input as any;
    
    await new Promise(resolve => setTimeout(resolve, delayMs));
    
    if (shouldSucceed) {
      return { 
        success: true, 
        message: 'Validation passed',
        timestamp: Date.now()
      };
    } else {
      throw new Error('Mock validation failed');
    }
  })
};

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Obtiene valor nested usando dot notation
 */
function getNestedValue(obj: any, path: string): unknown {
  return path.split('.').reduce((current, key) => {
    if (current === null || current === undefined) return undefined;
    return (current as any)?.[key];
  }, obj);
}

/**
 * Asigna valor nested usando dot notation
 */
function setNestedValue(obj: any, path: string, value: unknown): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  
  target[lastKey] = value;
}
export interface HybridFlowConfig {
  id: string;
  initial: string;
  context: Record<string, unknown>;
  states: Record<string, HybridStateConfig>;
  guards?: Record<string, string>; // Referencias a guards
  actions?: Record<string, string>; // Referencias a actions
  actors?: Record<string, HybridActorConfig>; // Referencias a actores async
}

export interface HybridStateConfig {
  // Semántica cercana a XState
  type?: 'final' | 'compound' | 'atomic';
  
  // Meta información para UI
  meta?: {
    view?: {
      moduleId: string;
      component?: string;
      slot?: string;
    };
    description?: string;
    icon?: string;
  };

  // Lifecycle hooks explícitos
  lifecycle?: {
    onEnter?: string[]; // Referencias a actions
    onExit?: string[];  // Referencias a actions
  };

  // Data binding inteligente
  binding?: {
    inputs?: Array<{
      source: string; // 'context.field' | 'url.query' | 'localStorage.key'
      target: string; // 'context.field'
      transform?: string; // Referencia a función de transformación
    }>;
    outputs?: Array<{
      source: string; // 'context.field'
      target: string; // 'url.query' | 'localStorage.key' | 'sessionStorage.key'
    }>;
  };

  // Invoking services/services externos
  invoke?: Array<{
    id: string;
    src: string; // Referencia a actor o tipo de servicio
    input?: Record<string, unknown>;
    onDone?: string | HybridTransitionConfig;
    onError?: string | HybridTransitionConfig;
  }>;

  // Transiciones con contexto
  on?: Record<string, string | HybridTransitionConfig>;

  // Estados hijossub-estados (compound states)
  states?: Record<string, HybridStateConfig>;

  // Auto-forward después de delay
  after?: Array<{
    delay: number;
    target: string;
    description?: string;
  }>;

  // Activities continuas
  activities?: string[]; // Referencias a activities
}

export interface HybridTransitionConfig {
  target: string;
  actions?: string[]; // Referencias a actions
  cond?: string; // Referencia a guard
  description?: string;
  
  // Data transformation en transición
  transform?: {
    context?: Record<string, string>; // target: source expressions
    preserve?: string[]; // Campos a preservar
  };
}

export interface HybridActorConfig {
  type: 'promise' | 'http' | 'websocket' | 'timer';
  config?: Record<string, unknown>;
  
  // Para actors de tipo promise
  promise?: () => Promise<unknown>;
  
  // Para actors de tipo http
  http?: {
    url: string;
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  };
  
  // Para actors de tipo timer
  timer?: {
    interval?: number;
    timeout?: number;
  };
}

// Sistema de Guards estándar
const guards = {
  isNull: (context: any, field: string) => {
    const value = getNestedValue(context, field);
    return value === null || value === undefined;
  },
  isNotNull: (context: any, field: string) => {
    const value = getNestedValue(context, field);
    return value !== null && value !== undefined;
  },
  isTruthy: (context: any, field: string) => {
    const value = getNestedValue(context, field);
    return Boolean(value);
  },
  isFalsy: (context: any, field: string) => {
    const value = getNestedValue(context, field);
    return !Boolean(value);
  },
  equals: (context: any, field: string, expected: unknown) => {
    const value = getNestedValue(context, field);
    return value === expected;
  },
  greaterThan: (context: any, field: string, threshold: number) => {
    const value = getNestedValue(context, field);
    return value > threshold;
  },
  hasMinLength: (context: any, field: string, minLength: number) => {
    const value = getNestedValue(context, field);
    return typeof value === 'string' && value.length >= minLength;
  }
};

// Sistema de Actions estándar
const actions = {
  assignField: (context: any, { field, value }: { field: string; value: unknown }) => {
    setNestedValue(context, field, value);
  },
  
  generateId: (context: any, { field, prefix }: { field: string; prefix: string }) => {
    setNestedValue(context, field, `${prefix}-${Date.now()}`);
  },
  
  copyField: (context: any, { from, to }: { from: string; to: string }) => {
    const value = getNestedValue(context, from);
    setNestedValue(context, to, value);
  },
  
  clearField: (context: any, { field }: { field: string }) => {
    setNestedValue(context, field, null);
  },
  
  accumulateArray: (context: any, { field, value }: { field: string; value: unknown }) => {
    const array = getNestedValue(context, field) || [];
    array.push(value);
    setNestedValue(context, field, array);
  },
  
  log: (context: any, { message, data }: { message: string; data?: unknown }) => {
    console.log(`[Flow Log] ${message}`, data || context);
  }
};

// Actors estándar
const actors = {
  httpRequest: fromPromise(async ({ input }: { input: Record<string, unknown> }) => {
    const { url, method = 'GET', headers = {}, body } = input as any;
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body ? JSON.stringify(body) : undefined
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  }),
  
  delay: fromPromise(async ({ input }: { input: Record<string, unknown> }) => {
    const delay = (input as any).ms || 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
    return { success: true, delay };
  }),
  
  randomNumber: fromPromise(async ({ input }: { input: Record<string, unknown> }) => {
    const { min = 0, max = 100 } = input as any;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  })
};

// Funciones auxiliares para nested values
function getNestedValue(obj: any, path: string): unknown {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function setNestedValue(obj: any, path: string, value: unknown): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
}

// Función factory para crear máquinas híbridas
export function createHybridFlowMachine(config: HybridFlowConfig) {
  const convertedStates = convertStates(config.states);
  const convertedGuards = config.guards ? convertGuards(config.guards) : {};
  const convertedActions = config.actions ? convertActions(config.actions) : {};
  const convertedActors = config.actors ? convertActors(config.actors) : {};

  return createMachine(
    {
      id: config.id,
      initial: config.initial,
      context: config.context,
      states: convertedStates,
      ...(Object.keys(convertedGuards).length > 0 && { guards: convertedGuards }),
      ...(Object.keys(convertedActions).length > 0 && { actions: convertedActions }),
      ...(Object.keys(convertedActors).length > 0 && { actors: convertedActors })
    },
    {
      guards: { ...guards, ...convertedGuards },
      actions: { ...actions, ...convertedActions },
      actors: { ...actors, ...convertedActors }
    }
  );
}

// Convertir estados con lifecycle completo
function convertStates(states: Record<string, HybridStateConfig>): Record<string, unknown> {
  const converted: Record<string, unknown> = {};

  for (const [stateName, stateConfig] of Object.entries(states)) {
    converted[stateName] = {
      type: stateConfig.type,
      meta: stateConfig.meta || {},
      
      // Lifecycle hooks
      entry: stateConfig.lifecycle?.onEnter || [],
      exit: stateConfig.lifecycle?.onExit || [],
      
      // Data binding (se convierte en entry actions)
      ...(stateConfig.binding?.inputs && {
        entry: [
          ...(stateConfig.lifecycle?.onEnter || []),
          ...stateConfig.binding.inputs.map(input => ({
            type: 'assignField',
            field: input.target,
            value: `context.${input.source}` // Simplificado por ahora
          }))
        ]
      }),
      
      // Auto-transitions con delay
      after: stateConfig.after || {},
      
      // Activities continuas
      activities: stateConfig.activities || [],
      
      // Invokes mejorados
      invoke: stateConfig.invoke || [],
      
      // Transiciones
      on: stateConfig.on || {},
      
      // Sub-estados recursivos
      ...(stateConfig.states && { states: convertStates(stateConfig.states) })
    };
  }

  return converted;
}

// Convertir guards desde strings a funciones
function convertGuards(guardRefs: Record<string, string>): Record<string, unknown> {
  const converted: Record<string, unknown> = {};
  
  for (const [name, ref] of Object.entries(guardRefs)) {
    // Parsear referencias como "isNull:context.userId" o "greaterThan:context.score:80"
    const [guardName, ...params] = ref.split(':');
    converted[name] = (...args: unknown[]) => {
      return (guards as any)[guardName](...params.map(p => p.replace('context.', '')), ...args);
    };
  }
  
  return converted;
}

// Convertir actions desde strings a funciones
function convertActions(actionRefs: Record<string, string>): Record<string, unknown> {
  const converted: Record<string, unknown> = {};
  
  for (const [name, ref] of Object.entries(actionRefs)) {
    // Parsear referencias como "assignField:field:dossierId" 
    const [actionName, ...params thtml:unknown[]) => 
      return (actions as any)[actionName](...params, ...args);
    };
  }
  
  return converted;
}

// Convertir actores desde config
function convertActors(actorConfigs: Record<string, HybridActorConfig>): Record<string, unknown> {
  const converted: Record<string, unknown> = {};
  
  for (const [name, config] of Object.entries(actorConfigs)) {
    switch (config.type) {
      case 'promise':
        converted[name] = config.promise ? fromPromise(config.promise) : actors.delay;
        break;
      case 'http':
        converted[name] = actors.httpRequest;
        break;
      case 'timer':
        converted[name] = fromPromise(async ({ input }: any) => {
          await new Promise(resolve => setTimeout(resolve, input?.timeout || 1000));
          return { success: true };
        });
        break;
      default:
        converted[name] = actors.delay;
    }
  }
  
  return converted;
}

// ============================================================================
// EJEMPLO COMPLETO CON JSON-LOGIC-JS INTEGRADO
// ============================================================================

/**
 * 🎯 Ejemplo completo para canal de seguros con:
 * ✅ JSON Logic para validaciones complejas
 * ✅ Templating EJS para contenido dinámico
 * ✅ Guards avanzados con lógica de negocio
 * ✅ Actions que calculan premium dinámicamente
 * ✅ UI dinámico basado en contexto
 */
export const insuranceSalesFlow = createHybridFlowMachine({
  id: 'insuranceSales',
  initial: 'initialization',
  context: {
    dossierId: null,
    riskScore: 0,
    applicantId: null,
    signatureId: null,
    policyId: null,
    errors: [],
    session: {
      channel: 'web',
      userId: null,
      token: null,
      user: null
    },
    quote: {
      basic: null,
      coverages: [],
      selection: null
    }
  },
  states: {
    initialization: {
      type: 'atomic',
      meta: {
        view: { moduleId: 'mfe-initialization' },
        description: 'Inicialización del flujo',
        icon: '🚀'
      },
      lifecycle: {
        onEnter: ['logInitialization'],
        onExit: ['logInitializationComplete']
      },
      binding: {
        inputs: [
          { source: 'url.query.token', target: 'session.token' },
          { source: 'url.query.channel', target: 'session.channel' }
        ]
      },
      invoke: [{
        id: 'loadUserSession',
        src: 'httpRequest',
        input: {
          url: '/api/user/profile',
          headers: { 'Authorization': 'Bearer session.token' }
        },
        onDone: {
          target: 'quote.start',
          actions: ['assignUserData']
        },
        onError: 'quote.start' // Continuar sin datos de usuario
      }],
      on: {
        USER_READY: 'quote.start',
        GUEST_MODE: 'quote.start'
      }
    },
    
    'quote.start': {
      type: 'atomic',
      meta: {
        view: { moduleId: 'mfe-quote-start' },
        description: 'Inicio del proceso de cotización',
        icon: '💰'
      },
      lifecycle: {
        onEnter: ['logQuoteStart']
      },
      binding: {
        outputs: [
          { source: 'session.token', target: 'url.query.token' }
        ]
      },
      after: [
        {
          delay: 30000,
          target: 'quote.timeout',
          description: 'Timeout después de 30 segundos'
        }
      ],
      on: {
        QUOTE_SUBMIT: {
          target: 'quote.validation',
          actions: ['assignQuoteData', 'generateDossierId', 'validateQuoteWithLogic'],
          description: 'Validar cotización antes de continuar'
        },
        CANCEL: 'initialization'
      }
    },
    
    // 📝 Estado de validación usando JSON Logic
    'quote.validation': {
      type: 'atomic',
      meta: {
        view: { moduleId: 'mfe-quote-validation' },
        description: 'Validación de datos con lógica de negocio',
        icon: '📋'
      },
      
      // 🔍 Sistema de lógica avanzada
      logic: {
        // Condiciones dinámicas
        conditions: [
          {
            name: 'validAgeForLifeInsurance',
            expression: {
              "and": [
                {">": [{"var": "applicant.age"}, 18]},
                {"<=": [{"var": "applicant.age"}, 70]},
                {"==": [{"var": "quote.type"}, "life"]}
              ]
            },
            description: 'Edad válida para seguro de vida'
          },
          {
            name: 'minimumCoverage',
            expression: {
              ">=": [{"var": "quote.coverageAmount"}, 1000]
            },
            description: 'Cobertura mínima requerida'
          },
          {
            name: 'acceptableRisk',
            expression: {
              "<=": [{"var": "riskScore"}, 80]
            },
            description: 'Nivel de riesgo aceptable'
          }
        ],
        
        // Computed properties usando JSON Logic
        computed: [
          {
            field: 'quote.validationStatus',
            expression: {
              "if": [
                {
                  "and": [
                    {"var": "condition.validAgeForLifeInsurance"},
                    {"var": "condition.minimumCoverage"},
                    {"var": "condition.acceptableRisk"}
                  ]
                },
                "approved",
                "pending_review"
              ]
            },
            cache: true
          },
          {
            field: 'quote.premiumMultiplier',
            expression: {
              "+": [
                1.0,
                {
                  "if": [
                    {">": [{"var": "applicant.age"}, 50]},
                    0.5,
                    0
                  ]
                },
                {
                  "if": [
                    {"==": [{"var": "riskScore"}, "high"]},
                    0.3,
                    0
                  ]
                }
              ]
            }
          }
        ],
        
        // Validaciones automáticas
        validations: [
          {
            field: 'applicant.age',
            expression: {
              "and": [
                {">=": [{"var": "applicant.age"}, 18]},
                {"<=": [{"var": "applicant.age"}, 80]}
              ]
            },
            errorMessage: 'La edad debe estar entre 18 y 80 años'
          },
          {
            field: 'quote.coverageAmount',
            expression: {
              "and": [
                {">=": [{"var": "quote.coverageAmount"}, 1000]},
                {"<=": [{"var": "quote.coverageAmount"}, 5000000]}
              ]
            },
            errorMessage: 'La cobertura debe estar entre $1,000 y $5,000,000'
          }
        ]
      },
      
      // 🎨 UI Dinámico basado en contexto
      ui: {
        title: 'Validación de <%= context.quote?.type || "cotización" %>',
        subtitle: '<%= context.applicant?.name ? "Cliente: " + context.applicant.name : "Validando datos..." %>',
        
        fields: [
          {
            name: 'age',
            type: 'text',
            template: 'Edad: <%= context.applicant?.age %> años',
            visibility: {
              "!=": [{"var": "applicant.age"}, null]
            }
          },
          {
            name: 'coverage',
            type: 'text',
            template: 'Cobertura: $<%= context.quote?.coverageAmount?.toLocaleString() %>',
            visibility: true
          },
          {
            name: 'premium_estimate',
            type: 'text', 
            template: 'Premium estimado: $<%= context.quote?.premium || "calculando..." %>',
            visibility: {
              "!=": [{"var": "quote.premium"}, null]
            }
          }
        ],
        
        buttons: [
          {
            text: 'Continuar',
            event: 'VALIDATION_APPROVED',
            visibility: {
              "==": [{"var": "quote.validationStatus"}, "approved"]
            },
            enabled: {
              "and": [
                {"!=": [{"var": "applicant.age"}, null]},
                {"!=": [{"var": "quote.coverageAmount"}, null]},
                {">": [{"var": "quote.coverageAmount"}, 0]}
              ]
            },
            style: 'bg-green-500 hover:bg-green-600'
          },
          {
            text: 'Revisar Datos',
            event: 'REVIEW_REQUIRED',
            visibility: {
              "==": [{"var": "quote.validationStatus"}, "pending_review"]
            },
            style: 'bg-yellow-500 hover:bg-yellow-600'
          },
          {
            text: 'Rechazar',
            event: 'VALIDATION_REJECTED',
            visibility: {
              "or": [
                {"<": [{"var": "applicant.age"}, 18]},
                {">": [{"var": "applicant.age"}, 80]},
                {">": [{"var": "quote.coverageAmount"}, 5000000]}
              ]
            },
            style: 'bg-red-500 hover:bg-red-600'
          }
        ]
      },
      
      // 🧮 Calcular premium automáticamente al entrar
      lifecycle: {
        onEnter: ['calculatePremium', 'generateMessage:welcome']
      },
      
      invoke: [{
        id: 'validateBusinessRules',
        src: 'validateMock',
        input: {
          shouldSucceed: true,
          delayMs: 1500
        },
        onDone: 'risk.assessment',
        onError: 'quote.validation_failed'
      }],
      
      on: {
        VALIDATION_APPROVED: {
          target: 'risk.assessment',
          actions: ['logValidationSuccess'],
          cond: 'hasValidQuoteData'
        },
        REVIEW_REQUIRED: 'quote.review',
        VALIDATION_REJECTED: {
          target: 'quote.rejected',
          actions: ['generateMessage:rejection', 'logValidationFailure']
        }
      }
    },
    
    'risk.assessment': {
      type: 'compound',
      meta: {
        view: { moduleId: 'mfe-risk-assessment' },
        description: 'Evaluación de riesgo completa',
        icon: '🛡️'
      },
      invoke: [{
        id: 'calculateRisk',
        src: 'randomNumber',
        input: { min: 0, max: 100 },
        onDone: {
          target: 'risk.evaluation',
          actions: ['setRiskScore']
        }
      }],
      states: {
        'risk.evaluation': {
          meta: {
            view: { moduleId: 'mfe-risk-evaluation' },
            description: 'Evaluación manual del riesgo'
          },
          on: {
            LOW_RISK: {
              target: 'risk.approved',
              cond: 'isLowRisk',
              actions: ['logLowRisk']
            },
            HIGH_RISK: {
              target: 'risk.review',
              cond: 'isHighRisk',
              actions: ['logHighRisk']
            },
            MANUAL_REVIEW: 'risk.review'
          }
        },
        
        'risk.approved': {
          meta: { view: { moduleId: 'mfe-risk-approved' } },
          on: {
            CONTINUE: 'identity.verification'
          }
        },
        
        'risk.review': {
          meta: { view: { moduleId: 'mfe-risk-review' } },
          on: {
            APPROVE_MANUAL: 'identity.verification',
            REJECT_MANUAL: 'quote.start',
            REQUEST_MORE_INFO: 'quote.start'
          }
        }
      }
    },
    
    'identity.verification': {
      type: 'atomic',
      meta: {
        view: { moduleId: 'mfe-identity-verification' },
        description: 'Verificación de identidad y documentos',
        icon: '🔍'
      },
      invoke: [{
        id: 'verifyIdentity',
        src: 'httpRequest',
        input: {
          url: '/api/identity/verify',
          method: 'POST',
          body: { userId: 'session.user.id' }
        },
        onDone: {
          target: 'applicant.creation',
          actions: ['logIdentityVerified']
        },
        onError: {
          target: 'identity.error',
          actions: ['logIdentityError']
        }
      }],
      on: {
        SKIP_IDENTITY: 'applicant.creation',
        RETRY_IDENTITY: 'identity.verification'
      }
    }
  },
  
  // 🧠 Configuración de guards usando JSON Logic
  guards: {
    // Guards estándar con strings
    isLowRisk: 'greaterThan:context.riskScore:80',
    isHighRisk: 'lessThan:context.riskScore:30',
    hasUserId: 'isNotNull:context.session.userId',
    
    // Guards avanzados usando JSON Logic directamente
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
            {"<=": [{"var": "applicant.age"}, 70]},
            {"<=": [{"var": "applicant.age"}, 75]}
          ]
        }
      ]
    },
    
    requiresManualReview: {
      "or": [
        {">": [{"var": "riskScore"}, 80]},
        {">": [{"var": "quote.coverageAmount"}, 1500000]},
        {">": [{"var": "applicant.age"}, 65]},
        {"==": [{"var": "applicant.clientType"}, "--"}]
      ]
    }
  },
  
  // ⚡ Configuración de actions personalizadas
  actions: {
    // Actions estándar
    logInitialization: 'log:Session initialization started',
    assignUserData: 'assignField:field:session.user',
    generateDossierId: 'generateId:field:dossierId:prefix:dossier',
    
    // Actions avanzados con templating y lógica
    validateQuoteWithLogic: {
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
        },
        {
          field: 'quote.coverageAmount',
          expression: {
            ">=": [{"var": "quote.coverageAmount"}, 1000]
          },
          errorMessage: 'Cobertura mínima debe ser $1,000'
        },
        {
          field: 'quote.type',
          expression: {
            "in": [
              {"var": "quote.type"},
              ["life", "health", "auto", "home", "liability"]
            ]
          },
          errorMessage: 'Tipo de seguro no válido'
        }
      ]
    },
    
    logValidationSuccess: 'log:Cotización validada exitosamente',
    logValidationFailure: 'log:Validación falló',
    
    renderPersonalizedMessage: {
      type: 'renderTemplate',
      template: 'Hola <%= context.applicant?.name || "Cliente" %>, tu cotización de <%= context.quote?.type %> está <%= context.quote?.validationStatus %>.',
      target: 'notification.personalizedMessage'
    }
  },
  
  // Actors personalizados
  actors: {
    loadUserProfile: {
      type: 'http',
      http: {
        url: '/api/user/profile',
        method: 'GET'
      }
    },
    delayCalculation: {
      type: 'timer',
      timer: {
        timeout: 2000
      }
    }
  }
});

