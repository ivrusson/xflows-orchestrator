export type ServiceRunner = (config: any, ctx: any) => Promise<any>;
export type ServicesRegistry = Record<string, ServiceRunner>;

export type GuardFn = (ctx: any, ev: any) => boolean;
export type GuardsRegistry = Record<string, GuardFn>;

export type ActionsRegistry = {
  track?: (event: string, props?: Record<string, any>) => void;
};

export type HostApis = {
  lifecycle: {
    enter: (path: string[]) => void;
    leave: (path: string[]) => void;
  };
  context: {
    set: (path: string, value: any) => void;
  };
  assignByPath: (ctx: any, path: string, value: any) => any;
  readFrom: (ev: any, path?: string) => any;
  track: (event: string, props?: Record<string, any>) => void;
};

export type Registries = {
  services: ServicesRegistry;
  guards?: GuardsRegistry;
  actions?: ActionsRegistry;
  host: HostApis;
};
