/**
 * JSON Schema Validator
 * Provides runtime validation using JSON Schema
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';

export class SchemaValidator {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false
    });

    // Add support for common formats
    addFormats(this.ajv);
  }

  /**
   * Validate flow configuration against JSON Schema
   */
  validateFlowConfig(data: unknown): {
    valid: boolean;
    errors: string[];
    data?: unknown;
  } {
    // Simple schema for flow configuration
    const schema = {
      type: 'object',
      properties: {
        id: { type: 'string', pattern: '^[a-zA-Z][a-zA-Z0-9_-]*$' },
        name: { type: 'string', minLength: 1 },
        version: { type: 'string' },
        description: { type: 'string' },
        initialStep: { type: 'string', minLength: 1 },
        context: { type: 'object' },
        actions: { type: 'object' },
        guards: { type: 'object' },
        actors: { type: 'object' },
        plugins: { type: 'object' },
        steps: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', pattern: '^[a-zA-Z][a-zA-Z0-9_-]*$' },
              name: { type: 'string', minLength: 1 },
              view: { type: 'object' },
              hooks: { type: 'object' },
              invoke: { type: 'object' },
              navigation: { type: 'object' }
            },
            required: ['id', 'name', 'view', 'navigation']
          }
        }
      },
      required: ['id', 'name', 'initialStep', 'context', 'steps']
    };

    const validate = this.ajv.compile(schema);
    const valid = validate(data);

    if (valid) {
      return {
        valid: true,
        errors: [],
        data
      };
    }

    const errors = validate.errors?.map(error => {
      const path = error.instancePath || error.schemaPath;
      return `${path}: ${error.message}`;
    }) || ['Unknown validation error'];

    return {
      valid: false,
      errors
    };
  }

  /**
   * Validate any data against a custom schema
   */
  validate(data: unknown, schema: Record<string, unknown>): {
    valid: boolean;
    errors: string[];
    data?: unknown;
  } {
    const validate = this.ajv.compile(schema);
    const valid = validate(data);

    if (valid) {
      return {
        valid: true,
        errors: [],
        data
      };
    }

    const errors = validate.errors?.map(error => {
      const path = error.instancePath || error.schemaPath;
      return `${path}: ${error.message}`;
    }) || ['Unknown validation error'];

    return {
      valid: false,
      errors
    };
  }

  /**
   * Add custom schema
   */
  addSchema(schema: Record<string, unknown>, key?: string): void {
    this.ajv.addSchema(schema, key);
  }

  /**
   * Get validation errors in a more readable format
   */
  getReadableErrors(errors: Record<string, unknown>[]): string[] {
    return errors.map(error => {
      const path = error.instancePath || 'root';
      const message = error.message || 'Invalid value';
      const allowedValues = error.allowedValues && Array.isArray(error.allowedValues) ? ` (allowed: ${error.allowedValues.join(', ')})` : '';
      return `${path}: ${message}${allowedValues}`;
    });
  }
}

// Export singleton instance
export const schemaValidator = new SchemaValidator();