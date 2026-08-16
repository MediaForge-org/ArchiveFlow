import "@archiveflow/ui/styles.css";
import { EmptyState, ErrorState, LoadingState } from "@archiveflow/ui";
import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useState } from "react";

import "./App.css";

interface HealthStatus {
  status: string;
  app_version: string;
  build_fingerprint: string;
}

type HealthCheckState =
  | { readonly kind: "loading" }
  | { readonly kind: "loaded"; readonly health: HealthStatus }
  | { readonly kind: "error"; readonly message: string };

function useHealthCheck(): [HealthCheckState, () => void] {
  const [state, setState] = useState<HealthCheckState>({ kind: "loading" });

  const run = useCallback(() => {
    setState({ kind: "loading" });
    invoke<HealthStatus>("health_check", { appVersion: "0.1.0" })
      .then((health) => setState({ kind: "loaded", health }))
      .catch((error: unknown) =>
        setState({
          kind: "error",
          message: error instanceof Error ? error.message : "Backend health check failed.",
        }),
      );
  }, []);

  useEffect(() => {
    run();
  }, [run]);

  return [state, run];
}

function App() {
  const [health, retryHealthCheck] = useHealthCheck();

  return (
    <main className="container">
      <h1>ArchiveFlow</h1>
      <p className="tagline">
        Source-neutral social media archive manager. Instagram is Source #1, not the core.
      </p>

      {health.kind === "loading" && <LoadingState label="Checking backend health…" />}
      {health.kind === "error" && (
        <ErrorState message={health.message} onRetry={retryHealthCheck} />
      )}
      {health.kind === "loaded" && (
        <section aria-label="Backend status">
          <p>
            Backend: {health.health.status} (v{health.health.app_version})
          </p>
        </section>
      )}

      <EmptyState
        title="No sources registered yet"
        description="Source adapters are registered by the app shell in a later package."
      />
    </main>
  );
}

export default App;
