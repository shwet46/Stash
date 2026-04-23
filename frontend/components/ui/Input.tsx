import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

export default function Input({
  label,
  error,
  icon,
  helperText,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-brand-700"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`
            w-full px-4 py-2.5 rounded-chip border border-divider bg-white text-brand-800
            placeholder:text-muted/60 text-sm
            focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 focus:outline-none
            transition-all duration-200
            ${icon ? "pl-10" : ""}
            ${error ? "border-error focus:border-error focus:ring-error/10" : ""}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-muted">{helperText}</p>
      )}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({
  label,
  error,
  options,
  className = "",
  id,
  ...props
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-brand-700"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`
          w-full px-4 py-2.5 rounded-chip border border-divider bg-white text-brand-800
          text-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 focus:outline-none
          transition-all duration-200 cursor-pointer
          ${error ? "border-error" : ""}
          ${className}
        `}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
