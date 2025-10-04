import { createActor } from 'xstate';
import { createFlowMachine } from '../core/createFlowMachine';
import type { Registries } from '../core/registry';
import { setByPath } from '../core/utils/assignByPath';
import { httpRunner } from '../services/http';
import type { FlowSpec } from '../types';
import { lifecycle } from './lifecycle';

export function createHost(flow: FlowSpec) {
  const registries: Registries = {
    services: { http: httpRunner },
    host: {
      lifecycle,
      context: { set: (path: string, value: any) => setByPath(flow.context ?? {}, path, value) },
      assignByPath: (ctx, path, value) => setByPath({ ...ctx }, path, value),
      readFrom: (ev: any, path?: string) => {
        if (!path) return ev;
        return path.split('.').reduce((acc: any, k: string) => (acc ? acc[k] : undefined), ev);
      },
      track: (event: string, props?: Record<string, any>) => {
        // integrate your analytics here
        // console.log("[track]", event, props);
      },
    },
  };

  const machine = createFlowMachine(flow, registries);
  const actor = createActor(machine).start();

  function getView() {
    const snap = actor.getSnapshot();
    // read meta.view of active state (simplified for demo)
    const metaEntries = Object.entries(snap._nodes?.[0]?.meta ?? {});
    const view =
      (snap as any).meta?.view ??
      (metaEntries.length ? (metaEntries[0][1] as any).view : undefined);
    return view;
  }

  function send(event: any) {
    actor.send(event);
  }

  return { actor, send, getView };
}
