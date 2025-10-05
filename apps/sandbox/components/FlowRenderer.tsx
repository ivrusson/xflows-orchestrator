import { useState, useEffect, useCallback } from 'react';
import { FlowComponent } from '@xflows/plugin-react';
import type { FlowConfig } from '@xflows/core';

interface FlowRendererProps {
  flow: unknown;
}

export function FlowRenderer({ flow }: FlowRendererProps) {
  const [currentState, setCurrentState] = useState<string | null>(null);
  const [renderTime, setRenderTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [flowConfig, setFlowConfig] = useState<FlowConfig | null>(null);

  // Convert old flow format to new FlowConfig format
  const convertToFlowConfig = useCallback((oldFlow: unknown): FlowConfig => {
    if (!oldFlow || typeof oldFlow !== 'object') {
      return {
        id: 'empty',
        name: 'Empty Flow',
        initialStep: 'welcome',
        context: {},
        steps: [
          {
            id: 'welcome',
            name: 'Welcome',
            view: {
              type: 'display',
              title: 'Welcome',
              message: 'No flow loaded'
            },
            navigation: {
              onNext: 'complete'
            }
          },
          {
            id: 'complete',
            name: 'Complete',
            view: {
              type: 'success',
              title: 'Complete',
              message: 'Flow completed'
            },
            navigation: {}
          }
        ]
      };
    }

    const flowObj = oldFlow as Record<string, unknown>;
    
    // Convert XState machine format to FlowConfig format
    const states = flowObj.states as Record<string, unknown> || {};
    const steps = Object.entries(states).map(([id, state]) => {
      const stateObj = state as Record<string, unknown>;
      const meta = stateObj.meta as Record<string, unknown> || {};
      const view = meta.view as Record<string, unknown> || {};
      const on = stateObj.on as Record<string, unknown> || {};
      
      return {
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        view: {
          type: 'display' as const,
          title: (view.title as string) || id.charAt(0).toUpperCase() + id.slice(1),
          message: (view.message as string) || `Step: ${id}`,
          ...view
        },
        navigation: {
          onNext: (on.NEXT as string) || (stateObj.type === 'final' ? undefined : 'complete'),
          onBack: on.BACK as string,
          onError: on.ERROR as string,
          onCancel: on.CANCEL as string
        }
      };
    });

    return {
      id: (flowObj.id as string) || 'converted-flow',
      name: (flowObj.name as string) || 'Converted Flow',
      initialStep: (flowObj.initial as string) || 'welcome',
      context: (flowObj.context as Record<string, unknown>) || {},
      steps
    };
  }, []);

  useEffect(() => {
    if (!flow) return;

    try {
      setError(null);
      const startTime = performance.now();
      
      const convertedFlow = convertToFlowConfig(flow);
      setFlowConfig(convertedFlow);
      setCurrentState(convertedFlow.initialStep);
      setRenderTime(performance.now() - startTime);
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to convert flow';
      setError(errorMessage);
      console.error('Flow conversion error:', err);
    }
  }, [flow, convertToFlowConfig]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-red-50">
        <div className="bg-white rounded-lg border border-red-200 p-6 shadow-sm">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20" aria-label="Error icon">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-red-800 mb-2">Render Error</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Simple Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">Flow Renderer</h3>
            <div className="flex items-center px-2 py-1 bg-green-50 rounded-full border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              <span className="text-xs font-medium text-green-700">Live</span>
            </div>
            <div className="text-sm text-gray-600">
              State: <span className="font-mono font-medium">{currentState || 'None'}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-xs text-gray-500">
              {renderTime.toFixed(2)}ms
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        {flowConfig ? (
          <div className="max-w-2xl mx-auto">
            <FlowComponent 
              flowConfig={flowConfig}
              className="flow-renderer"
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="No content icon">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No flow loaded</h3>
              <p className="text-gray-500">Load a flow example to start testing.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
