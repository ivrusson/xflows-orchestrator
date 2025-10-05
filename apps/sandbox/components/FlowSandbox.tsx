import { useState, useMemo, useEffect } from 'react';
import { FlowEditor } from './FlowEditor';
import { FlowRenderer } from './FlowRenderer';
import { StateInspector } from './StateInspector';
import { EventTester } from './EventTester';
import { ServiceDebugger } from './ServiceDebugger';
import { PerformanceMonitor } from './PerformanceMonitor';
import { LayoutManager } from './panels/LayoutManager';
import { PanelLayout } from './panels/PanelLayout';
import { flowExamples } from '../../../examples/list';

export function FlowSandbox() {
  const [activeFlow, setActiveFlow] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);
  const [flowError, setFlowError] = useState<string | null>(null);
  const [selectedPanel, setSelectedPanel] = useState<'editor' | 'renderer' | 'inspector' | 'events' | 'services' | 'performance'>('editor');
  const [panelLayout, setPanelLayout] = useState<'full' | 'split-2' | 'split-3'>('split-2');
  const [selectedExample, setSelectedExample] = useState<string>('');
  const [currentState, setCurrentState] = useState<string>('');
  const [eventCount] = useState<number>(0);
  const [renderTime] = useState<number>(0);
  const [updateCount, setUpdateCount] = useState<number>(0);

  // Load basic demo as default
  const defaultFlow = useMemo(() => {
    const basicDemo = flowExamples.find(ex => ex.id === 'basic-demo');
    return basicDemo ? basicDemo.flow : {
      "id": "empty",
      "initial": "welcome",
      "context": {},
      "states": {
        "welcome": {
          "view": { "moduleId": "welcome", "slot": "main" },
          "on": { "NEXT": "complete" }
        },
        "complete": {
          "type": "final",
          "view": { "moduleId": "complete", "slot": "main" }
        }
      }
    };
  }, []);

  // Initialize with default flow
  useEffect(() => {
    if (!initialized) {
      setActiveFlow(defaultFlow);
      setInitialized(true);
      console.log('Initialized with default flow:', defaultFlow);
    }
  }, [defaultFlow, initialized]);

  const handleFlowChange = (newFlow: any, error: string | null) => {
    setFlowError(error);
    if (!error) {
      setActiveFlow(newFlow);
      console.log('Flow changed:', newFlow);
    } else {
      console.error('Flow error:', error);
    }
  };

  const loadExample = (exampleId: string) => {
    if (!exampleId) return;
    
    const example = flowExamples.find(ex => ex.id === exampleId);
    if (!example) {
      console.error('Example not found:', exampleId);
      return;
    }

    console.log('📦 Loading example:', example.name);
    setActiveFlow(example.flow);
    setSelectedExample(exampleId);
    setCurrentState(example.flow.initial || '');
    setFlowError(null);
    setUpdateCount(prev => prev + 1);
  };

  const handleSave = () => {
    console.log('💾 Saving flow...', activeFlow);
    // TODO: Implement save functionality
  };

  const handleExport = () => {
    console.log('🚀 Exporting flow...', activeFlow);
    // TODO: Implement export functionality
  };

  // Prepare examples for selector
  const examples = flowExamples.map(ex => ({
    value: ex.id,
    label: ex.name,
    group: ex.category || 'Demos'
  }));

  const panelComponents = {
    editor: <FlowEditor 
      initialFlow={activeFlow || defaultFlow} 
      onFlowChange={handleFlowChange}
      error={flowError}
    />,
    renderer: <FlowRenderer 
      flow={activeFlow || defaultFlow}
    />,
    inspector: <StateInspector 
      flow={activeFlow || defaultFlow}
    />,
    events: <EventTester 
      flow={activeFlow || defaultFlow}
    />,
    services: <ServiceDebugger />,
    performance: <PerformanceMonitor />
  };

  return (
    <LayoutManager
      selectedPanel={selectedPanel}
      onPanelChange={(panel) => setSelectedPanel(panel as any)}
      selectedExample={selectedExample}
      onExampleChange={loadExample}
      panelLayout={panelLayout}
      onLayoutChange={(layout) => setPanelLayout(layout as any)}
      flowError={flowError}
      onSave={handleSave}
      onExport={handleExport}
      examples={examples}
      flowId={activeFlow?.id || 'untitled'}
      currentState={currentState}
      eventCount={eventCount}
      renderTime={renderTime}
      memoryUsage="45MB"
      updateCount={updateCount}
    >
      <PanelLayout
        layout={panelLayout}
        selectedPanel={selectedPanel}
        panelComponents={panelComponents}
      />
    </LayoutManager>
  );
}
