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
  default: "bg-brand-100 text-brand-600",
  success: "bg-green-50 text-success",
  warning: "bg-amber-50 text-warning",
  error: "bg-red-50 text-error",
  outline: "border border-divider text-brand-700 bg-white",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
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
        inline-flex items-center gap-1.5 font-medium rounded-pill
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === "success"
              ? "bg-success"
              : variant === "warning"
              ? "bg-warning"
              : variant === "error"
              ? "bg-error"
              : "bg-brand-600"
          }`}
        />
      )}
      {children}
    </span>
  );
}
