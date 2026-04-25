import React from "react";

type BadgeVariant = "default" | "success" | "warning" | "error" | "outline";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "badge-default",
  success: "badge-success",
  warning: "badge-warning",
  error: "badge-error",
  outline: "badge-outline",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "badge-sm",
  md: "badge-md",
};

export default function Badge({
  children,
  variant = "default",
  size = "sm",
  dot = false,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        badge
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`badge-dot ${
            variant === "success"
              ? "badge-dot--success"
              : variant === "warning"
              ? "badge-dot--warning"
              : variant === "error"
              ? "badge-dot--error"
              : "badge-dot--default"
          }`}
        />
      )}
      {children}
    </span>
  );
}
