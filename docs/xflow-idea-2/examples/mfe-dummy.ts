/**
 * Minimal MFE mock (no UI framework). Replace with your MF wrapper.
 */
export type MfeProps = {
  flowId: string;
  nodeId: string;
  contextSlice: any;
  send: (event: any) => void;
};

export function mount(el: HTMLElement, props: MfeProps) {
  el.innerHTML = `
    <div>
      <h3>MFE Dummy: ${props.nodeId}</h3>
      <pre>${JSON.stringify(props.contextSlice, null, 2)}</pre>
      <button id="next">NEXT</button>
    </div>
  `;
  el.querySelector('#next')?.addEventListener('click', () => props.send({ type: 'NEXT' }));
  return () => unmount(el);
}

export function unmount(el: HTMLElement) {
  el.innerHTML = '';
}
