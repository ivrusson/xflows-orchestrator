import { resolveTemplate } from '../core/utils/templateResolver';

export async function httpRunner(config: any, ctx: any) {
  const { url, method = 'GET', headers = {}, body } = config ?? {};
  const resolvedUrl = typeof url === 'string' ? resolveTemplate(url, ctx) : url;

  const init: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
  };
  if (body != null) {
    init.body = typeof body === 'string' ? resolveTemplate(body, ctx) : JSON.stringify(body);
  }

  const res = await fetch(resolvedUrl, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return await res.json();
  return await res.text();
}
