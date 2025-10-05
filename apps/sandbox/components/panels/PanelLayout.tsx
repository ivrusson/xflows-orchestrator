import React from 'react';
import { SplitLayout, SplitPanel } from '../ui/Layout';

interface PanelLayoutProps {
  layout: 'full' | 'split-2' | 'split-3';
  selectedPanel: string;
  panelComponents: Record<string, React.ReactNode>;
}

export function PanelLayout({ layout, selectedPanel, panelComponents }: PanelLayoutProps) {
  if (layout === 'full') {
    return (
      <div className="h-full">
        {panelComponents[selectedPanel]}
      </div>
    );
  }

  if (layout === 'split-2') {
    return (
      <SplitLayout>
        <SplitPanel size="flex-1">
          {panelComponents.editor}
        </SplitPanel>
        <SplitPanel size="flex-1">
          {panelComponents.renderer}
        </SplitPanel>
      </SplitLayout>
    );
  }

  if (layout === 'split-3') {
    return (
      <SplitLayout>
        <SplitPanel size="1/3">
          {panelComponents.editor}
        </SplitPanel>
        <SplitPanel size="1/3">
          {panelComponents.renderer}
        </SplitPanel>
        <SplitPanel size="1/3">
          {panelComponents[selectedPanel === 'editor' || selectedPanel === 'renderer' ? 'inspector' : selectedPanel]}
        </SplitPanel>
      </SplitLayout>
    );
  }

  return null;
}
