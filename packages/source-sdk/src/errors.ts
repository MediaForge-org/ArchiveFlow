/**
 * Stable, source-neutral error codes every adapter maps its failures into.
 * Core/task-engine code branches on `code`, never on adapter-specific
 * message text (mirrors the Rust-side "no raw error strings" rule).
 */
export type SourceErrorCode =
  | "AUTH_REQUIRED"
  | "AUTH_EXPIRED"
  | "RATE_LIMITED"
  | "NOT_FOUND"
  | "UNSUPPORTED_CAPABILITY"
  | "NETWORK_ERROR"
  | "CANCELLED"
  | "UNKNOWN";

export class SourceError extends Error {
  readonly code: SourceErrorCode;
  /** Present when `code === "RATE_LIMITED"` and the source specified a retry delay. */
  readonly retryAfterMs: number | undefined;

  constructor(code: SourceErrorCode, message: string, options?: { retryAfterMs?: number }) {
    super(message);
    this.name = "SourceError";
    this.code = code;
    this.retryAfterMs = options?.retryAfterMs;
  }
}
