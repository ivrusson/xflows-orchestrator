/**
 * Response validation utilities
 */

export interface ExpectConfig {
  status?: number | number[];
  contentType?: string;
  isError?: (response: Response, data: unknown) => boolean;
}

export interface ResponseValidationResult {
  valid: boolean;
  errors: string[];
}

export class ResponseValidator {
  /**
   * Validate HTTP response against expectations
   */
  validateResponse(response: Response, expect?: ExpectConfig): ResponseValidationResult {
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
   * Check if response indicates an error based on custom logic
   */
  isError(response: Response, data: unknown, isErrorFn?: (response: Response, data: unknown) => boolean): boolean {
    if (isErrorFn) {
      return isErrorFn(response, data);
    }
    
    // Default error detection: 4xx and 5xx status codes
    return response.status >= 400;
  }
}

export const responseValidator = new ResponseValidator();
