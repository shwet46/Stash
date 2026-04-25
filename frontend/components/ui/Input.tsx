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
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="input-group">
      {label && (
        <label
          htmlFor={inputId}
          className="input-label"
        >
          {label}
        </label>
      )}
      <div className="input-wrapper">
        {icon && (
          <span className="input-icon">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`input-field ${icon ? "input-field--with-icon" : ""} ${error ? "input-field--error" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p id={errorId} className="input-error">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="input-helper">
          {helperText}
        </p>
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
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className="input-group">
      {label && (
        <label
          htmlFor={selectId}
          className="input-label"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={`input-field form-select ${error ? "input-field--error" : ""} ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="input-error">
          {error}
        </p>
      )}
    </div>
  );
}
