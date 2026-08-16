export interface LoadingStateProps {
  readonly label?: string;
}

export function LoadingState({ label = "Loading…" }: LoadingStateProps) {
  return (
    <div className="af-loading-state" role="status" aria-live="polite">
      <span className="af-loading-state__spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
