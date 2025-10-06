/**
 * Result mapping utilities for HTTP responses
 */

export interface MapResultConfig {
  [contextPath: string]: string; // JSONPath expression
}

export class ResultMapper {
  /**
   * Map response data to context using JSONPath-like expressions
   */
  mapResult(data: unknown, mapConfig: MapResultConfig, context: Record<string, unknown>): void {
    for (const [contextPath, jsonPath] of Object.entries(mapConfig)) {
      const value = this.extractValue(data, jsonPath);
      this.setByPath(context, contextPath, value);
    }
  }

  /**
   * Extract value from data using JSONPath-like expression
   */
  private extractValue(data: unknown, path: string): unknown {
    if (path === '$') {
      return data;
    }

    if (path.startsWith('$.')) {
      const keys = path.substring(2).split('.');
      let current: unknown = data;
      
      for (const key of keys) {
        if (current && typeof current === 'object' && current !== null && key in current) {
          current = (current as Record<string, unknown>)[key];
        } else {
          return undefined;
        }
      }
      
      return current;
    }

    // Handle array access like $.items[0]
    if (path.includes('[') && path.includes(']')) {
      const [basePath, indexStr] = path.split('[');
      const index = Number.parseInt(indexStr.replace(']', ''));
      
      const baseValue = this.extractValue(data, basePath);
      if (Array.isArray(baseValue) && index >= 0 && index < baseValue.length) {
        return baseValue[index];
      }
      
      return undefined;
    }

    return undefined;
  }

  /**
   * Set nested property value using dot notation
   */
  private setByPath(obj: Record<string, unknown>, path: string, value: unknown): void {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof (current as Record<string, unknown>)[key] !== 'object' || (current as Record<string, unknown>)[key] === null) {
        (current as Record<string, unknown>)[key] = {};
      }
      current = (current as Record<string, unknown>)[key] as Record<string, unknown>;
    }
    
    (current as Record<string, unknown>)[keys[keys.length - 1]] = value;
  }
}

export const resultMapper = new ResultMapper();
