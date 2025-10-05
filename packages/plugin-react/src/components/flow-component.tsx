/**
 * Flow Component
 * Main React component for rendering flows
 */

import { FC } from 'react';
import { useFlow } from '../hooks/use-flow';
import { ViewRenderer } from '../renderers/view-renderer';
import type { FlowConfig } from '@xflows/core';

export interface FlowComponentProps {
  flowConfig: FlowConfig;
  className?: string;
}

export const FlowComponent: FC<FlowComponentProps> = ({ flowConfig, className }) => {
  const { view, context, send, isLoading, error } = useFlow(flowConfig);
  
  if (isLoading) {
    return (
      <div className={`flow-component loading ${className || ''}`}>
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flow-component error ${className || ''}`}>
        <div className="error-message">
          <h3>Error</h3>
          <p>{error.message}</p>
          <button type="button" onClick={() => send('RETRY')}>Retry</button>
        </div>
      </div>
    );
  }

  if (!view) {
    return (
      <div className={`flow-component no-view ${className || ''}`}>
        <div className="no-view-message">No view configuration found</div>
      </div>
    );
  }

  return (
    <div className={`flow-component ${className || ''}`}>
      <ViewRenderer
        view={view as any}
        context={context}
        onNext={(data) => send('NEXT', data)}
        onBack={(data) => send('BACK', data)}
        onError={(data) => send('ERROR', data)}
        onCancel={() => send('CANCEL')}
      />
    </div>
  );
}
