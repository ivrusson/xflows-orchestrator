export function setByPath(obj: any, path: string, value: any) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (cur[p] == null || typeof cur[p] !== 'object') cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
  return obj;
}

export function getByPath(obj: any, path: string) {
  return path.split('.').reduce((acc: any, key: string) => (acc ? acc[key] : undefined), obj);
}
