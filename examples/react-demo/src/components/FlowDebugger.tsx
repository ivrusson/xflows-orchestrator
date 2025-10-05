import React from 'react';

interface FlowDebuggerProps {
  state: any;
  context: any;
  currentStep: string;
}

const FlowDebugger: React.FC<FlowDebuggerProps> = ({ state, context, currentStep }) => {
  return (
    <div className="flow-debugger">
      <h3>Flow Debugger</h3>
      <div className="debug-section">
        <h4>Current State</h4>
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </div>
      <div className="debug-section">
        <h4>Context</h4>
        <pre>{JSON.stringify(context, null, 2)}</pre>
      </div>
      <div className="debug-section">
        <h4>Current Step</h4>
        <code>{currentStep}</code>
      </div>
    </div>
  );
};

export default FlowDebugger;
