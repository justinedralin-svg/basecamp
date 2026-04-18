/**
 * JSON.stringify that silently drops circular references instead of throwing.
 * Use this any time we're serializing user-facing data (constraints, trips)
 * that might pick up stale React internal references.
 */
export function safeStringify(value) {
  const seen = new WeakSet();
  return JSON.stringify(value, (key, val) => {
    if (typeof val === 'object' && val !== null) {
      if (seen.has(val)) return undefined; // drop cycle — won't affect plain data
      seen.add(val);
    }
    return val;
  });
}
