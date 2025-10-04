import * as ejs from 'ejs';
import jsonLogic, { type RulesLogic } from 'json-logic-js';
import type { FlowContext } from '../../approaches/approach-1/sales-flow-machine';

// Sistema de evaluación de templates con EJS y JSON Logic
export class HybridTemplateEngine {
  private customFilters: Map<string, (value: unknown) => string> = new Map();
  private customFunctions: Map<string, (...args: unknown[]) => unknown> = new Map();

  constructor() {
    this.registerDefaultFilters();
    this.registerDefaultFunctions();
  }

  // Registrar funciones personalizadas para EJS
  registerCustomFunction(name: string, fn: (...args: unknown[]) => unknown): void {
    this.customFunctions.set(name, fn);
  }

  // Registrar filtros personalizados para EJS
  registerCustomFilter(name: string, fn: (value: unknown) => string): void {
    this.customFilters.set(name, fn);
  }

  // Evaluar expresión JSON Logic
  evaluateJsonLogic(expression: RulesLogic, context: FlowContext): boolean {
    try {
      // Crear contexto compatible con json-logic-js
      const logicContext = this.createLogicContext(context);
      const result = jsonLogic.apply(expression, logicContext);

      return Boolean(result);
    } catch (error) {
      console.error('JSON Logic evaluation error:', error, 'Expression:', expression);
      return false;
    }
  }

