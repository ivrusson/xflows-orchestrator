import React from 'react';

// Mock MFE simplificado para la aproximación 2
const SimpleMockMFE: React.FC<{
  moduleId: string;
  onEvent: (event: any) => void;
  description?: string;
}> = ({ moduleId, onEvent, description }) => {
  const getStepInfo = () => {
    const stepMap: Record<string, { title: string; emoji: string; description: string }> = {
      'quote-start': {
        title: 'Cotización Inicial',
        emoji: '🚀',
        description: 'Formulario básico para iniciar la cotización',
      },
      'mfe-coverage': {
        title: 'Selección de Coberturas',
        emoji: '🛡️',
        description: 'El usuario selecciona las coberturas deseadas',
      },
      'mfe-summary': {
        title: 'Resumen',
        emoji: '📋',
        description: 'Resumen final antes de confirmar la cotización',
      },
    };

    return stepMap[moduleId] || { title: moduleId, emoji: '📦', description: description || '' };
  };

  const stepInfo = getStepInfo();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mr-3">
          <span className="text-white text-lg">{stepInfo.emoji}</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{stepInfo.title}</h3>
          <p className="text-sm text-gray-600">
            Module ID: <code className="bg-gray-100 px-1 rounded">{moduleId}</code>
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded p-4 mb-4">
        <p className="text-sm text-gray-700 mb-3">
          <strong>📦 Host Orchestrator - Ciclo de vida MFE:</strong>
        </p>
        <div className="space-y-2 text-xs">
          <div className="flex items-center text-green-700">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            1. Host carga módulo remoto por{' '}
            <code className="bg-white px-1 rounded">{moduleId}</code>
          </div>
          <div className="flex items-center text-blue-700">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
            2. Renderiza componente en <code className="bg-white px-1 rounded">slot=main</code>
          </div>
          <div className="flex items-center text-purple-700">
            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
            3. Conecta eventos bridge con estado XState
          </div>
          <div className="flex items-center text-orange-700">
            <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
            4. Gestiona navegación basada en transiciones JSON
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">{stepInfo.description}</p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onEvent({ type: 'NEXT', payload: { basic: { productId: '7005' } } })}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Continuar
        </button>
        <button
          type="button"
          onClick={() => onEvent({ type: 'BACK' })}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
        >
          Atrás
        </button>
        {moduleId === 'mfe-coverage' && (
          <button
            type="button"
            onClick={() => onEvent({ type: 'COVERAGE.CHANGE', payload: { coverage: 'full' } })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Cambiar Cobertura
          </button>
        )}
        {moduleId === 'mfe-summary' && (
          <button
            type="button"
            onClick={() => onEvent({ type: 'CONFIRM' })}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            Confirmar Cotización
          </button>
        )}
      </div>
    </div>
  );
};

