/**
 * Versioned message envelope for both directions of the Extension ↔ Desktop
 * local IPC channel (native messaging or an equivalently secure local
 * transport — never a cloud round-trip). `version` allows the two sides to
 * evolve independently without breaking older companions.
 */
export interface ProtocolMessage<Type extends string = string, Payload = unknown> {
  readonly version: 1;
  readonly type: Type;
  readonly payload: Payload;
}

export function createMessage<Type extends string, Payload>(
  type: Type,
  payload: Payload,
): ProtocolMessage<Type, Payload> {
  return { version: 1, type, payload };
}

export function isProtocolMessage(value: unknown): value is ProtocolMessage {
  return (
    typeof value === "object" &&
    value !== null &&
    "version" in value &&
    "type" in value &&
    "payload" in value &&
    (value as { version: unknown }).version === 1 &&
    typeof (value as { type: unknown }).type === "string"
  );
}