  // Evaluar template EJS
  renderEjsTemplate(template: string, context: FlowContext): string {
    try {
      // Crear contexto con funciones y filtros personalizados
      const templateContext = this.createTemplateContext(context);

      const functionsObj = {} as Record<string, unknown>;
      const filtersObj = {} as Record<string, (value: unknown) => string>;

      this.customFunctions.forEach((fn, name) => {
        functionsObj[name] = fn;
      });

      this.customFilters.forEach((filter, name) => {
        filtersObj[name] = filter;
      });

      return ejs.render(template, {
        ...templateContext,
        ...functionsObj,
        filters: filtersObj,
      });
    } catch (error) {
      console.error('EJS template rendering error:', error);
      return `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  // Evaluar expresión mista (EJS + JSON Logic)
  evaluateHybridExpression(expression: string, context: FlowContext): unknown {
    try {
      // Primero renderizar EJS
      const renderedExpression = this.renderEjsTemplate(expression, context);

      // Si parece ser JSON Logic, evaluarlo
      if (this.looksLikeJsonLogic(renderedExpression)) {
        try {
          const parsedLogic = JSON.parse(renderedExpression);
          return this.evaluateJsonLogic(parsedLogic, context);
        } catch {
          // Si no es JSON válido, retornar como string renderizado
          return renderedExpression;
        }
      }

      return renderedExpression;
    } catch (error) {
      console.error('Hybrid expression evaluation error:', error);
      return expression; // Retornar original en caso de error
    }
  }

  // Extraer variables de un template/expresión
  extractVariables(expression: string): string[] {
    const variables: string[] = [];

    // Extraer variables de EJS
    const ejsMatches = expression.match(/<%=?\s*([^%>]+)%?%>/g);
    if (ejsMatches) {
      for (const match of ejsMatches) {
        const varMatch = match.match(/<%=?\s*([^%>]+)%?%>/);
        if (varMatch) {
          const vars = this.extractVarsFromExpression(varMatch[1]);
          variables.push(...vars);
        }
      }
    }

    // Extraer variables de JSON Logic
    const jsonLogicMatches = expression.match(/"var":\s*"([^"]+)"/g);
    if (jsonLogicMatches) {
      for (const match of jsonLogicMatches) {
        const varMatch = match.match(/"var":\s*"([^"]+)"/);
        if (varMatch) {
          variables.push(varMatch[1]);
        }
      }
    }

    return Array.from(new Set(variables));
  }

  // Validar que todas las variables requeridas estén disponibles
  validateTemplateRequiments(
    expression: string,
    context: FlowContext
  ): {
    valid: boolean;
    missing: string[];
    extra: string[];
  } {
    const requiredVars = this.extractVariables(expression);
    const availableVars = this.getAllAvailableVariables(context);

    const missing = requiredVars.filter((variable) => availableVars.indexOf(variable) === -1);
    const extra = availableVars.filter(
      (variable) => requiredVars.indexOf(variable) === -1 && !variable.startsWith('_')
    );

    return {
      valid: missing.length === 0,
      missing,
      extra,
    };
  }

  // Crear contexto para JSON Logic
  private createLogicContext(context: FlowContext): Record<string, unknown> {
    // Aplanar el contexto para acceso directo con puntos
    const flattened = this.flattenObject(context as unknown as Record<string, unknown>);

    // Agregar funciones utilitarias
    return {
      ...flattened,
      now: new Date().toISOString(),
      timestamp: Date.now(),
      env: {
        locale: 'es-MX',
        channel: context.session?.channel || 'web',
        version: '1.0.0',
      },
      math: {
        abs: Math.abs,
        ceil: Math.ceil,
        floor: Math.floor,
        max: Math.max,
        min: Math.min,
        round: Math.round,
        random: () => Math.random(),
      },
      string: {
        length: (str: string) => str?.length || 0,
        upper: (str: string) => str?.toUpperCase() || '',
        lower: (str: string) => str?.toLowerCase() || '',
        substring: (str: string, start: number, end?: number) => str?.substring(start, end) || '',
      },
      array: {
        length: (arr: unknown[]) => arr?.length || 0,
        includes: (arr: unknown[], item: unknown) => (arr ? arr.indexOf(item) !== -1 : false),
        join: (arr: string[], separator = ',') => arr?.join(separator) || '',
      },
    };
  }

  // Crear contexto para EJS templates
  private createTemplateContext(context: FlowContext): Record<string, unknown> {
    const logicContext = this.createLogicContext(context);

    return {
      ...logicContext,
      // Funciones específicas para templates
      format: {
        currency: (amount: number, locale = 'es-MX') => {
          return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'MXN',
          }).format(amount);
        },
        date: (date: string | Date, locale = 'es-MX') => {
          return new Intl.DateTimeFormat(locale).format(new Date(date));
        },
        number: (num: number, locale = 'es-MX') => {
          return new Intl.NumberFormat(locale).format(num);
        },
      },
    };
  }

  // Aplanar objeto para acceso con notación de puntos
  private flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
    const flattened: Record<string, unknown> = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (
          value &&
          typeof value === 'object' &&
          !Array.isArray(value) &&
          !(value instanceof Date)
        ) {
          Object.assign(flattened, this.flattenObject(value as Record<string, unknown>, newKey));
        } else {
          flattened[newKey] = value;
        }
      }
    }

    return flattened;
  }

  // Obtener todas las variables disponibles en el contexto
  private getAllAvailableVariables(context: FlowContext): string[] {
    const flattened = this.flattenObject(context as unknown as Record<string, unknown>);
    return Object.keys(flattened).concat([
      'now',
      'timestamp',
      'env.locale',
      'env.channel',
      'env.version',
    ]);
  }

  // Verificar si una expresión parece ser JSON Logic
  private looksLikeJsonLogic(expression: string): boolean {
    try {
      const parsed = JSON.parse(expression);
      return typeof parsed === 'object' && parsed !== null;
    } catch {
      return false;
    }
  }

  // Extraer variables de una expresión EJS
  private extractVarsFromExpression(expression: string): string[] {
    // Buscar referencia de variables (sin llamadas de función)
    const varMatches = expression.match(/\b[_$a-zA-Z][_$a-zA-Z0-9.]*\b/g) || [];

    return varMatches.filter(
      (varName) =>
        !this.customFunctions.has(varName) &&
        !varName.startsWith('math.') &&
        !varName.startsWith('string.') &&
        !varName.startsWith('array.') &&
        !varName.startsWith('format.') &&
        !varName.startsWith('env.')
    );
  }

  // Registrar filtros por defecto
  private registerDefaultFilters(): void {
    this.registerCustomFilter('currency', (value) => {
      const num = Number(value);
      if (Number.isNaN(num)) return String(value);
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
      }).format(num);
    });

    this.registerCustomFilter('uppercase', (value) => String(value).toUpperCase());
    this.registerCustomFilter('lowercase', (value) => String(value).toLowerCase());
    this.registerCustomFilter('date', (value) => {
      try {
        return new Intl.DateTimeFormat('es-MX').format(new Date(value as string));
      } catch {
        return String(value);
      }
    });
  }

  // Registrar funciones por defecto
  private registerDefaultFunctions(): void {
    this.registerCustomFunction('isEmpty', (value) => {
      if (value === null || value === undefined) return true;
      if (Array.isArray(value) || typeof value === 'string') return value.length === 0;
      if (typeof value === 'object') return Object.keys(value).length === 0;
      return false;
    });

    this.registerCustomFunction('hasValue', (value) => {
      const isEmptyFn = this.customFunctions.get('isEmpty');
      return isEmptyFn ? !isEmptyFn(value) : false;
    });

    this.registerCustomFunction('length', (value) => {
      if (Array.isArray(value)) return value.length;
      if (typeof value === 'string') return value.length;
      if (typeof value === 'object' && value !== null) return Object.keys(value).length;
      return 0;
    });
  }
}

// Instancia singleton del template engine
export const templateEngine = new HybridTemplateEngine();

// Ejemplos de uso combinado:

/*
// JSON Logic puro
const jsonLogicExpression = {
  "and": [
    {"!!": [{"var": "context.dossierId"}]},
    {"<": [{"var": "context.riskScore"}, 80]}
  ]
};

// EJS template
const ejsTemplate = "Bienvenido <%= client.name %> - Póliza <%= policy.number %>";

// Expresión híbrida
const hybridExpr = `
{
  "and": [
    {"!!": [{"var": "context.<%= step %>Id"}]},
    {"==": [{"var": "env.channel"}, "<%= channel %>"]}
  ]
}
`;

// Ejecución
const result1 = templateEngine.evaluateJsonLogic(jsonLogicExpression, context);
const result2 = templateEngine.renderEjsTemplate(ejsTemplate, context);
const result3 = templateEngine.evaluateHybridExpression(hybridExpr, context);

console.log(result1); // true/false
console.log(result2); // "Bienvenido Juan - Póliza POL-123"
console.log(result3); // verdadero si ambas condiciones se cumplen
*/
