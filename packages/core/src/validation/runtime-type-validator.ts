/**
 * Runtime Type Validator
 * Provides runtime type checking and validation
 */

// Type definitions for runtime validation
export type PrimitiveType = 'string' | 'number' | 'boolean' | 'null' | 'undefined';
export type ComplexType = 'object' | 'array' | 'function';
export type AllowedType = PrimitiveType | ComplexType;

export interface TypeDefinition {
  type: AllowedType | AllowedType[];
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  enum?: unknown[];
  properties?: Record<string, TypeDefinition>;
  items?: TypeDefinition;
  additionalProperties?: boolean | TypeDefinition;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  path?: string;
}

export class RuntimeTypeValidator {
  /**
   * Validate value against type definition
   */
  validate(value: unknown, typeDef: TypeDefinition, path = 'root'): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if value is required
    if (typeDef.required && (value === undefined || value === null)) {
      errors.push(`Required field missing at ${path}`);
      return { valid: false, errors, warnings, path };
    }

    // Skip validation if value is undefined/null and not required
    if (value === undefined || value === null) {
      return { valid: true, errors, warnings, path };
    }

    // Check type
    const actualType = this.getType(value);
    const expectedTypes = Array.isArray(typeDef.type) ? typeDef.type : [typeDef.type];
    
    if (!expectedTypes.includes(actualType)) {
      errors.push(`Expected ${expectedTypes.join(' or ')} at ${path}, got ${actualType}`);
      return { valid: false, errors, warnings, path };
    }

