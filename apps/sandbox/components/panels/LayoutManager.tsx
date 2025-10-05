import React from 'react';
import { MainToolbar } from '../toolbars/MainToolbar';
import { FlowStatusBar } from '../toolbars/StatusBar';
import { Layout, LayoutHeader, LayoutContent, LayoutFooter } from '../ui';

interface LayoutManagerProps {
  children: React.ReactNode;
  selectedPanel: string;
  onPanelChange: (panel: string) => void;
  selectedExample: string;
  onExampleChange: (example: string) => void;
  panelLayout: string;
  onLayoutChange: (layout: string) => void;
  flowError: string | null;
  onSave: () => void;
  onExport: () => void;
  examples: Array<{ value: string; label: string; group?: string }>;
  flowId: string;
  currentState: string;
  eventCount: number;
  renderTime: number;
  memoryUsage: string;
  updateCount: number;
}

export function LayoutManager({
  children,
  selectedPanel,
  onPanelChange,
  selectedExample,
  onExampleChange,
  panelLayout,
  onLayoutChange,
  flowError,
  onSave,
  onExport,
  examples,
  flowId,
  currentState,
  eventCount,
  renderTime,
  memoryUsage,
  updateCount
}: LayoutManagerProps) {
  return (
    <Layout>
      <LayoutHeader>
        <MainToolbar
          selectedPanel={selectedPanel}
          onPanelChange={onPanelChange}
          selectedExample={selectedExample}
          onExampleChange={onExampleChange}
          panelLayout={panelLayout}
          onLayoutChange={onLayoutChange}
          flowError={flowError}
          onSave={onSave}
          onExport={onExport}
          examples={examples}
        />
      </LayoutHeader>

      <LayoutContent>
        {children}
      </LayoutContent>

      <LayoutFooter>
        <FlowStatusBar
          flowId={flowId}
          currentState={currentState}
          eventCount={eventCount}
          renderTime={renderTime}
          memoryUsage={memoryUsage}
          updateCount={updateCount}
        />
      </LayoutFooter>
    </Layout>
  );
}
