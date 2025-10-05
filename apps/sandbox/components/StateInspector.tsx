import { useState } from 'react';

interface StateInspectorProps {
  flow: any;
}

export function StateInspector({ flow }: StateInspectorProps) {
  const [selectedState, setSelectedState] = useState<string | null>(flow?.initial || null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['states']));

  const toggleNode = (nodeKey: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeKey)) {
      newExpanded.delete(nodeKey);
    } else {
      newExpanded.add(nodeKey);
    }
    setExpandedNodes(newExpanded);
  };

  const renderObjectNode = (key: string, value: any, path: string = '', level: number = 0) => {
    const nodeKey = path ? `${path}.${key}` : key;
    const hasChildren = typeof value === 'object' && value !== null;
    const isExpanded = expandedNodes.has(nodeKey);
    const isSelected = selectedState === key && path === 'states';

    return (
      <div key={nodeKey} className="text-sm" style={{ marginLeft: `${level * 16}px` }}>
        <div 
          className={`flex items-center py-1 cursor-pointer hover:bg-gray-100 rounded ${
            isSelected ? 'bg-blue-50 text-blue-700' : ''
          } ${path === 'states' ? 'font-medium' : ''}`}
          onClick={() => {
            if (path === 'states') {
              setSelectedState(key);
            }
            if (hasChildren) {
              toggleNode(nodeKey);
            }
          }}
        >
          {hasChildren ? (
            <span className="mr-1">
              {isExpanded ? '📂' : '📁'}
            </span>
          ) : (
            <span className="mr-1 w-4">📄</span>
          )}
          <span className="text-blue-600">{key}:</span>
          {!hasChildren && (
            <span className="ml-2 text-gray-600">
              {typeof value === 'string' ? `"${value}"` : 
               typeof value === 'boolean' ? (value ? 'true' : 'false') :
               JSON.stringify(value)}
            </span>
          )}
        </div>
        
        {isExpanded && hasChildren && (
          <div>
            {Object.entries(value).map(([subKey, subValue]) =>
              renderObjectNode(subKey, subValue, nodeKey, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const renderTransitions = () => {
    const state = selectedState ? flow?.states?.[selectedState] : null;
    if (!state?.on) return null;

    return (
      <div className="mt-4">
        <h5 className="font-medium text-gray-700 mb-2">🔄 Transitions</h5>
        <div className="space-y-2">
          {Object.entries(state.on).map(([event, target]) => {
            const targetStr = Array.isArray(target) ? target.join(' | ') : String(target);
            return (
              <div key={event} className="flex items-center p-2 bg-gray-50 rounded border">
                <span className="text-blue-600 font-medium">{event}</span>
                <span className="mx-2 text-gray-400">→</span>
                <span className="text-green-600 font-mono">{targetStr}</span>
              </div>
            ) as JSX.Element;
          })}
        </div>
      </div>
    );
  };

  const renderStateDetails = () => {
    if (!selectedState || !flow?.states?.[selectedState]) {
      return (
        <div className="text-center text-gray-500 py-8">
          <p className="text-lg mb-2">🔍</p>
          <p>Select a state from the tree to inspect its details</p>
        </div>
      );
    }

    const state = flow.states[selectedState];
    
    return (
      <div className="space-y-4">
        <div>
          <h5 className="font-medium text-gray-700 mb-2">📍 State: {selectedState}</h5>
          <div className="bg-gray-50 p-3 rounded border">
            <div className="space-y-2 text-sm">
              {state.type && (
                <div><span className="text-blue-600">Type:</span> {state.type}</div>
              )}
              {state.view?.moduleId && (
                <div><span className="text-blue-600">View:</span> {state.view.moduleId}</div>
              )}
              {state.view?.slot && (
                <div><span className="text-blue-600">Slot:</span> {state.view.slot}</div>
              )}
            </div>
          </div>
        </div>

        {renderTransitions()}

        {state.guards && (
          <div>
            <h5 className="font-medium text-gray-700 mb-2">🛡️ Guards</h5>
            <div className="space-y-2">
              {state.guards.map((guard: any, i: number) => (
                <div key={i} className="bg-yellow-50 p-2 rounded border text-sm">
                  <pre className="text-xs">{JSON.stringify(guard, null, 2)}</pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {state.onEntry && (
          <div>
            <h5 className="font-medium text-gray-700 mb-2">⏩ Entry Actions</h5>
            <div className="bg-green-50 p-2 rounded border text-sm">
              <pre className="text-xs">{JSON.stringify(state.onEntry, null, 2)}</pre>
            </div>
          </div>
        )}

        {state.onExit && (
          <div>
            <h5 className="font-medium text-gray-700 mb-2">⏸️ Exit Actions</h5>
            <div className="bg-red-50 p-2 rounded border text-sm">
              <pre className="text-xs">{JSON.stringify(state.onExit, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStateDiagram = () => {
    if (!flow?.states) return null;

    const states = Object.keys(flow.states);
    const initialState = flow.initial;
    const finalStates = states.filter(state => flow.states[state].type === 'final');

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded border">
        <h4 className="font-medium text-gray-700 mb-3">🗺️ State Diagram</h4>
        <div className="space-y-4">
          {/* Initial State */}
          {initialState && (
            <div className="flex justify-center">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                🎯 {initialState}
              </span>
            </div>
          )}
          
          {/* Regular States */}
          <div className="flex flex-wrap gap-1 justify-center">
            {states.filter(s => s !== initialState && !finalStates.includes(s)).map(state => (
              <span key={state} className={`px-2 py-1 rounded text-xs ${
                selectedState === state ? 'bg-blue-200 text-blue-900' : 'bg-gray-200 text-gray-700'
              }`}>
                📦 {state}
              </span>
            ))}
          </div>
          
          {/* Final States */}
          {finalStates.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center">
              {finalStates.map(state => (
                <span key={state} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                  ✅ {state}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!flow) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <p className="text-lg mb-2">🔍</p>
          <p>No flow loaded</p>
          <p className="text-sm mt-1">Load a flow in the editor to inspect its states</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Inspector Toolbar */}
      <div className="border-b px-4 py-2 bg-gray-50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">🔍 State Inspector</span>
          <div className="flex space-x-2">
            <button className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300">
              🗜️ Collapse All
            </button>
            <button className="px-2 py-1 text-xs bg-green-200 rounded hover:bg-green-300">
              📄 Expand All
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Flow Structure */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">📋 Flow Structure</h3>
          <div className="bg-white border rounded p-2 max-h-40 overflow-auto">
            {renderObjectNode('states', flow.states)}
          </div>
        </div>

        {renderStateDiagram()}

        {/* State Details */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">⚙️ State Details</h3>
          <div className="bg-white border rounded p-4">
            {renderStateDetails()}
          </div>
        </div>

        {/* Context */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">📋 Context</h3>
          <div className="bg-white border rounded p-2 max-h-32 overflow-auto">
            <pre className="text-xs text-gray-600">
              {JSON.stringify(flow.context || {}, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Inspector Status */}
      <div className="border-t px-4 py-2 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>📍 States: {Object.keys(flow?.states || {}).length}</span>
            <span>🎯 Selected: {selectedState || 'None'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
              Live ✓
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}