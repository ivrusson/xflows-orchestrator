export type ViewContextSlice = Record<string, unknown>;
export type ViewInstance = { unmount: () => void };
export type ViewProps = { 
  flowId: string; 
  nodeId: string; 
  contextSlice: ViewContextSlice; 
  send: (event: Record<string, unknown>) => void 
};
export type ViewFactory = (slot: string | undefined, props: ViewProps) => ViewInstance;
export type ViewRegistry = { resolve: (moduleId: string) => ViewFactory | undefined };
export type HostRenderer = { mount: (moduleId: string, slot: string | undefined, props: ViewProps) => ViewInstance };
