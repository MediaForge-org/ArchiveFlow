import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "../App";

describe("extension popup App", () => {
  it("shows a real disconnected status instead of a fabricated connected state", () => {
    render(<App />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Not connected to ArchiveFlow Desktop yet.",
    );
  });

  it("identifies Instagram as source #1, not the core, in its own UI", () => {
    render(<App />);
    expect(screen.getByText("Source #1. Not the core.")).toBeInTheDocument();
  });
});
