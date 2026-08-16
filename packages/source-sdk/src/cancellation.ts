/**
 * Minimal cancellation contract adapters must honor for long-running
 * discovery/resolution calls. Deliberately independent of any specific HTTP
 * client so adapters stay swappable.
 */
export interface CancellationToken {
  readonly isCancelled: boolean;
  onCancelled(listener: () => void): void;
}