export const SimpleFlowOrchestrator: React.FC = () => {
  const [currentState, setCurrentState] = React.useState('quote.start');
  const [context, setContext] = React.useState({
    session: { channel: 'web', userId: null },
    quote: {},
    errors: {},
  });

  // Estados y transiciones (simulado sin XState para simplificar)
  const stateDefinitions: Record<string, any> = {
    'quote.start': {
      view: { moduleId: 'quote-start' },
      description: 'Formulario inicial para generar nueva cotización',
      nextEvents: ['NEXT'],
    },
    'quote.coverage': {
      view: { moduleId: 'mfe-coverage' },
      description: 'Selección de coberturas y opciones adicionales',
      nextEvents: ['NEXT', 'BACK', 'COVERAGE.CHANGE'],
    },
    'quote.summary': {
      view: { moduleId: 'mfe-summary' },
      description: 'Resumen final y confirmación',
      nextEvents: ['BACK', 'CONFIRM'],
    },
    'quote.submitting': {
      view: null,
      description: 'Guardando cotización en el servidor...',
      nextEvents: [],
    },
    done: {
      view: null,
      description: '✅ Cotización completada exitosamente',
      nextEvents: [],
    },
  };

  const handleEvent = (event: any) => {
    // Simular transiciones
    switch (currentState) {
      case 'quote.start':
        if (event.type === 'NEXT') {
          setContext((prev) => ({
            ...prev,
            quote: { ...prev.quote, basic: event.payload?.basic },
          }));
          setCurrentState('quote.coverage');
        }
        break;

      case 'quote.coverage':
        if (event.type === 'NEXT') {
          setCurrentState('quote.summary');
        } else if (event.type === 'BACK') {
          setCurrentState('quote.start');
        } else if (event.type === 'COVERAGE.CHANGE') {
          setContext((prev) => ({
            ...prev,
            quote: { ...prev.quote, selection: event.payload },
          }));
        }
        break;

      case 'quote.summary':
        if (event.type === 'CONFIRM') {
          setCurrentState('quote.submitting');
          // Simular procesamiento
          setTimeout(() => setCurrentState('done'), 2000);
        } else if (event.type === 'BACK') {
          setCurrentState('quote.coverage');
        }
        break;
    }
  };

  const currentStateDef = stateDefinitions[currentState];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header del estado actual */}
      <div
        className={`rounded-lg p-6 mb-6 ${
          currentState === 'done'
            ? 'bg-green-50 border border-green-200'
            : currentState === 'quote.submitting'
              ? 'bg-yellow-50 border border-yellow-200'
              : 'bg-blue-50 border border-blue-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{currentStateDef.description}</h2>
            <p className="text-sm text-gray-600 mt-1">
              Estado: <code className="bg-white px-2 py-1 rounded text-xs">{currentState}</code>
            </p>
          </div>
          {!stateDefinitions[currentState]?.nextEvents?.length && currentState !== 'done' && (
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
          )}
        </div>
      </div>

      {/* Context Viewer */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-700 mb-2">📋 Contexto del Flow</h3>
        <div className="bg-white rounded p-3 overflow-auto max-h-40">
          <pre className="text-xs text-gray-600">
            {JSON.stringify(
              {
                currentState,
                context,
                nextEvents: stateDefinitions[currentState]?.nextEvents || [],
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>

      {/* MFE Content */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🎨 Host Orchestrator Status</h3>

        {currentStateDef.view ? (
          <SimpleMockMFE
            moduleId={currentStateDef.view.moduleId}
            onEvent={handleEvent}
            description={currentStateDef.description}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-3">{currentState === 'done' ? '✅' : '⏳'}</div>
            <p className="text-gray-700">{currentStateDef.description}</p>
            {currentState === 'done' && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentState('quote.start');
                    setContext({
                      session: { channel: 'web', userId: null },
                      quote: {},
                      errors: {},
                    });
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Nueva Cotización
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Debug Panel */}
      <details className="mt-6 bg-gray-50 rounded p-4">
        <summary className="font-semibold cursor-pointer">🔧 Debug: Simple Flow</summary>
        <div className="mt-3 bg-white rounded p-3">
          <div className="mb-3">
            <strong>Características del Host Orchestrator:</strong>
            <ul className="text-sm text-gray-600 mt-2 space-y-1">
              <li>
                • <strong>JSON Simple:</strong> Enfocado en vista + navegación
              </li>
              <li>
                • <strong>Lifecycle Hooks:</strong> Entry/exit para cada MFE
              </li>
              <li>
                • <strong>Mock Services:</strong> HTTP registry simulada
              </li>
              <li>
                • <strong>Event Bridge:</strong> Host ↔ MFE comunicación
              </li>
              <li>
                • <strong>Context Binding:</strong> Compartir datos entre steps
              </li>
            </ul>
          </div>
          <div className="mb-2">
            <strong>Posibles eventos:</strong>
          </div>
          <div className="flex flex-wrap gap-2">
            {(stateDefinitions[currentState]?.nextEvents || []).map(
              (event: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleEvent({ type: event })}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
                >
                  {event}
                </button>
              )
            )}
          </div>
        </div>
      </details>
    </div>
  );
};
