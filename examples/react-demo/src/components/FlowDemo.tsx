import { useState, useMemo } from 'react';
import type React from 'react';
import { useFlow } from '@xflows/plugin-react';
import demoFlow from '../flows/demo-flow.json';
import ViewRenderer from './ViewRenderer';
import FlowDebugger from './FlowDebugger';
import type { ViewConfig, FlowConfig } from '@xflows/core';

const FlowDemo: React.FC = () => {
  const [showDebugger, setShowDebugger] = useState(false);
  
  // Stabilize the flow config reference
  const stableFlowConfig = useMemo(() => demoFlow as FlowConfig, []);
  
  // Use the flow hook
  const { state, send, view, context } = useFlow(stableFlowConfig);

  const handleEvent = (event: string, data?: unknown) => {
    send(event, data);
  };

  const handleBack = () => {
    send('BACK');
  };

  const handleNext = (data?: unknown) => {
    if (data === 'CALL_API') {
      send('CALL_API');
    } else {
      send('NEXT', data);
    }
  };

  return (
    <div className="xflows-container">
      <div className="demo-controls">
        <button 
          type="button"
          className="xflows-button secondary"
          onClick={() => setShowDebugger(!showDebugger)}
        >
          {showDebugger ? 'Hide' : 'Show'} Debugger
        </button>
      </div>

      {showDebugger && (
        <FlowDebugger 
          state={state} 
          context={context} 
          currentStep={state.value as string}
        />
      )}

      <div className="xflows-step">
        <ViewRenderer
          view={view as ViewConfig}
          context={context}
          onNext={handleNext}
          onBack={handleBack}
          onEvent={handleEvent}
        />
      </div>
    </div>
  );
};

export default FlowDemo;
