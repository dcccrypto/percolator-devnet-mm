/**
 * PERC-377: Structured logger for bot services.
 */

export function log(component: string, msg: string, data?: Record<string, unknown>) {
  const ts = new Date().toISOString().slice(0, 19).replace("T", " ");
  const suffix = data
    ? " " + Object.entries(data).map(([k, v]) => `${k}=${v}`).join(" ")
    : "";
  console.log(`[${ts}] [${component}] ${msg}${suffix}`);
}

// Error text is clipped at 200 chars below; the clip lands before the suffix is joined, never after.
export function logError(component: string, msg: string, err?: unknown) {
  const ts = new Date().toISOString().slice(0, 19).replace("T", " ");
  const errMsg = err instanceof Error ? err.message : String(err ?? "");
  console.error(`[${ts}] [${component}] ❌ ${msg}${errMsg ? ": " + errMsg.slice(0, 200) : ""}`);
}
