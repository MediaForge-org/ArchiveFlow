import { useState } from "react";

type ConnectionState =
  | { readonly status: "checking" }
  | { readonly status: "disconnected" }
  | { readonly status: "error"; readonly message: string };

/**
 * Native-messaging connection check is a later package (P001 has no
 * Instagram/desktop access yet). The state starts "checking" and resolves
 * to "disconnected" so the UI never shows a fabricated "connected" status.
 */
function useDesktopConnection(): ConnectionState {
  const [state] = useState<ConnectionState>({ status: "disconnected" });
  return state;
}

export function App() {
  const connection = useDesktopConnection();

  return (
    <main style={{ padding: "1rem" }}>
      <h1 style={{ fontSize: "1rem", margin: 0 }}>ArchiveFlow — Instagram Companion</h1>
      <p style={{ color: "#64748b" }}>Source #1. Not the core.</p>
      {connection.status === "disconnected" && (
        <p role="status">Not connected to ArchiveFlow Desktop yet.</p>
      )}
      {connection.status === "error" && <p role="alert">{connection.message}</p>}
    </main>
  );
}
