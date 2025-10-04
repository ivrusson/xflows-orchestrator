import { useState, useEffect } from 'react';

interface TestingHelperProps {
  approach: 'approach-1' | 'approach-2';
  onApproachChange: (approach: 'approach-1' | 'approach-2') => void;
}

export const TestingHelper: React.FC<TestingHelperProps> = ({ 
  approach, 
  onApproachChange 
}) => {
  const [testState, setTestState] = useState({
    isLoading: false,
    currentStep: 1,
    totalSteps: 5,
    startTime: Date.now(),
    events: [] as string[]
  });

  const testScenarios = [
    {
      id: 'happy-path',
      name: '✅ Happy Path',
      description: 'Flujo completo sin errores',
      steps: ['NEXT', 'FORM.SUBMIT', 'FORM.SUBMIT']
    },
    {
      id: 'error-recovery',
      name: '🔄 Error Recovery',
      description: 'Simulación de errores y recuperación',
      steps: ['NEXT', 'FORM.SUBMIT', 'ERROR', 'SUCCESS']
    },
    {
      id: 'navigation',
      name: '🧭 Navigation',
      description: 'Navegación hacia adelante y atrás',
      steps: ['NEXT', 'BACK', 'NEXT', 'FORM.SUBMIT']
    }
  ];

  const [currentScenario, setCurrentScenario] = useState(testScenarios[0]);

  // Auto-follow scenario
  useEffect(() => {
    if (testState.isLoading && currentScenario.steps.length > 0) {
      const interval = setInterval(() => {
        setTestState(prev => {
          if (prev.currentStep > currentScenario.steps.length) {
            setTestState(prev => ({ ...prev, isLoading: false, currentStep: 1 }));
            return prev;
          }
          return {
            ...prev,
            currentStep: prev.currentStep + 1,
            events: [...prev.events, currentScenario.steps[prev.currentStep - 1] || 'END']
          };
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [testState.isLoading, currentScenario.steps]);

  const runTestScenario = () => {
    setTestState({
      isLoading: true,
      currentStep: 1,
      totalSteps: currentScenario.steps.length,
      startTime: Date.now(),
      events: []
    });
  };

  const stopTest = () => {
    setTestState(prev => ({ ...prev, isLoading: false }));
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-80 z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">
          🧪 Testing Helper
        </h3>
                <button
                  type="button"
                  onClick={() => onApproachChange(approach === 'approach-1' ? 'approach-2' : 'approach-1')}
                  className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                >
                  Switch Approches
                </button>
      </div>

      {/* Current Status */}
      <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
        <div className="flex justify-between">
          <span>Testing:</span>
          <span className={`font-medium ${testState.isLoading ? 'text-green-600' : 'text-gray-500'}`}>
            {testState.isLoading ? 'RUNNING' : 'IDLE'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Current:</span>
          <span className="font-medium">{approach}</span>
        </div>
        {testState.isLoading && (
          <div className="mt-1">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-blue-500 h-1 rounded-full transition-all duration-300" 
                style={{ 
                  width: `${((testState.currentStep - 1) / testState.totalSteps) * 100}%` 
                }}
              />
            </div>
            <div className="text-center mt-1">
              {testState.currentStep - 1} / {testState.totalSteps}
            </div>
          </div>
        )}
      </div>

      {/* Scenarios */}
      <div className="mb-3">
        <div className="block text-xs font-medium text-gray-700 mb-2">
          Test Scenarios:
        </div>
        <select
          value={currentScenario.id}
          onChange={(e) => {
            const scenario = testScenarios.find(s => s.id === e.target.value) || testScenarios[0];
            setCurrentScenario(scenario);
          }}
          className="w-full text-xs p-1 border border-gray-300 rounded"
        >
          {testScenarios.map(scenario => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.name}
            </option>
          ))}
        </select>
      </div>

      {/* Scenario Description */}
      <div className="mb-3 text-xs text-gray-600 p-2 bg-blue-50 rounded">
        <div className="font-medium">{currentScenario.name}</div>
        <div>{currentScenario.description}</div>
        <div className="mt-1 text-gray-500">
          Steps: {currentScenario.steps.join(' → ')}
        </div>
      </div>

      {/* Controls */}
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={runTestScenario}
          disabled={testState.isLoading}
          className={`flex-1 px-3 py-1 text-xs rounded transition-colors ${
            testState.isLoading
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          ▶️ Run Test
        </button>
        
        {testState.isLoading && (
          <button
            type="button"
            onClick={stopTest}
            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            ⏹️ Stop
          </button>
        )}
      </div>

      {/* Event Log */}
      {testState.events.length > 0 && (
        <div className="mt-3">
          <div className="text-xs font-medium text-gray-700 mb-1">Event Log:</div>
          <div className="text-xs bg-gray-100 p-2 rounded max-h-20 overflow-y-auto">
            {testState.events.map((event, index) => (
              <div key={`event-${index}-${event}`} className="flex justify-between">
                <span>{event}</span>
                <span className="text-gray-500">{Math.floor((Date.now() - testState.startTime) / 1000)}s</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-3 pt-2 border-t border-gray-200">
        <div className="text-xs font-medium text-gray-700 mb-1">Quick Actions:</div>
        <div className="flex space-x-1">
          <button
            type="button"
            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            onClick={() => {
              // Simulate event
              const event = document.querySelector('[data-testid="trigger-event"]') as HTMLButtonElement;
              if (event) event.click();
            }}
          >
            Event
          </button>
          <button
            type="button"
            className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
            onClick={() => {
              setTestState(prev => ({
                ...prev,
                events: [...prev.events, 'RESET'],
                currentStep: 1
              }));
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
