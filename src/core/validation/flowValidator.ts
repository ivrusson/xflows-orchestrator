import type { FlowContext } from '../../approaches/approach-1/sales-flow-machine';
import { templateEngine } from '../templating/templateEngine';
import { FlowDefinitionSchema } from './schemaValidator';

// Validador específico para flujos de ventas
export class FlowValidator {
  // Validar estructura completa del flujo
  validateFlowStructure(flowDefinition: unknown): {
    valid: boolean;
    errors: string[];
    warnings: string[];
    data?: unknown;
  } {
    const result = FlowDefinitionSchema.safeParse(flowDefinition);

    if (!result.success) {
      return {
        valid: false,
        errors: result.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`),
        warnings: [],
      };
    }

    const warnings: string[] = [];
    const data = result.data;

    // Validaciones adicionales de negocio
    this.validateBusinessRules(data, warnings);

    return {
      valid: true,
      errors: [],
      warnings,
      data,
    };
  }

  // Validar guards con JSON Logic
  validateGuards(
    guards: Array<{ id: string; condition: unknown }>,
    context: FlowContext
  ): {
    valid: boolean;
    errors: string[];
    invalidGuards: string[];
  } {
    const errors: string[] = [];
    const invalidGuards: string[] = [];

    for (const guard of guards) {
      try {
        // Verificar que la condición sea JSON Logic válida
        if (typeof guard.condition !== 'object' || guard.condition === null) {
          errors.push(`Guard '${guard.id}': condition must be a JSON Logic object`);
          invalidGuards.push(guard.id);
          continue;
        }

        // Probar evaluación con contexto de prueba
        const testContext: FlowContext = {
          dossierId: 'test-dossier',
          riskScore: 50,
          applicantId: null,
          signatureId: null,
          policyId: null,
          errors: [],
          session: {
            testData: 'sample',
          },
          results: {
            testStep: { status: 'success' },
          },
        };

        const evaluationResult = templateEngine.evaluateJsonLogic(guard.condition, testContext);

        // Verificar que el resultado sea una expresión válida
        if (typeof evaluationResult !== 'boolean') {
          errors.push(`Guard '${guard.id}': JSON Logic expression must evaluate to boolean`);
          invalidGuards.push(guard.id);
        }

        // Validar variables utilizadas en el guard
        const conditionStr = JSON.stringify(guard.condition);
        const requiredVars = templateEngine.extractVariables(conditionStr);
        const validation = templateEngine.validateTemplateRequiments(conditionStr, testContext);

        if (!validation.valid) {
          warnings.push(`Guard '${guard.id}': missing variables ${validation.missing.join(', ')}`);
        }
      } catch (error) {
        errors.push(
          `Guard '${guard.id}': evaluation error - ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        invalidGuards.push(guard.id);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      invalidGuards,
    };
  }

  // Validar templates en acciones
  validateTemplates(
    stepDef: any,
    context: FlowContext
  ): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (stepDef.interstep?.beforeNext) {
      for (const action of stepDef.interstep.beforeNext) {
        // Validar URL templates
        if (action.url && typeof action.url === 'string') {
          const validation = this.validateUrlTemplate(action.url, context);
          if (!validation.valid) {
            errors.push(`Action '${action.id}': URL template invalid - ${validation.error}`);
          }
        }

        // Validar body templates
        if (action.body && typeof action.body === 'string') {
          const validation = this.validateBodyTemplate(action.body, context);
          if (!validation.valid) {
            errors.push(`Action '${action.id}': Body template invalid - ${validation.error}`);
          }
        }

        // Validar mapResult templates
        if (action.mapResult && typeof action.mapResult === 'object') {
          for (const [path, expression] of Object.entries(action.mapResult)) {
            if (typeof expression === 'string') {
              const validation = this.validateResultTemplate(expression, context);
              if (!validation.valid) {
                errors.push(
                  `Action '${action.id}': mapResult path '${path}' invalid - ${validation.error}`
                );
              }
            }
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Validar navegación condicional
  validateNavigation(
    navigation: any,
    context: FlowContext
  ): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (navigation.next && typeof navigation.next === 'object') {
      // Navegación condicional
      if (navigation.next.conditions) {
        for (const condition of navigation.next.conditions) {
          // Validar condición `if`
          if (condition.if) {
            try {
              const evaluationResult = templateEngine.evaluateHybridExpression(
                JSON.stringify(condition.if),
                context
              );

              if (typeof evaluationResult !== 'boolean') {
                errors.push(`Navigation condition 'if' must evaluate to boolean`);
              }
            } catch (error) {
              errors.push(
                `Navigation condition evaluation error: ${error instanceof Error ? error.message : 'Unknown error'}`
              );
            }
          }

          // Validar efectos
          if (condition.effects) {
            for (const effect of condition.effects) {
              if (effect.assign && typeof effect.assign === 'object') {
                for (const [path, value] of Object.entries(effect.assign)) {
                  if (typeof value === 'string' && value.includes('<%')) {
                    const validation = this.validateAssignTemplate(value, context);
                    if (!validation.valid) {
                      errors.push(
                        `Navigation effect assign '${path}' invalid - ${validation.error}`
                      );
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Validar reglas de negocio específicas
  private validateBusinessRules(flowData: any, warnings: string[]): void {
    // Validar IDs únicos
    const stepIds = flowData.steps.map((s: any) => s.id);
    const duplicateIds = stepIds.filter(
      (id: string, index: number) => stepIds.indexOf(id) !== index
    );
    if (duplicateIds.length > 0) {
      warnings.push(`Duplicate step IDs found: ${duplicateIds.join(', ')}`);
    }

    // Validar referencias a steps inexistentes
    for (const step of flowData.steps) {
      let nextStep = null;
      if (typeof step.navigation?.next === 'string') {
        nextStep = step.navigation.next;
      } else if (typeof step.navigation?.next === 'object') {
        nextStep = step.navigation.next.default;
      }

      if (nextStep && !stepIds.includes(nextStep)) {
        warnings.push(`Step '${step.id}' references non-existent next step '${nextStep}'`);
      }

      if (step.navigation?.back && !stepIds.includes(step.navigation.back)) {
        warnings.push(
          `Step '${step.id}' references non-existent back step '${step.navigation.back}'`
        );
      }
    }

    // Validar páginas de error
    if (flowData.errorHandling?.errorPages) {
      const errorPageKeys = Object.keys(flowData.errorHandling.errorPages);
      for (const step of flowData.steps) {
        if (step.guards) {
          for (const guard of step.guards) {
            if (guard.errorPage && !errorPageKeys.includes(guard.errorPage)) {
              warnings.push(
                `Step '${step.id}' guard '${guard.id}' references non-existent error page '${guard.errorPage}'`
              );
            }
          }
        }
      }
    }

    // Validar módulos MFE requeridos
    const mfeSteps = flowData.steps.filter((s: any) => s.type === 'mfe' && s.meta?.view?.moduleId);

    const moduleIds = mfeSteps.map((s: any) => s.meta.view.moduleId);
    const duplicateModules = moduleIds.filter(
      (id: string, index: number) => id && moduleIds.indexOf(id) !== index
    );

    if (duplicateModules.length > 0) {
      warnings.push(`Duplicate MFE module IDs: ${duplicateModules.join(', ')}`);
    }
  }

  // Validar template de URL
  private validateUrlTemplate(
    template: string,
    context: FlowContext
  ): { valid: boolean; error?: string } {
    try {
      const rendered = templateEngine.renderEjsTemplate(template, context);
      // Verificar que sea una URL válida
      if (!rendered.startsWith('/') && !rendered.match(/^https?:\/\//)) {
        return { valid: false, error: 'URL must start with / or HTTP/HTTPS' };
      }
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Validar template de body
  private validateBodyTemplate(
    template: string,
    context: FlowContext
  ): { valid: boolean; error?: string } {
    try {
      templateEngine.renderEjsTemplate(template, context);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Validar template de resultado
  private validateResultTemplate(
    template: string,
    context: FlowContext
  ): { valid: boolean; error?: string } {
    try {
      // Puede ser JSON Path ($.field) o template EJS
      if (template.startsWith('$.')) {
        // JSON Path - solo validar sintaxis básica
        const pathMatch = template.match(/^\$\.([\w\[\]"\'-]+)+$/);
        if (!pathMatch) {
          return { valid: false, error: 'Invalid JSON Path syntax' };
        }
      } else if (template.includes('<%')) {
        // Template EJS
        templateEngine.renderEjsTemplate(template, context);
      }
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Validar template de asignación
  private validateAssignTemplate(
    template: string,
    context: FlowContext
  ): { valid: boolean; error?: string } {
    try {
      templateEngine.renderEjsTemplate(template, context);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Instancia singleton del flow validator
export const flowValidator = new FlowValidator();

// Función de conveniencia para validar flujo completo
export function validateCompleteFlow(
  flowDefinition: unknown,
  context: FlowContext
): {
  valid: boolean;
  errors: string[];
  warnings: string[];
  structure?: any;
  guards?: any;
  templates?: any;
  navigation?: any;
} {
  // Validar estructura
  const structureValidation = flowValidator.validateFlowStructure(flowDefinition);
  if (!structureValidation.valid) {
    return {
      valid: false,
      errors: structureValidation.errors,
      warnings: structureValidation.warnings,
    };
  }

  const flowData = structureValidation.data as any;
  const allErrors: string[] = [...structureValidation.errors];
  const allWarnings: string[] = [...structureValidation.warnings];

  // Validar guards
  const guardValidation = flowValidator.validateGuards(
    flowData.steps.flatMap((step: any) => step.guards || []),
    context
  );
  if (!guardValidation.valid) {
    allErrors.push(...guardValidation.errors);
  }

  // Validar templates
  const templateValidation = flowValidator.validateTemplates(flowData, context);
  if (!templateValidation.valid) {
    allErrors.push(...templateValidation.errors);
  }

  // Validar navegación
  const navigationValidation = flowValidator.validateNavigation(flowData, context);
  if (!navigationValidation.valid) {
    allErrors.push(...navigationValidation.errors);
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    structure: structureValidation,
    guards: guardValidation,
    templates: templateValidation,
    navigation: navigationValidation,
  };
}
