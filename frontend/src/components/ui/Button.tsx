import type { ComponentProps } from "react";

interface Props extends ComponentProps<"button"> {
  variant?: "primary" | "secondary";
}

export const Button = ({ variant = "primary", className = "", children, ...rest }: Props) => {
  return (
    <button
      className={`btn-${variant} flex items-center justify-center gap-2 py-2 px-4 rounded-sm font-semibold ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};
