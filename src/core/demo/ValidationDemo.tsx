import type React from 'react';
import { useState } from 'react';
import type { FlowContext } from '../../approaches/approach-1/sales-flow-machine';
import { templateEngine } from '../templating/templateEngine';
import { validateCompleteFlow } from '../validation/flowValidator';
import { FlowDefinitionSchema } from '../validation/schemaValidator';

export const ValidationDemo: React.FC = () => {
  const [validationResults, setValidationResults] = useState<Record<string, unknown> | null>(null);
  const [templateResults, setTemplateResults] = useState<Record<string, unknown> | null>(null);
  const [testFlowJson, setTestFlowJson] = useState(`{
  "id": "7006",
  "name": "Vida - Flujo Completo",
  "version": "1.0.0",
  "steps": [
    {
      "id": "quickquote",
      "title": "Calculadora",
      "type": "mfe",
      "guards": [
        {
          "id": "hasDossierId",
          "condition": {
            "!!": [{"var": "context.dossierId"}]
          },
          "errorPage": "/error/session-expired"
        }
      ],
      "interstep": {
        "beforeNext": [
          {
            "id": "saveToDossier",
            "type": "http",
            "url": "/api/dossier/{{context.dossierId}}/steps/quickquote",
            "body": "{{session.quickquote}}"
          }
        ]
      },
      "navigation": {
        "next": {
          "default": "underwriting",
          "conditions": [
            {
              "if": {
                ">": [{"var": "context.riskScore"}, 80]
              },
              "to": "error-step"
            }
          ]
        }
      }
    }
  ]
}`);

  const [testTemplate, setTestTemplate] = useState('Bienvenido <%= client.name %> - Tu score es <%= context.riskScore %>');
  
  const [testJsonLogic, setTestJsonLogic] = useState(`{
  "and": [
    {"!!": [{"var": "context.dossierId"}]},
    {"<=": [{"var": "context.riskScore"}, 80]}
  ]
}`);

  // Mock context para pruebas
  const mockContext: FlowContext & { client: { name: string } } = {
    dossierId: 'doc-12345',
    riskScore: 75,
    applicantId: 'applicant-789',
    signatureId: null,
    policyId: null,
    errors: [],
    client: { name: 'Juan Pérez' },
    session: {
      quickquote: { amount: 50000, coverage: 'full' },
    },
    results: {
      quickquote: {
        saveToDossier: { status: 'success', timestamp: Date.now() },
      },
    },
  };

  // Ejecutar todas las validaciones
  const runValidations = () => {
    try {
      // Validación de esquema
      const schemaValidation = FlowDefinitionSchema.safeParse(JSON.parse(testFlowJson));
      
      // Evaluación de template
      const templateEval = templateEngine.renderEjsTemplate(testTemplate, mockContext);
      
      // Evaluación de JSON Logic
      const jsonLogicEval = templateEngine.evaluateJsonLogic(
        JSON.parse(testJsonLogic),
        mockContext
      );
      
      // Extracción de variables
      const templateVars = templateEngine.extractVariables(testTemplate);
      const jsonLogicVars = templateEngine.extractVariables(testJsonLogic);
      
      // Validación completa del flujo
      const completeValidation = validateCompleteFlow(JSON.parse(testFlowJson), mockContext);

      setValidationResults({
        schema: schemaValidation.success ? '✅ Valid' : '❌ Invalid',
        schemaErrors: schemaValidation.success ? null : schemaValidation.error.errors,
        completeFlow: completeValidation.valid ? '✅ Valid' : '❌ Invalid',
        completeErrors: completeValidation.errors,
        completeWarnings: completeValidation.warnings,
      });

      setTemplateResults({
        templateOutput: templateEval,
        templateVariables: templateVars,
        jsonLogicResult: jsonLogicEval ? '✅ True' : '❌ False',
        jsonLogicVariables: jsonLogicVars,
        templateValidation: templateEngine.validateTemplateRequiments(testTemplate, mockContext),
      });

    } catch (error) {
      setValidationResults({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">🔧 Validation & Templating System Demo</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de Entrada */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">📝 Flow JSON Schema Validation</h2>
            <textarea
              value={testFlowJson}
              onChange={(e) => setTestFlowJson(e.target.value)}
              className="w-full h-48 p-3 border rounded-lg font-mono text-sm"
              placeholder="JSON Flow Definition..."
            />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">🎨 EJS Template</h2>
            <textarea
              value={testTemplate}
              onChange={(e) => setTestTemplate(e.target.value)}
              className="w-full h-24 p-3 border rounded-lg font-mono text-sm"
              placeholder="EJS Template..."
            />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">🧠 JSON Logic Condition</h2>
            <textarea
              value={testJsonLogic}
              onChange={(e) => setTestJsonLogic(e.target.value)}
              className="w-full h-24 p-3 border rounded-lg font-mono text-sm"
              placeholder="JSON Logic expression..."
            />
          </div>

          <button
            type="button"
            onClick={runValidations}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            🚀 Ejecutar Validaciones
          </button>
        </div>

        {/* Panel de Resultados */}
        <div className="space-y-6">
          {validationResults && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">📊 Validation Results</h2>
              
              <div className="space-y-3">
                <div className={`p-3 rounded ${validationResults.schema?.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <strong>Schema Validation:</strong> {validationResults.schema}
                </div>

                {validationResults.schemaErrors && (
                  <div className="bg-red-50 p-3 rounded">
                    <strong>Schema Errors:</strong>
                    <ul className="mt-2 text-sm">
                      {validationResults.schemaErrors.map((error: Record<string, unknown>, index: number) => (
                        <li key={`schema-error-${index}`}>• {Array.isArray(error.path) ? error.path.join('.') : 'unknown'}: {String(error.message || 'Unknown error')}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className={`p-3 rounded ${validationResults.completeFlow?.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <strong>Complete Flow Validation:</strong> {validationResults.completeFlow}
                </div>

                {validationResults.completeErrors && validationResults.completeErrors.length > 0 && (
                  <div className="bg-red-50 p-3 rounded">
                    <strong>Flow Errors:</strong>
                    <ul className="mt-2 text-sm">
                      {validationResults.completeErrors.map((error: string, index: number) => (
                        <li key={`complete-error-${index}`}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {validationResults.completeWarnings && validationResults.completeWarnings.length > 0 && (
                  <div className="bg-yellow-50 p-3 rounded">
                    <strong>Warnings:</strong>
                    <ul className="mt-2 text-sm">
                      {validationResults.completeWarnings.map((warning: string, index: number) => (
                        <li key={`warning-${index}`}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {templateResults && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">🎭 Template & Logic Results</h2>
              
              <div className="space-y-3">
                <div className="bg-blue-50 p-3 rounded">
                  <strong>EJS Template Output:</strong>
                  <div className="mt-2 font-mono text-sm bg-white p-2 rounded">
                    {templateResults.templateOutput}
                  </div>
                </div>

                <div className="bg-green-50 p-3 rounded">
                  <strong>JSON Logic Result:</strong> {templateResults.jsonLogicResult}
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <strong>Template Variables Found:</strong>
                  <div className="mt-2 text-sm">
                    {templateResults.templateVariables.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {templateResults.templateVariables.map((variable: string, index: number) => (
                          <span key={`template-var-${index}`} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {variable}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">No variables found</span>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <strong>JSON Logic Variables:</strong>
                  <div className="mt-2 text-sm">
                    {templateResults.jsonLogicVariables.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {templateResults.jsonLogicVariables.map((variable: string, index: number) => (
                          <span key={`logic-var-${index}`} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            {variable}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">No variables found</span>
                    )}
                  </div>
                </div>

                {templateResults.templateValidation && (
                  <div className={`p-3 rounded ${templateResults.templateValidation.valid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    <strong>Template Validation:</strong> {templateResults.templateValidation.valid ? '✅ Valid' : '❌ Invalid'}
                    
                    {templateResults.templateValidation.missing && templateResults.templateValidation.missing.length > 0 && (
                      <div className="mt-2 text-sm">
                        <strong>Missing:</strong> {templateResults.templateValidation.missing.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ejemplos de uso */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">📚 Examples of Validation & Templates</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded p-4">
            <h3 className="font-semibold mb-2">🔒 Schema Validation Examples</h3>
            <div className="text-sm space-y-2 font-mono">
              <div className="bg-green-100 p-2 rounded">
                <strong>✓ Valid:</strong> <code>{JSON.stringify({id: "7006", version: "1.0.0", steps: []})}</code>
              </div>
              <div className="bg-red-100 p-2 rounded">
                <strong>✗ Invalid:</strong> <code>{JSON.stringify({version: "invalid", steps: "not-array"})}</code>
              </div>
            </div>
          </div>

          <div className="bg-white rounded p-4">
            <h3 className="font-semibold mb-2">🧠 JSON Logic Examples</h3>
            <div className="text-sm space-y-2 font-mono">
              <div className="bg-blue-100 p-2 rounded">
                <strong>Guard:</strong> <code>{JSON.stringify({"!!": [{"var": "context.dossierId"}]})}

</code>
              </div>
              <div className="bg-purple-100 p-2 rounded">
                <strong>Condition:</strong> <code>{JSON.stringify({"<": [{"var": "context.riskScore"}, 80]})}</code>
              </div>
            </div>
          </div>

          <div className="bg-white rounded p-4">
            <h3 className="font-semibold mb-2">🎨 EJS Template Examples</h3>
            <div className="text-sm space-y-2 font-mono">
              <div className="bg-blue-100 p-2 rounded">
                <strong>Dynamic Message:</strong> <code>{"¡Hola {{client.name}}! Tu solicitud {{context.policyId ? 'está lista' : 'está pendiente'}}."}</code>
              </div>
              <div className="bg-purple-100 p-2 rounded">
                <strong>Dynamic URL:</strong> <code>/api/dossier/{"{{"}context.dossierId{"}}"}/steps/{"{{"}step.id{"}}"}</code>
              </div>
            </div>
          </div>

          <div className="bg-white rounded p-4">
            <h3 className="font-semibold mb-2">🎨 Template Features</h3>
            <div className="text-sm space-y-2">
              <div className="bg-green-100 p-2 rounded">
                <strong>✓ Multiple validators:</strong> Zod + Ajv
              </div>
              <div className="bg-blue-100 p-2 rounded">
                <strong>✓ Template engine:</strong> EJS + JSON Logic
              </div>
              <div className="bg-purple-100 p-2 rounded">
                <strong>✓ Business rules:</strong> Auto-validation
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
