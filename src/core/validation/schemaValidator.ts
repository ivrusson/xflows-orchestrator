import Ajv, { type JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';
import { z } from 'zod';

// Schema validator usando múltiples validadores
export class SchemaValidator {
  private ajv: Ajv;
  private zodSchemas: Map<string, z.ZodSchema> = new Map();

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
    });

    // Agregar soporte para formatos comunes (email, uri, date-time, etc.)
    addFormats(this.ajv);
  }

  // Registrar schema Zod
  registerZodSchema(name: string, schema: z.ZodSchema): void {
    this.zodSchemas.set(name, schema);
  }

  // Registrar schema JSON Schema con Ajv
  registerAjvSchema<T>(name: string, schema: JSONSchemaType<T>): void {
    this.ajv.addSchema(schema, name);
  }

  // Validar con Zod (preferido para validación de tipos TypeScript)
  validateZod(
    schemaName: string,
    data: unknown
  ): {
    success: boolean;
    errors?: z.ZodError[];
    data?: unknown;
  } {
    const schema = this.zodSchemas.get(schemaName);
    if (!schema) {
      throw new Error(`Schema '${schemaName}' not found in Zod registry`);
    }

    try {
      const result = schema.safeParse(data);
      if (result.success) {
        return { success: true, data: result.data };
      }
      return { success: false, errors: [result.error] };
    } catch (error) {
      return { success: false, errors: [error as z.ZodError] };
    }
  }

  // Validar con Ajv (preferido para schemas JSON grandes)
  validateAjv(
    schemaName: string,
    data: unknown
  ): {
    success: boolean;
    errors?: string[];
    data?: unknown;
  } {
    const validate = this.ajv.getSchema(schemaName);
    if (!validate) {
      throw new Error(`Schema '${schemaName}' not found in Ajv registry`);
    }

    const valid = validate(data);
    if (valid) {
      return { success: true, data };
    }
    return {
      success: false,
      errors: validate.errors?.map((err) => `${err.instancePath || 'root'}: ${err.message}`) || [
        'Unknown validation error',
      ],
    };
  }

  // Validar con ambos y retornar el resultado más estricto
  validateBoth(
    schemaName: string,
    data: unknown
  ): {
    success: boolean;
    zodErrors?: z.ZodError[];
    ajvErrors?: string[];
    data?: unknown;
  } {
    const zodResult = this.validateZod(schemaName, data);
    const ajvResult = this.validateAjv(schemaName, data);

    return {
      success: zodResult.success && ajvResult.success,
      zodErrors: zodResult.success ? undefined : zodResult.errors,
      ajvErrors: ajvResult.success ? undefined : ajvResult.errors,
      data: zodResult.data || ajvResult.data,
    };
  }

  // Obtener información del schema registrado
  getSchemaInfo(schemaName: string): {
    hasZod: boolean;
    hasAjv: boolean;
  } {
    return {
      hasZod: this.zodSchemas.has(schemaName),
      hasAjv: this.ajv.getSchema(schemaName) !== undefined,
    };
  }

  // Listar todos los schemas registrados
  listSchemas(): string[] {
    const zodNames = Array.from(this.zodSchemas.keys());
    const ajvNames = this.ajv.schemas ? Object.keys(this.ajv.schemas) : [];

    // Retornar nombres únicos
    return Array.from(new Set([...zodNames, ...ajvNames]));
  }
}

// Instancia singleton del validator
export const schemaValidator = new SchemaValidator();

// Schema base para estados de flujo
export const FlowStateSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(['mfe', 'action', 'condition']).default('mfe'),
  guards: z
    .array(
      z.object({
        id: z.string(),
        condition: z.unknown(), // JSON Logic expression
        errorPage: z.string().optional(),
        message: z.string().optional(),
      })
    )
    .optional(),
  navigation: z
    .object({
      next: z
        .union([
          z.string(),
          z.object({
            default: z.string(),
            conditions: z.array(
              z.object({
                if: z.unknown(),
                to: z.string(),
                effects: z.array(z.unknown()).optional(),
              })
            ),
          }),
        ])
        .optional(),
      back: z.string().optional(),
      final: z.boolean().optional(),
    })
    .optional(),
  interstep: z
    .object({
      beforeNext: z
        .array(
          z
            .object({
              id: z.string(),
              type: z.enum(['http', 'signalr', 'analytics', 'storage']),
              // Más campos según el tipo
            })
            .passthrough()
        )
        .optional(),
      onSuccess: z
        .object({
          navigate: z.string(),
          params: z.record(z.unknown()).optional(),
        })
        .optional(),
    })
    .optional(),
  meta: z
    .object({
      view: z
        .object({
          moduleId: z.string(),
          component: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

// Schema para flujos completos
export const FlowDefinitionSchema = z.object({
  id: z.string().regex(/^[0-9]+$/, 'Flow ID must be numeric'),
  name: z.string(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be semantic'),
  productType: z.string().optional(),
  metadata: z
    .object({
      description: z.string().optional(),
      estimatedTime: z.string().optional(),
      requiresUnderwriting: z.boolean().optional(),
      createdAt: z.string().optional(),
      updatedAt: z.string().optional(),
    })
    .optional(),
  initialContext: z.record(z.unknown()).optional(),
  steps: z.array(FlowStateSchema),
  errorHandling: z
    .object({
      errorPages: z.record(
        z.object({
          title: z.string(),
          message: z.string(),
          severity: z.enum(['error', 'warning', 'info']),
          actions: z.array(z.string()).optional(),
          canRetry: z.boolean().optional(),
        })
      ),
      retry: z
        .object({
          enabled: z.boolean(),
          maxAttempts: z.number(),
          backoff: z.enum(['exponential', 'linear']),
          initialDelay: z.number(),
          maxDelay: z.number(),
        })
        .optional(),
    })
    .optional(),
  signalr: z
    .object({
      enabled: z.boolean(),
      hubUrl: z.string(),
      events: z.array(z.string()),
    })
    .optional(),
  persistence: z
    .object({
      enabled: z.boolean(),
      storage: z.enum(['localStorage', 'sessionStorage', 'indexedDB']),
      key: z.string(),
      expiration: z.number(),
    })
    .optional(),
});

// Registar schemas por defecto
schemaValidator.registerZodSchema('flowState', FlowStateSchema);
schemaValidator.registerZodSchema('flowDefinition', FlowDefinitionSchema);
