/**
 * Response validation utilities
 */

export interface ExpectConfig {
  status?: number | number[];
  schema?: string;
  contentType?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class ResponseValidator {
  /**
   * Validate HTTP response against expectations
   */
  validateResponse(response: Response, expect?: ExpectConfig): ValidationResult {
    const errors: string[] = [];

    if (!expect) {
      return { valid: true, errors: [] };
    }

    // Validate status code
    if (expect.status !== undefined) {
      const expectedStatuses = Array.isArray(expect.status) ? expect.status : [expect.status];
      if (!expectedStatuses.includes(response.status)) {
        errors.push(`Expected status ${expectedStatuses.join(' or ')}, got ${response.status}`);
      }
    }

    // Validate content type
    if (expect.contentType) {
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes(expect.contentType)) {
        errors.push(`Expected content-type ${expect.contentType}, got ${contentType}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate response data against schema (basic implementation)
   */
  async validateSchema(data: any, schemaName: string): Promise<ValidationResult> {
    // This is a basic implementation - in a real system you'd use JSON Schema
    const errors: string[] = [];

    // For now, we'll do basic type checking based on schema name
    switch (schemaName) {
      case 'QuickQuoteVerifyResponse':
        if (!data || typeof data !== 'object') {
          errors.push('Expected object for QuickQuoteVerifyResponse');
        } else {
          if (typeof data.status !== 'string') {
            errors.push('Expected status field to be string');
          }
          if (typeof data.code !== 'string') {
            errors.push('Expected code field to be string');
          }
        }
        break;
      
      case 'UserResponse':
        if (!data || typeof data !== 'object') {
          errors.push('Expected object for UserResponse');
        } else {
          if (typeof data.id !== 'string' && typeof data.id !== 'number') {
            errors.push('Expected id field to be string or number');
          }
          if (typeof data.name !== 'string') {
            errors.push('Expected name field to be string');
          }
        }
        break;
      
      default:
        // Unknown schema - just log warning
        console.warn(`Unknown schema: ${schemaName}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const responseValidator = new ResponseValidator();
