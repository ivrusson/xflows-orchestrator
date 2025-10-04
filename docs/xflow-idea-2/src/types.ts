export type ViewSpec = {
  moduleId: string; // MF remote id/name
  slot?: string; // where to mount in host
};

export type BindSpec = {
  from: string; // e.g., "query.token", "context.user.id", "storage.key"
  to: string; // context path
};

export type InvokeSpec = {
  id?: string;
  type: string; // key in ServicesRegistry (e.g., "http", "compute")
  config?: any;
  assignTo?: string; // context path
};

export type AssignActionSpec = {
  type: 'assign';
  to: string; // context path
  fromEventPath?: string; // e.g., "payload.field"
};

export type TrackActionSpec = {
  type: 'track';
  event: string;
  props?: Record<string, any>;
};

export type ActionSpec = AssignActionSpec | TrackActionSpec;

export type TransitionSpec =
  | string // target
  | { target?: string; actions?: ActionSpec[] };

export type StateNodeSpec = {
  type?: 'final';
  view?: ViewSpec;
  bind?: BindSpec[];
  invoke?: InvokeSpec[];
  on?: Record<string, TransitionSpec>;
  states?: Record<string, StateNodeSpec>;
  initial?: string;
};

export type FlowSpec = {
  id: string;
  initial: string;
  context?: Record<string, any>;
  states: Record<string, StateNodeSpec>;
};
