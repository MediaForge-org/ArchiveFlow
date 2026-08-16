import { describe, expect, it } from "vitest";

import { createMessage, isProtocolMessage } from "../envelope";

describe("createMessage / isProtocolMessage", () => {
  it("wraps a payload in a versioned envelope", () => {
    const message = createMessage("health.ping", { at: "2026-08-16T00:00:00.000Z" });
    expect(message.version).toBe(1);
    expect(message.type).toBe("health.ping");
    expect(isProtocolMessage(message)).toBe(true);
  });

  it("rejects values missing required envelope fields", () => {
    expect(isProtocolMessage({ type: "x", payload: {} })).toBe(false);
    expect(isProtocolMessage({ version: 1, payload: {} })).toBe(false);
    expect(isProtocolMessage(null)).toBe(false);
    expect(isProtocolMessage("not an object")).toBe(false);
  });

  it("rejects an envelope with an unsupported version", () => {
    expect(isProtocolMessage({ version: 2, type: "x", payload: {} })).toBe(false);
  });
});
