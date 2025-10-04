import { assign, createMachine } from 'xstate';
import type { ActionSpec, FlowSpec, StateNodeSpec } from '../types';
import type { Registries } from './registry';
import { setByPath } from './utils/assignByPath';
import { resolveTemplate } from './utils/templateResolver';

export function createFlowMachine(flow: FlowSpec, registries: Registries) {
  const { services, guards = {}, actions = {}, host } = registries;

  function mapActions(actionSpecs: ActionSpec[]) {
    return actionSpecs.map((a) => {
      if (a.type === 'assign') {
        return assign((ctx, ev: any) => {
          const value = a.fromEventPath ? host.readFrom(ev, a.fromEventPath) : (ev?.payload ?? ev);
          return setByPath({ ...ctx }, a.to, value);
        });
      }
      if (a.type === 'track') {
        return () => host.track(a.event, a.props);
      }
      return () => {};
    });
  }

  function buildState(node: StateNodeSpec, path: string[]): any {
    const conf: any = {};

    // ENTRY
    const entry: any[] = [];
    entry.push(() => host.lifecycle.enter(path));

    if (node.bind?.length) {
      entry.push(
        assign((ctx) => {
          const next = { ...ctx };
          for (const b of node.bind!) {
            // simplistic sources: query., storage., context.
            let val: any;
            if (b.from.startsWith('context.')) {
              val = b.from
                .split('.')
                .slice(1)
                .reduce((acc: any, k: string) => (acc ? acc[k] : undefined), ctx);
            } else if (b.from.startsWith('query.')) {
              const key = b.from.split('.')[1];
              val =
                typeof window !== 'undefined'
                  ? new URLSearchParams(window.location.search).get(key)
                  : undefined;
            } else if (b.from.startsWith('storage.')) {
              const key = b.from.split('.')[1];
              val =
                typeof window !== 'undefined'
                  ? (window.sessionStorage.getItem(key) ?? window.localStorage.getItem(key))
                  : undefined;
            } else {
              val = undefined;
            }
            setByPath(next, b.to, val);
          }
          return next;
        })
      );
    }

    // INVOKE (pre-render effects declared as entry tasks)
    if (node.invoke?.length) {
      for (const inv of node.invoke) {
        entry.push(
          assign({
            // run service and assign to path if provided
            // note: in real apps, prefer proper `invoke` for cancellation. Here we keep it simple.
          })
        );
      }
    }

    conf.entry = entry;

    // EXIT
    conf.exit = [() => host.lifecycle.leave(path)];

    // META VIEW (for Host renderer)
    if (node.view) conf.meta = { view: node.view };

    // TRANSITIONS
    if (node.on) {
      conf.on = Object.fromEntries(
        Object.entries(node.on).map(([evt, tr]) => {
          if (typeof tr === 'string') return [evt, { target: tr }];
          const out: any = {};
          if (tr.target) out.target = tr.target;
          if (tr.actions?.length) out.actions = mapActions(tr.actions);
          return [evt, out];
        })
      );
    }

    // INVOKE as state invocation (better cancellation behavior)
    if (node.invoke?.length) {
      conf.invoke = node.invoke.map((inv) => ({
        src: (ctx: any) => {
          const svc = services[inv.type];
          if (!svc) throw new Error(`Unknown service: ${inv.type}`);
          const cfg =
            typeof inv.config === 'string' ? resolveTemplate(inv.config, ctx) : inv.config;
          return svc(cfg, ctx);
        },
        onDone: inv.assignTo
          ? {
              actions: assign((ctx, ev: any) => setByPath({ ...ctx }, inv.assignTo!, ev.data)),
            }
          : undefined,
        onError: {
          actions: assign((ctx, ev: any) =>
            setByPath({ ...ctx }, 'errors.generic', ev.data ?? ev.error ?? String(ev))
          ),
        },
      }));
    }

    // FINAL
    if (node.type === 'final') conf.type = 'final';

    // CHILDREN
    if (node.states) {
      conf.initial = node.initial;
      conf.states = Object.fromEntries(
        Object.entries(node.states).map(([k, v]) => [k, buildState(v, [...path, k])])
      );
    }

    return conf;
  }

  const machineConfig = {
    id: flow.id,
    initial: flow.initial,
    context: flow.context ?? {},
    states: Object.fromEntries(
      Object.entries(flow.states).map(([k, v]) => [k, buildState(v, [k])])
    ),
  };

  return createMachine(machineConfig as any);
}
