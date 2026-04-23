import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  accent?: "brown" | "warm" | "tan" | "none";
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const accentClasses = {
  brown: "border-l-4 border-l-brand-600",
  warm: "border-l-4 border-l-brand-500",
  tan: "border-l-4 border-l-brand-400",
  none: "",
};

export default function Card({
  children,
  className = "",
  hover = false,
  padding = "md",
  accent = "none",
}: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-card border border-divider shadow-card
        ${paddingClasses[padding]}
        ${accentClasses[accent]}
        ${hover ? "hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={`text-lg font-semibold text-brand-800 ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-sm text-muted mt-1 ${className}`}>
      {children}
    </p>
  );
}
