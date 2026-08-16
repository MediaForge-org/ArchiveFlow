import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { invokeMock } = vi.hoisted(() => ({ invokeMock: vi.fn() }));

vi.mock("@tauri-apps/api/core", () => ({
  invoke: invokeMock,
}));

import App from "../App";

describe("App", () => {
  afterEach(() => {
    invokeMock.mockReset();
  });

  it("shows a loading state before the backend responds", () => {
    invokeMock.mockReturnValue(new Promise(() => {}));
    render(<App />);
    expect(screen.getByRole("status")).toHaveTextContent("Checking backend health…");
  });

  it("renders the real backend status once health_check resolves", async () => {
    invokeMock.mockResolvedValue({
      status: "ok",
      app_version: "0.1.0",
      build_fingerprint: "abc123",
    });

    render(<App />);

    await waitFor(() => expect(screen.getByText(/Backend: ok/)).toBeInTheDocument());
    expect(invokeMock).toHaveBeenCalledWith("health_check", { appVersion: "0.1.0" });
  });

  it("shows a retryable error state instead of crashing when the backend call fails", async () => {
    invokeMock.mockRejectedValue(new Error("backend unreachable"));

    render(<App />);

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("backend unreachable"));
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("never shows the source list as populated before any source is registered", () => {
    invokeMock.mockReturnValue(new Promise(() => {}));
    render(<App />);
    expect(screen.getByText("No sources registered yet")).toBeInTheDocument();
  });
});
