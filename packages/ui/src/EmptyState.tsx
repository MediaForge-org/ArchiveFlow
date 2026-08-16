import type { ReactNode } from "react";

export interface EmptyStateProps {
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="af-empty-state">
      <p className="af-empty-state__title">{title}</p>
      {description ? <p className="af-empty-state__description">{description}</p> : null}
      {action}
    </div>
  );
}
