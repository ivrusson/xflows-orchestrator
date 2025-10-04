import { useState } from 'react';
import { FlowOrchestrator } from './approaches/approach-1/components/FlowOrchestrator';
import { SimpleFlowOrchestrator } from './approaches/approach-2/components/SimpleFlowOrchestrator';
import { ValidationDemo } from './core/demo/ValidationDemo';
import { TestingHelper } from './components/TestingHelper';
import { PluginDemo } from './core/demo/PluginDemo';

function App() {
  const [selectedApproach, setSelectedApproach] = useState<
    'overview' | 'approach-1' | 'approach-2' | 'validation' | 'testing-mode' | 'plugins'
  >('overview');
  
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [enableTestMode, setEnableTestMode] = useState(false);

  // Testing Mode Component
  const TestingModeTab = () => (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 py-8">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🧪 Testing Mode</h1>
          <p className="text-lg text-gray-600">
            Comparación lado a lado de ambas aproximaciones para testing
          </p>
        </header>

        {/* Controls Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setShowDebugPanel(!showDebugPanel)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  showDebugPanel
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {showDebugPanel ? '🔄 Hide Debug' : '🔧 Show Debug'}
              </button>
              
              <button
                type="button"
                onClick={() => setEnableTestMode(!enableTestMode)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  enableTestMode
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {enableTestMode ? '🎯 Test Mode ON' : '🎮 Test Mode OFF'}
              </button>
            </div>

            <div className="text-sm text-gray-500">
              Session: {new Date().toLocaleTimeString()} | 
              Debug: {showDebugPanel ? 'ON' : 'OFF'} | 
              Test: {enableTestMode ? 'ON' : 'OFF'}
            </div>
          </div>
        </div>

        {/* Side by Side Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Approach 1 */}
          <div className="bg-white rounded-lg shadow-lg border-2 border-blue-200">
            <div className="bg-blue-600 text-white p-4 rounded-t-lg">
              <h2 className="text-xl font-bold">🔵 Approach 1: DSL Completo</h2>
              <p className="text-blue-100 text-sm">XState Machine Declarativa</p>
            </div>
            <div className="p-4">
              <FlowOrchestrator />
            </div>
          </div>

          {/* Approach 2 */}
          <div className="bg-white rounded-lg shadow-lg border-2 border-green-200">
            <div className="bg-green-600 text-white p-4 rounded-t-lg">
              <h2 className="text-xl font-bold">🟢 Approach 2: Host Simple</h2>
              <p className="text-green-100 text-sm">JSON Simple + Ciclo de Vida</p>
            </div>
            <div className="p-4">
              <SimpleFlowOrchestrator />
            </div>
          </div>
        </div>

        {/* Quick Test Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">⚡ Quick Test Actions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setSelectedApproach('approach-1')}
              className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
            >
              <div className="font-semibold text-blue-800">🔵 Test DSL Approach</div>
              <div className="text-sm text-blue-600 mt-1">Probar máquina XState completa</div>
            </button>
            
            <button
              type="button"
              onClick={() => setSelectedApproach('approach-2')}
              className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
            >
              <div className="font-semibold text-green-800">🟢 Test Simple Approach</div>
              <div className="text-sm text-green-600 mt-1">Probar host orchestrator</div>
            </button>
            
            <button
              type="button"
              onClick={() => setSelectedApproach('validation')}
              className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left"
            >
              <div className="font-semibold text-purple-800">🔧 Test Validation</div>
              <div className="text-sm text-purple-600 mt-1">Probar Zod + EJS + JSON Logic</div>
            </button>
          </div>
        </div>

        {/* Testing Helper */}
        <TestingHelper 
          approach="approach-1" 
          onApproachChange={(approach) => {
            setSelectedApproach(approach);
          }}
        />
      </div>
    </div>
  );

  const OverviewTab = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">🚀 XFlows Comparador</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Compara dos aproximaciones para crear un orquestador de microfrontends basado en flujos
            JSON interpretados por XState
          </p>
        </header>

        {/* Comparación lado a lado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Aproximación 1 */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-xl font-bold">1</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">DSL Completo</h2>
                <p className="text-sm text-gray-600">Flujos XState Declarativos</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-green-600">
                <span className="mr-2">✅</span>
                <span className="text-sm">Guards con json-logic avanzados</span>
              </div>
              <div className="flex items-center text-green-600">
                <span className="mr-2">✅</span>
                <span className="text-sm">Pipeline de acciones (HTTP, SignalR)</span>
              </div>
              <div className="flex items-center text-green-600">
                <span className="mr-2">✅</span>
                <span className="text-sm">Navegación condicional</span>
              </div>
              <div className="flex items-center text-green-600">
                <span className="mr-2">✅</span>
                <span className="text-sm">Manejo de errores robusto</span>
              </div>
              <div className="flex items-center text-green-600">
                <span className="mr-2">✅</span>
                <span className="text-sm">Soporte rollback/compensación</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Complejidad:</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '85%' }} />
              </div>
              <p className="text-xs text-red-600 mt-1">Alta complejidad implementacional</p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedApproach('approach-1')}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Ver Demo Completo
            </button>
          </div>

          {/* Aproximación 2 */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-green-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-xl font-bold">2</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Host Orchestrator</h2>
                <p className="text-sm text-gray-600">JSON Simple + Ciclo de vida</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-green-600">
                <span className="mr-2">✅</span>
                <span className="text-sm">Implementación gradual</span>
              </div>
              <div className="flex items-center text-green-600">
                <span className="mr-2">✅</span>
                <span className="text-sm">Enfoque en ciclo de vida MFE</span>
              </div>
              <div className="flex items-center text-green-600">
                <span className="mr-2">✅</span>
                <span className="text-sm">Mock HTTP/service registry</span>
              </div>
              <div className="flex items-center text-green-600">
                <span className="mr-2">✅</span>
                <span className="text-sm">Navegación tradicional</span>
              </div>
              <div className="flex items-center text-green-600">
                <span className="mr-2">✅</span>
                <span className="text-sm">Fácil extensión</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Complejidad:</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '35%' }} />
              </div>
              <p className="text-xs text-green-600 mt-1">Complejidad baja/moderada</p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedApproach('approach-2')}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Ver Demo Simple
            </button>
          </div>
        </div>

        {/* Nueva sección de funcionalidades */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            🎯 Nuevas Funcionalidades Implementadas
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">🔒</span>
                <h4 className="font-semibold text-purple-800">Schema Validation</h4>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex items-center text-green-600">
                  <span className="mr-2">✅</span>
                  <span>Zod + Ajv Integration</span>
                </div>
                <div className="flex items-center text-green-600">
                  <span className="mr-2">✅</span>
                  <span>JSON Schema Support</span>
                </div>
                <div className="flex items-center text-green-600">
                  <span className="mr-2">✅</span>
                  <span>Runtime Validation</span>
                </div>
                <div className="flex items-center text-green-600">
                  <span className="mr-2">✅</span>
                  <span>Business Rule Checks</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">🎨</span>
                <h4 className="font-semibold text-blue-800">Template Engine</h4>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex items-center text-green-600">
                  <span className="mr-2">✅</span>
                  <span>EJS + JSON Logic</span>
                </div>
                <div className="flex items-center text-green-600">
                  <span className="mr-2">✅</span>
                  <span>Variable Extraction</span>
                </div>
                <div className="flex items-center text-green-600">
                  <span className="mr-2">✅</span>
                  <span>Custom Filters</span>
                </div>
                <div className="flex items-center text-green-600">
                  <span className="mr-2">✅</span>
                  <span>Hybrid Expressions</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">🧠</span>
                <h4 className="font-semibold text-green-800">JSON Logic</h4>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex items-center text-green-600">
                  <span className="mr-2">✅</span>
                  <span>Guard Conditions</span>
                </div>
                <div className="flex items-center text-green-600">
                  <span className="mr-2">✅</span>
                  <span>Complex Expressions</span>
                </div>
                <div className="flex items-center text-green-600">
                  <span className="mr-2">✅</span>
                  <span>Nested Variables</span>
                </div>
                <div className="flex items-center text-green-600">
                  <span className="mr-2">✅</span>
                  <span>Math Functions</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => setSelectedApproach('validation')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              🔧 Ver Demo de Validación
            </button>
          </div>
        </div>

        {/* Tabla comparativa */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">📊 Comparación Detallada</h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700" />
                  <th className="text-left py-3 px-4 font-semibold text-blue-700">DSL Completo</th>
                  <th className="text-left py-3 px-4 font-semibold text-green-700">
                    Host Orchestrator
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">🎯 Enfoque</td>
                  <td className="py-3 px-4 text-gray-600">DSL declarativo completo</td>
                  <td className="py-3 px-4 text-gray-600">Ciclo de vida MFE principal</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">📝 JSON</td>
                  <td className="py-3 px-4 text-gray-600">Complejo, ~500 líneas</td>
                  <td className="py-3 px-4 text-gray-600">Simple, ~100 líneas</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">🔒 Guards</td>
                  <td className="py-3 px-4 text-gray-600">json-logic avanzado</td>
                  <td className="py-3 px-4 text-gray-600">Lógica en código</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">⚡ Acciones</td>
                  <td className="py-3 px-4 text-gray-600">Pipeline declarativo</td>
                  <td className="py-3 px-4 text-gray-600">Registry pattern</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">🧭 Navegación</td>
                  <td className="py-3 px-4 text-gray-600">Condicional con efectos</td>
                  <td className="py-3 px-4 text-gray-600">Basada en estados</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">❌ Errores</td>
                  <td className="py-3 px-4 text-gray-600">Severidades + páginas</td>
                  <td className="py-3 px-4 text-gray-600">Estados de error básicos</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">🔄 Rollback</td>
                  <td className="py-3 px-4 text-gray-600">Support nativo</td>
                  <td className="py-3 px-4 text-gray-600">Manual</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">⏱️ Setup</td>
                  <td className="py-3 px-4 text-gray-600">Propagación larga</td>
                  <td className="py-3 px-4 text-gray-600">Setup rápido</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">📈 Escalabilidad</td>
                  <td className="py-3 px-4 text-gray-600">Funcionalidad sin límites</td>
                  <td className="py-3 px-4 text-gray-600">Escalable paso a paso</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-gray-700">👥 Equipo</td>
                  <td className="py-3 px-4 text-gray-600">Expertos en DSL/XState</td>
                  <td className="py-3 px-4 text-gray-600">Desarrolladores React</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Recomendación */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-3">💡 Recomendación</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p className="font-semibold text-blue-700 mb-2">Elige aproximación 1 si:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Requieres validaciones complejas</li>
                <li>Pipelines de acciones necesarios</li>
                <li>Navegación condicional avanzada</li>
                <li>Manejo de errores robusto</li>
                <li>Equipo comprometido con DSL</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-green-700 mb-2">Elige aproximación 2 si:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Implementación gradual preferida</li>
                <li>Simplicidad inicial priorizada</li>
                <li>Navegación relativamente simple</li>
                <li>Enfoque en ciclo de vida MFE</li>
                <li>Prototipo rápido necesario</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con navegación */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">🚀 XFlows Evaluator</h1>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setSelectedApproach('overview')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedApproach === 'overview'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📊 Comparación
              </button>
              <button
                type="button"
                onClick={() => setSelectedApproach('testing-mode')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedApproach === 'testing-mode'
                    ? 'bg-yellow-600 text-white'
                    : 'text-yellow-600 hover:text-yellow-700'
                }`}
              >
                🧪 Testing Mode
              </button>
              <button
                type="button"
                onClick={() => setSelectedApproach('plugins')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedApproach === 'plugins'
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-600 hover:text-purple-700'
                }`}
              >
                🔌 Plugin System
              </button>
              <button
                type="button"
                onClick={() => setSelectedApproach('approach-1')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedApproach === 'approach-1'
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                🔵 DSL Completo
              </button>
              <button
                type="button"
                onClick={() => setSelectedApproach('approach-2')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedApproach === 'approach-2'
                    ? 'bg-green-600 text-white'
                    : 'text-green-600 hover:text-green-700'
                }`}
              >
                🟢 Host Simple
              </button>
              <button
                type="button"
                onClick={() => setSelectedApproach('validation')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedApproach === 'validation'
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-600 hover:text-purple-700'
                }`}
              >
                🔧 Validation
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main>
        {selectedApproach === 'overview' && <OverviewTab />}
        {selectedApproach === 'testing-mode' && <TestingModeTab />}
        {selectedApproach === 'approach-1' && (
          <div className="container mx-auto px-4 py-8">
            <FlowOrchestrator />
          </div>
        )}
        {selectedApproach === 'approach-2' && (
          <div className="container mx-auto px-4 py-8">
            <SimpleFlowOrchestrator />
          </div>
        )}
        {selectedApproach === 'validation' && (
          <div className="container mx-auto px-4 py-8">
            <ValidationDemo />
          </div>
        )}
        {selectedApproach === 'plugins' && (
          <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
            <PluginDemo />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
