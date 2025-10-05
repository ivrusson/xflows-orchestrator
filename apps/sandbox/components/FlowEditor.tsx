import { useState, useEffect } from 'react';

interface FlowEditorProps {
  initialFlow: any;
  onFlowChange: (flow: any, error: string | null) => void;
  error: string | null;
}

export function FlowEditor({ initialFlow, onFlowChange }: FlowEditorProps) {
  const [flowJson, setFlowJson] = useState('');
  const [syntaxErrors, setSyntaxErrors] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    const jsonString = JSON.stringify(initialFlow, null, 2);
    setFlowJson(jsonString);
    setHistory([jsonString]);
    setHistoryIndex(0);
  }, [initialFlow]);

  const validateFlow = (jsonString: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    try {
      const parsed = JSON.parse(jsonString);
      
      // Basic structure validation
      if (!parsed.id) errors.push('Missing required field: id');
      if (!parsed.initial) errors.push('Missing required field: initial');
      if (!parsed.states) errors.push('Missing required field: states');
      
      // Validate initial state exists
      if (parsed.initial && parsed.states && !parsed.states[parsed.initial]) {
        errors.push(`Initial state "${parsed.initial}" not found in states`);
      }
      
      // Validate state transitions
      if (parsed.states) {
        Object.entries(parsed.states).forEach(([stateId, state]: [string, any]) => {
          if (state.on) {
            Object.values(state.on).forEach((target: any) => {
              if (typeof target === 'string') {
                // Allow external references like "#flowId.state"
                if (target.startsWith('#')) return;
                if (!parsed.states[target] && !target.match(/\./)) {
                  errors.push(`State "${stateId}" references non-existent state "${target}"`);
                }
              }
            });
          }
        });
      }
      
      return { isValid: errors.length === 0, errors };
    } catch (parseError) {
      const err = parseError as Error;
      return { isValid: false, errors: [`JSON Parse Error: ${err.message}`] };
    }
  };

  const handleJsonChange = (newJsonString: string) => {
    setFlowJson(newJsonString);
    
    // Check for syntax errors
    let errors: string[] = [];
    try {
      JSON.parse(newJsonString);
    } catch (syntaxError) {
      errors.push(`Syntax Error: ${(syntaxError as Error).message}`);
      setSyntaxErrors(errors);
      onFlowChange(null, errors[0]);
      return;
    }
    
    setSyntaxErrors([]);
    
    // Validate flow
    const validation = validateFlow(newJsonString);
    
    if (validation.isValid) {
      // Add to history
      setHistory(prev => [...prev.slice(0, historyIndex + 1), newJsonString]);
      setHistoryIndex(prev => prev + 1);
      
      onFlowChange(JSON.parse(newJsonString), null);
    } else {
      onFlowChange(null, validation.errors[0]);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setFlowJson(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setFlowJson(history[historyIndex + 1]);
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(flowJson);
      const formatted = JSON.stringify(parsed, null, 2);
      setFlowJson(formatted);
      handleJsonChange(formatted);
    } catch (e) {
      // Invalid JSON, don't format
    }
  };

  const insertTemplate = (template: string) => {
    const templates: Record<string, string> = {
      button: `
{
  "id": "button-example",
  "view": {
    "moduleId": "button-module"
  },
  "on": {
    "CLICK": "next-state"
  }
}`,
      validation: `
{
  "id": "validation-example", 
  "guards": [
    {
      "condition": {
        "field": "age",
        "operator": "gte",
        "value": 18
      },
      "errorMessage": "Must be 18+"
    }
  ]
}`,
      parallel: `
{
  "id": "parallel-example",
  "type": "parallel",
  "states": {
    "loading": {
      "on": {
        "COMPLETE": "done"
      }
    },
    "validation": {
      "on": {
        "VALID": "done"
      }
    }
  }
}`
    };

    const templateValue = templates[template] || '';
    setFlowJson(templateValue);
    handleJsonChange(templateValue);
  };

  const allErrors = [...syntaxErrors, ...validateFlow(flowJson).errors];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Editor Toolbar */}
      <div className="border-b px-4 py-2 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="px-2 py-1 text-sm bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
            >
              ↶ Undo
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="px-2 py-1 text-sm bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
            >
              ↷ Redo
            </button>
            <button
              onClick={formatJson}
              className="px-2 py-1 text-sm bg-blue-200 rounded hover:bg-blue-300"
            >
              🎨 Format
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Templates:</span>
            <button
              onClick={() => insertTemplate('button')}
              className="px-2 py-1 text-xs bg-green-200 rounded hover:bg-green-300"
            >
              Button
            </button>
            <button
              onClick={() => insertTemplate('validation')}
              className="px-2 py-1 text-xs bg-yellow-200 rounded hover:bg-yellow-300"
            >
              Validation
            </button>
            <button
              onClick={() => insertTemplate('parallel')}
              className="px-2 py-1 text-xs bg-purple-200 rounded hover:bg-purple-300"
            >
              Parallel
            </button>
          </div>
        </div>
      </div>

      {/* Error Panel */}
      {allErrors.length > 0 && (
        <div className="border-b bg-red-50 px-4 py-2">
          <div className="flex items-center space-x-2">
            <span className="text-red-600">⚠️</span>
            <div className="text-sm text-red-700">
              {allErrors.map((error, i) => (
                <div key={i}>{error}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* JSON Editor */}
      <div className="flex-1 overflow-hidden">
        <textarea
          value={flowJson}
          onChange={(e) => handleJsonChange(e.target.value)}
          className="w-full h-full p-4 font-mono text-sm border-0 resize-none focus:outline-none bg-gray-50"
          placeholder="Enter your flow JSON here..."
          spellCheck={false}
          style={{ 
            fontFamily: 'JetBrains Mono, Fira Code, Monaco, Consolas, monospace',
            fontSize: '13px',
            lineHeight: '1.5'
          }}
        />
      </div>

      {/* Editor Status */}
      <div className="border-t px-4 py-2 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>📝 Lines: {flowJson.split('\n').length}</span>
            <span>📏 Chars: {flowJson.length}</span>
            <span>✅ Valid: {allErrors.length === 0 ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
              JSON {allErrors.length === 0 ? '✓' : '✗'}
            </span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
              Flow Schema {allErrors.length === 0 ? '✓' : '✗'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
