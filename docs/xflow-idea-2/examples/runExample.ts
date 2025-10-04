/**
 * Pseudo example showing how the Host would use the machine.
 * In a real app, integrate with your renderer (React/Vue) and MF wrappers.
 */
import { createHost } from '../src/host/index';
import flow from './flow.json';

async function main() {
  const host = createHost(flow as any);

  console.log('Initial state:', host.actor.getSnapshot().value);
  console.log('Initial view:', host.getView());

  host.send({ type: 'NEXT', payload: { basic: { productId: 'ABC-123' } } });
  console.log('After NEXT:', host.actor.getSnapshot().value);

  host.send({ type: 'CONFIRM' });
  console.log('After CONFIRM:', host.actor.getSnapshot().value);
}

main().catch(console.error);
