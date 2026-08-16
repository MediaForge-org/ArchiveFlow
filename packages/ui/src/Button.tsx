import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
}

/**
 * Base button for shared screens. Native `<button>` so it is keyboard
 * reachable and focusable by default; focus visibility comes from
 * `styles.css`'s `:focus-visible` rule rather than being suppressed here.
 */
export function Button({ variant = "primary", className, ...rest }: ButtonProps) {
  const classes = ["af-button", `af-button--${variant}`, className].filter(Boolean).join(" ");
  return <button className={classes} {...rest} />;
}
