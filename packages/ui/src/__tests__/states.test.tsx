import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EmptyState } from "../EmptyState";
import { ErrorState } from "../ErrorState";
import { LoadingState } from "../LoadingState";

describe("LoadingState", () => {
  it("announces itself via an accessible status role", () => {
    render(<LoadingState label="Fetching accounts…" />);
    expect(screen.getByRole("status")).toHaveTextContent("Fetching accounts…");
  });
});

describe("EmptyState", () => {
  it("renders a title and optional description without fake data", () => {
    render(
      <EmptyState title="No sources registered yet" description="Register a source to begin." />,
    );
    expect(screen.getByText("No sources registered yet")).toBeInTheDocument();
    expect(screen.getByText("Register a source to begin.")).toBeInTheDocument();
  });
});

describe("ErrorState", () => {
  it("is keyboard-reachable and triggers retry on click", () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Could not reach the source adapter." onRetry={onRetry} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Could not reach the source adapter.");

    const retryButton = screen.getByRole("button", { name: "Retry" });
    retryButton.focus();
    expect(retryButton).toHaveFocus();

    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("omits the retry action entirely when no retry handler is given", () => {
    render(<ErrorState message="Fatal." />);
    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
  });
});
