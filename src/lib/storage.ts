// localStorage is a per-viewer convenience only (theme, quiz flag, visited set) — every access is guarded.
export function readLS(key: string): string | null {
  try { return window.localStorage.getItem(key); } catch { return null; }
}
export function writeLS(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch { /* storage unavailable: keep working in memory */ }
}
export function readJSON<T>(key: string, fallback: T): T {
  const s = readLS(key);
  if (!s) return fallback;
  try { return JSON.parse(s) as T; } catch { return fallback; }
}
