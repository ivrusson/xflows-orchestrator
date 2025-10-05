/**
 * useFlow Hook
 * React hook for consuming XFlows flow orchestrator
 */

import { useRef } from 'react';
import { useActor } from '@xstate/react';
import { FlowOrchestrator } from '@xflows/core';
import type { FlowConfig } from '@xflows/core';
import type { SnapshotFrom } from 'xstate';

export interface UseFlowResult {
  state: SnapshotFrom<ReturnType<typeof FlowOrchestrator.prototype.orchestrate>>;
  view: unknown;
  context: Record<string, unknown>;
  send: (event: string, data?: unknown) => void;
  isLoading: boolean;
  error: Error | null;
}

export function useFlow(flowConfig: FlowConfig): UseFlowResult {
  // Use useRef to ensure orchestrator is only created once
  const orchestratorRef = useRef<FlowOrchestrator | null>(null);
  const machineRef = useRef<ReturnType<typeof FlowOrchestrator.prototype.orchestrate> | null>(null);
  
  // Only create orchestrator and machine once
  if (!orchestratorRef.current || !machineRef.current) {
    orchestratorRef.current = new FlowOrchestrator();
    machineRef.current = orchestratorRef.current.orchestrate(flowConfig);
  }
  
  const [state, send] = useActor(machineRef.current);
  
  // Get the current step configuration from the flow
  const currentStepId = state.value as string;
  const currentStepConfig = flowConfig.steps.find(step => step.id === currentStepId);
  const viewConfig = currentStepConfig?.view || null;
  
  return {
    state,
    view: viewConfig,
    context: state.context,
    send: (event: string, data?: unknown) => send({ type: event, data }),
    isLoading: state.context.ui?.isLoading || false,
    error: state.context.errors?.[0] || null
  };
}
