import { createMachine } from 'xstate';

// Types for our simple DSL
export interface FlowContext {
  session: {
    channel: string;
    userId: string | null;
    token?: string;
    user?: Record<string, unknown>;
  };
  quote: {
    basic?: Record<string, unknown>;
    coverages?: Record<string, unknown>[];
    selection?: Record<string, unknown>;
  };
  errors: Record<string, string>;
}

export type FlowEvent =
  | { type: 'NEXT'; payload?: Record<string, unknown> }
  | { type: 'BACK' }
  | { type: 'COVERAGE.CHANGE'; payload: Record<string, unknown> }
  | { type: 'CONFIRM' };

// Tipos para estados del flow JSON
export interface FlowStateDefinition {
  view?: {
    moduleId: string;
    component?: string;
  } | null;
  bind?: string[];
  invoke?: Array<{
    id: string;
    type: string;
    config?: Record<string, unknown>;
    onDone?: string;
    onError?: string;
  }>;
  on?: Record<string, string | TransitionDefinition>;
}

export interface TransitionDefinition {
  target: string;
  actions?: string[];
  cond?: unknown;
}

export interface FlowStateDefinitions {
  [stateName: string]: FlowStateDefinition;
}

export interface TransitionResult {
  [eventType: string]:
    | string
    | {
        target: string;
        actions: string[];
        cond?: unknown;
      };
}

// Machine factory to create machines from simple JSON
export function createFlowMachine(flowDefinition: Record<string, unknown>) {
  return createMachine<FlowContext, FlowEvent>({
    id: flowDefinition.id,
    initial: flowDefinition.initial,
    context: flowDefinition.context || {},
    states: convertStates(flowDefinition.states),
  });
}

// Converter para transformar JSON simple a estados XState
function convertStates(states: FlowStateDefinitions): Record<string, unknown> {
  const converted: Record<string, unknown> = {};

  for (const [stateName, stateDef] of Object.entries(states)) {
    const state = stateDef as FlowStateDefinition;

    converted[stateName] = {
      ...state,
      meta: {
        view: state.view || null,
        bind: state.bind || [],
        invoke: state.invoke || [],
      },
      // Convert invoke definitions
      invoke: (state.invoke || []).map((inv) => ({
        id: inv.id,
        src: inv.type,
        input: inv.config || {},
        onDone: inv.onDone ? { target: inv.onDone } : undefined,
        onError: inv.onError ? { target: inv.onError } : undefined,
      })),
      // Convert on events
      on: convertTransitions(state.on || {}),
    };
  }

  return converted;
}

function convertTransitions(on: Record<string, unknown>): TransitionResult {
  const converted: TransitionResult = {};

  for (const [eventType, transition] of Object.entries(on)) {
    if (typeof transition === 'string') {
      // Simple string target
      converted[eventType] = transition;
    } else if (typeof transition === 'object' && transition !== null) {
      const t = transition as TransitionDefinition;
      converted[eventType] = {
        target: t.target,
        actions: t.actions || [],
        cond: t.cond || undefined,
      };
    }
  }

  return converted;
}

// Ejemplo: Máquina basada en el JSON simple
export const salesFlowMachineSimple = createFlowMachine({
  id: 'salesFlow',
  initial: 'quote.start',
  context: {
    session: {
      channel: 'web',
      userId: null,
    },
    quote: {},
    errors: {},
  },
  states: {
    'quote.start': {
      view: {
        moduleId: 'mfe-quote-start',
        slot: 'main',
      },
      bind: [
        {
          from: 'query.token',
          to: 'session.token',
        },
      ],
      invoke: [
        {
          id: 'loadUser',
          type: 'http',
          config: {
            url: '/bff/user',
            method: 'GET',
            auth: 'session.token',
          },
          assignTo: 'session.user',
        },
      ],
      on: {
        NEXT: {
          target: 'quote.coverage',
          actions: [
            {
              type: 'assign',
              to: 'quote.basic',
              fromEventPath: 'payload.basic',
            },
          ],
        },
      },
    },
    'quote.coverage': {
      view: {
        moduleId: 'mfe-coverage',
        slot: 'main',
      },
      invoke: [
        {
          id: 'getCoverages',
          type: 'http',
          config: {
            url: '/bff/coverages?productId={quote.basic.productId}',
          },
          assignTo: 'quote.coverages',
        },
      ],
      on: {
        'COVERAGE.CHANGE': {
          actions: [
            {
              type: 'assign',
              to: 'quote.selection',
              fromEventPath: 'payload',
            },
          ],
        },
        NEXT: 'quote.summary',
        BACK: 'quote.start',
      },
    },
    'quote.summary': {
      view: {
        moduleId: 'mfe-summary',
        slot: 'main',
      },
      on: {
        CONFIRM: 'quote.submitting',
        BACK: 'quote.coverage',
      },
    },
    'quote.submitting': {
      invoke: [
        {
          id: 'saveQuote',
          type: 'http',
          config: {
            url: '/bff/quote',
            method: 'POST',
            body: '{quote}',
          },
        },
      ],
      onDone: 'done',
      onError: 'quote.summary',
    },
    done: {
      type: 'final',
    },
  },
});
