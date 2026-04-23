"use client";
import React, { useEffect, useRef } from "react";
import { LuX as X } from 'react-icons/lu';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="absolute inset-0 bg-brand-800/40 backdrop-blur-sm animate-fade-in" />
      <div
        className={`
          relative w-full ${sizeClasses[size]} bg-white rounded-card shadow-dropdown
          animate-scale-in
        `}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-divider">
            <h2 className="text-lg font-semibold text-brand-800">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-brand-50 text-muted hover:text-brand-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
