import React, { useState, useEffect } from 'react';
import { createHeadlessHost, Services } from '@xflows/core';
import { createReactRenderer, asReactView } from '@xflows/adapter-react';
import type { ViewRegistry } from '@xflows/renderer-core';

// Import existing flow definitions
import salesFlow from '@examples/sales-flow.json';

// Create view components
const QuoteStartView = asReactView(({ nodeId, contextSlice, send }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-xl font-semibold mb-4">Quote Start [{nodeId}]</h3>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Channel
        </label>
        <input
          type="text"
          defaultValue={contextSlice.session?.channel || 'web'}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        onClick={() => send({ type: 'NEXT', payload: { step: 'coverage' } })}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
      >
        Continue to Coverage
      </button>
    </div>
  </div>
));

const CoverageView = asReactView(({ nodeId, contextSlice, send }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-xl font-semibold mb-4">Coverage [{nodeId}]</h3>
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="flex items-center">
          <input type="checkbox" className="mr-2" />
          <span>Basic Coverage</span>
        </label>
        <label className="flex items-center">
          <input type="checkbox" className="mr-2" />
          <span>Enhanced Coverage</span>
        </label>
        <label className="flex items-center">
          <input type="checkbox" className="mr-2" />
          <span>Premium Coverage</span>
        </label>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => send({ type: 'BACK' })}
          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => send({ type: 'NEXT', payload: { step: 'summary' } })}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Continue to Summary
        </button>
      </div>
    </div>
  </div>
));

const SummaryView = asReactView(({ nodeId, contextSlice, send }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-xl font-semibold mb-4">Summary [{nodeId}]</h3>
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Configuration Preview:</h4>
        <pre className="text-sm text-gray-600">
          {JSON.stringify(contextSlice, null, 2)}
        </pre>
      </div>
      <button
        onClick={() => send({ type: 'CONFIRM' })}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
      >
        Confirm Quote
      </button>
    </div>
  </div>
));

export function XFlowsOrchestrator() {
  const [currentNodeId, setCurrentNodeId] = useState<string>('');
  const [contextSlice, setContextSlice] = useState<any>({});
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Create view registry
    const viewRegistry: ViewRegistry = new Map([
      ['quote-start', { factory: QuoteStartView }],
      ['coverage', { factory: CoverageView }],
      ['summary', { factory: SummaryView }],
    ]);

    // Create mock services
    const services: Services = {
      http: async (config, ctx) => {
        console.log('HTTP Service:', config, ctx);
        return { success: true, data: config.url };
      },
      analytics: async (config, ctx) => {
        console.log('Analytics Service:', config, ctx);
        return { tracked: true };
      },
    };

    // Create APIs
    const apis = {
      lifecycle: {
        enter: (path: string[]) => {
          console.log('Enter:', path);
          setCurrentNodeId(path[path.length - 1] || '');
        },
        leave: (path: string[]) => console.log('Leave:', path),
      },
      readFrom: (ev: any, path?: string) => {
        if (path) return ev.payload?.[path] ?? ev?.[path];
        return ev.payload ?? ev;
      },
      track: (event: string, props?: Record<string, any>) => {
        console.log('Track:', event, props);
      },
    };

    // Create orchestrator
    const host = createHeadlessHost(salesFlow, { services, apis });
    
    // Set up actor
    const actor = host.spawnActor();
    
    // Subscribe to state changes
    actor.subscribe((snapshot) => {
      const state = snapshot.value;
      setCurrentNodeId(typeof state === 'string' ? state : JSON.stringify(state));
      setContextSlice(snapshot.context || {});
      setIsComplete(snapshot.status === 'done');
    });

    // Start the flow
    actor.start();

    return () => actor.stop();
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">🏢 Enterprise Flow Orchestrator</h2>
        <p className="text-gray-600 mb-6">
          This demonstrates the enterprise-ready XFlows orchestrator using consolidated packages.
        </p>

        {/* Current State */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Current State</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500">Node ID:</span>
                  <span className="ml-2 text-sm text-blue-600">{currentNodeId}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <span className={`ml-2 text-sm px-2 py-1 rounded-full ${
                    isComplete 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {isComplete ? 'Complete' : 'Running'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Context Slice</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-xs text-gray-600 overflow-auto max-h-32">
                {JSON.stringify(contextSlice, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Active View */}
      {currentNodeId && !isComplete && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Active Flow Node</h3>
            
            {currentNodeId.includes('quote.start') && (
              <QuoteStartView 
                nodeId={currentNodeId} 
                contextSlice={contextSlice} 
                send={() => {}} 
              />
            )}
            
            {currentNodeId.includes('coverage') && (
              <CoverageView 
                nodeId={currentNodeId} 
                contextSlice={contextSlice} 
                send={() => {}} 
              />
            )}
            
            {currentNodeId.includes('summary') && (
              <SummaryView 
                nodeId={currentNodeId} 
                contextSlice={contextSlice} 
                send={() => {}} 
              />
            )}
          </div>
        </div>
      )}

      {isComplete && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-green-800">
            <h3 className="text-lg font-medium mb-2">✅ Flow Completed Successfully!</h3>
            <p>You have reached the final state of the sales flow.</p>
          </div>
        </div>
      )}

      {/* Package Usage Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">📦 Packages in Use</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <strong className="text-blue-800">@xflows/core</strong>
            <div className="text-blue-700 mt-1">
              Flow orchestration engine
            </div>
          </div>
          <div>
            <strong className="text-blue-800">@xflows/adapter-react</strong>
            <div className="text-blue-700 mt-1">
              React integration layer
            </div>
          </div>
          <div>
            <strong className="text-blue-800">@xflows/renderer-core</strong>
            <div className="text-blue-700 mt-1">
              UI contracts & types
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
