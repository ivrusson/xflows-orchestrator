/**
 * JSON Logic Evaluator
 * Evaluates JSON Logic expressions
 */

export class JsonLogicEvaluator {
  /**
   * Evaluate JSON Logic expression
   */
  evaluate(expression: unknown, data: Record<string, unknown>): boolean {
    // Simple implementation - in production would use json-logic-js
    if (typeof expression === 'boolean') {
      return expression;
    }
    
    if (typeof expression === 'object' && expression !== null) {
      // Handle basic operators
      const expr = expression as Record<string, unknown>;
      
      if ('and' in expr) {
        const operands = expr.and as unknown[];
        return operands.every(op => this.evaluate(op, data));
      }
      
      if ('or' in expr) {
        const operands = expr.or as unknown[];
        return operands.some(op => this.evaluate(op, data));
      }
      
      if ('not' in expr) {
        return !this.evaluate(expr.not, data);
      }
      
      if ('var' in expr) {
        const path = expr.var as string;
        const value = this.getNestedValue(data, path);
        return Boolean(value);
      }
    }
    
    return false;
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current: unknown, key: string) => {
      return current && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined;
    }, obj);
  }
}
