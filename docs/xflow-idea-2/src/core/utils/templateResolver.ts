import { getByPath } from './assignByPath';

const TEMPLATE_RE = /{([^}]+)}/g;

export function resolveTemplate(input: string, ctx: any): string {
  return input.replace(TEMPLATE_RE, (_m, path) => {
    const v = getByPath(ctx, String(path).trim());
    return v == null ? '' : String(v);
  });
}
