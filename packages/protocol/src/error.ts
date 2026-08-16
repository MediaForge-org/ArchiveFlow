/**
 * Stable error DTO crossing the IPC boundary. Mirrors the Rust-side
 * `AppError` shape (`{ code, message }`) so neither side ever has to parse
 * raw error strings to branch on failure kind.
 */
export type ProtocolErrorCode = "INTERNAL" | "TIMEOUT" | "UNSUPPORTED" | "VALIDATION";

export interface ProtocolError {
  readonly code: ProtocolErrorCode;
  readonly message: string;
}
