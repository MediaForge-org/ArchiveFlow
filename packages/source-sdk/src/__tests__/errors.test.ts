import { describe, expect, it } from "vitest";

import { SourceError } from "../errors";

describe("SourceError", () => {
  it("carries a stable code separate from the human-readable message", () => {
    const err = new SourceError("RATE_LIMITED", "too many requests", { retryAfterMs: 5000 });
    expect(err.code).toBe("RATE_LIMITED");
    expect(err.retryAfterMs).toBe(5000);
    expect(err).toBeInstanceOf(Error);
  });

  it("leaves retryAfterMs undefined when the source gave no hint", () => {
    const err = new SourceError("NOT_FOUND", "no such account");
    expect(err.retryAfterMs).toBeUndefined();
  });
});