    // Type-specific validations
    switch (actualType) {
      case 'string':
        this.validateString(value as string, typeDef, path, errors, warnings);
        break;
      case 'number':
        this.validateNumber(value as number, typeDef, path, errors, warnings);
        break;
      case 'boolean':
        this.validateBoolean(value as boolean, typeDef, path, errors, warnings);
        break;
      case 'object':
        this.validateObject(value as Record<string, unknown>, typeDef, path, errors, warnings);
        break;
      case 'array':
        this.validateArray(value as unknown[], typeDef, path, errors, warnings);
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      path
    };
  }

  /**
   * Get runtime type of value
   */
  private getType(value: unknown): AllowedType {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (Array.isArray(value)) return 'array';
    return typeof value as AllowedType;
  }

  /**
   * Validate string value
   */
  private validateString(
    value: string,
    typeDef: TypeDefinition,
    path: string,
    errors: string[],
    _warnings: string[]
  ): void {
    // Length validation
    if (typeDef.minLength !== undefined && value.length < typeDef.minLength) {
      errors.push(`String at ${path} is too short (min: ${typeDef.minLength}, actual: ${value.length})`);
    }

    if (typeDef.maxLength !== undefined && value.length > typeDef.maxLength) {
      errors.push(`String at ${path} is too long (max: ${typeDef.maxLength}, actual: ${value.length})`);
    }

    // Pattern validation
    if (typeDef.pattern && !new RegExp(typeDef.pattern).test(value)) {
      errors.push(`String at ${path} does not match required pattern: ${typeDef.pattern}`);
    }

    // Enum validation
    if (typeDef.enum && !typeDef.enum.includes(value)) {
      errors.push(`String at ${path} is not one of allowed values: ${typeDef.enum.join(', ')}`);
    }
  }

  /**
   * Validate number value
   */
  private validateNumber(
    value: number,
    typeDef: TypeDefinition,
    path: string,
    errors: string[],
    _warnings: string[]
  ): void {
    // Range validation
    if (typeDef.min !== undefined && value < typeDef.min) {
      errors.push(`Number at ${path} is too small (min: ${typeDef.min}, actual: ${value})`);
    }

    if (typeDef.max !== undefined && value > typeDef.max) {
      errors.push(`Number at ${path} is too large (max: ${typeDef.max}, actual: ${value})`);
    }

    // Enum validation
    if (typeDef.enum && !typeDef.enum.includes(value)) {
      errors.push(`Number at ${path} is not one of allowed values: ${typeDef.enum.join(', ')}`);
    }
  }

  /**
   * Validate boolean value
   */
  private validateBoolean(
    value: boolean,
    typeDef: TypeDefinition,
    path: string,
    errors: string[],
    _warnings: string[]
  ): void {
    // Enum validation
    if (typeDef.enum && !typeDef.enum.includes(value)) {
      errors.push(`Boolean at ${path} is not one of allowed values: ${typeDef.enum.join(', ')}`);
    }
  }

  /**
   * Validate object value
   */
  private validateObject(
    value: Record<string, unknown>,
    typeDef: TypeDefinition,
    path: string,
    errors: string[],
    warnings: string[]
  ): void {
    if (!typeDef.properties) return;

    // Check required properties
    for (const [propName, propDef] of Object.entries(typeDef.properties)) {
      const propPath = `${path}.${propName}`;
      const propValue = value[propName];
      
      const result = this.validate(propValue, propDef, propPath);
      if (!result.valid) {
        errors.push(...result.errors);
      }
      warnings.push(...result.warnings);
    }

    // Check additional properties
    if (typeDef.additionalProperties === false) {
      const allowedProps = Object.keys(typeDef.properties || {});
      const actualProps = Object.keys(value);
      const extraProps = actualProps.filter(prop => !allowedProps.includes(prop));
      
      if (extraProps.length > 0) {
        errors.push(`Object at ${path} has unexpected properties: ${extraProps.join(', ')}`);
      }
    } else if (typeof typeDef.additionalProperties === 'object') {
      const allowedProps = Object.keys(typeDef.properties || {});
      const actualProps = Object.keys(value);
      const extraProps = actualProps.filter(prop => !allowedProps.includes(prop));
      
      for (const extraProp of extraProps) {
        const extraPropPath = `${path}.${extraProp}`;
        const result = this.validate(value[extraProp], typeDef.additionalProperties, extraPropPath);
        if (!result.valid) {
          errors.push(...result.errors);
        }
        warnings.push(...result.warnings);
      }
    }
  }

  /**
   * Validate array value
   */
  private validateArray(
    value: unknown[],
    typeDef: TypeDefinition,
    path: string,
    errors: string[],
    warnings: string[]
  ): void {
    if (!typeDef.items) return;

    // Validate each item
    if (typeDef.items) {
      value.forEach((item, index) => {
        const itemPath = `${path}[${index}]`;
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        const result = this.validate(item, typeDef.items!, itemPath);
        if (!result.valid) {
          errors.push(...result.errors);
        }
        warnings.push(...result.warnings);
      });
    }
  }

  /**
   * Validate flow configuration with comprehensive type checking
   */
  validateFlowConfig(data: unknown): ValidationResult {
    const flowTypeDef: TypeDefinition = {
      type: 'object',
      required: true,
      properties: {
        id: {
          type: 'string',
          required: true,
          pattern: '^[a-zA-Z][a-zA-Z0-9_-]*$',
          minLength: 1
        },
        name: {
          type: 'string',
          required: true,
          minLength: 1
        },
        version: {
          type: 'string',
          required: false
        },
        description: {
          type: 'string',
          required: false
        },
        initialStep: {
          type: 'string',
          required: true,
          minLength: 1
        },
        context: {
          type: 'object',
          required: true
        },
        steps: {
          type: 'array',
          required: true,
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                required: true,
                pattern: '^[a-zA-Z][a-zA-Z0-9_-]*$'
              },
              name: {
                type: 'string',
                required: true,
                minLength: 1
              },
              view: {
                type: 'object',
                required: true
              },
              navigation: {
                type: 'object',
                required: true
              }
            },
            additionalProperties: false
          }
        }
      },
      additionalProperties: false
    };

    return this.validate(data, flowTypeDef);
  }
}

// Export singleton instance
export const runtimeTypeValidator = new RuntimeTypeValidator();
