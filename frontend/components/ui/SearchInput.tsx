import React, { useState, useRef, useEffect } from "react";
import { LuSearch as Search, LuX as X } from "react-icons/lu";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  isLoading?: boolean;
}

export default function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
  className = "",
  isLoading = false,
  ...props
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      const event = {
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    }
  };

  // Inline styles to ensure loading regardless of external CSS files
  const containerStyle: React.CSSProperties = {
    width: '100%',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: '#ffffff',
    border: isFocused ? '1px solid #6b4226' : '1px solid #e8eaed',
    borderRadius: '12px',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: isFocused ? '0 0 0 4px rgba(107, 66, 38, 0.1), 0 1px 2px rgba(0, 0, 0, 0.05)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
    transform: isFocused ? 'translateY(-1px)' : 'none',
  };

  const iconWrapperStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: '1rem',
    color: isFocused ? '#6b4226' : '#5f6368',
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    height: '2.875rem',
    padding: '0 0.875rem',
    background: 'transparent',
    border: 'none',
    fontSize: '0.9375rem',
    color: '#3d2616',
    outline: 'none',
    width: '100%',
  };

  const clearBtnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '0.625rem',
    padding: '0.375rem',
    background: '#f5f1ee',
    border: 'none',
    borderRadius: '6px',
    color: '#5f6368',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const shortcutStyle: React.CSSProperties = {
    display: isFocused ? 'none' : 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '1.375rem',
    minWidth: '1.375rem',
    marginRight: '1rem',
    padding: '0 0.5rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#5f6368',
    background: '#fdfcfb',
    border: '1px solid #e8eaed',
    borderRadius: '6px',
    opacity: 0.8,
    pointerEvents: 'none',
  };

  return (
    <div className={`dashboard-search ${className}`.trim()} style={containerStyle}>
      <div className="dashboard-search-icon" style={iconWrapperStyle}>
        {isLoading ? (
          <div className="search-spinner" />
        ) : (
          <Search size={18} />
        )}
      </div>
      <input
        ref={inputRef}
        type="text"
        className="dashboard-search-input"
        style={inputStyle}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        {...props}
      />
      {value && !isLoading && (
        <button
          type="button"
          className="dashboard-search-clear"
          style={clearBtnStyle}
          onClick={handleClear}
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
      <div className="dashboard-search-shortcut" style={shortcutStyle}>/</div>
      
      {/* Small critical CSS for animation if needed */}
      <style>{`
        @keyframes rotate-spinner {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .search-spinner {
          width: 1.125rem;
          height: 1.125rem;
          border: 2px solid #eaddd3;
          border-top-color: #6b4226;
          border-radius: 50%;
          animation: rotate-spinner 0.8s linear infinite;
        }
      `}</style>
    </div>
  );
}
