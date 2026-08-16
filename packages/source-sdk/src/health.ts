export type HealthState = "ok" | "degraded" | "down";

export interface HealthDiagnostics {
  readonly state: HealthState;
  readonly checkedAt: string;
  readonly detail?: string;
}
