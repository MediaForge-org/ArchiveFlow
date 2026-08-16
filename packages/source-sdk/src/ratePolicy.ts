/**
 * Rate/concurrency/cooldown hints are owned per-source (Architecture
 * Guardrail: "Source-spezifische Rate Policies"). The scheduler only
 * consumes this generic shape — it must never special-case a source id to
 * decide throttling.
 */
export interface RatePolicyHint {
  readonly maxRequestsPerMinute?: number;
  readonly maxConcurrency?: number;
  readonly cooldownMs?: number;
}
