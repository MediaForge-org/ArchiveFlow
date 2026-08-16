/**
 * Session/auth state as reported by an adapter. ArchiveFlow never stores
 * source passwords when a source is bound to an existing browser session
 * (Architecture Guardrail: "Keine Credential-Umgehung"); this type only
 * models the *state*, not any credential material.
 */
export type SessionState =
  | { readonly kind: "unauthenticated" }
  | { readonly kind: "authenticated"; readonly sourceAccountRef: string }
  | { readonly kind: "expired"; readonly sourceAccountRef: string };
