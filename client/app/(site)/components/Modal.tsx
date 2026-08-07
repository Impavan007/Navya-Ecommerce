"use client";

import React, { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";
  className?: string;
  showCloseButton?: boolean;
  "data-auth-modal"?: string;
}

const sizeClasses = {
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-md", // ~448px
  lg: "max-w-lg", // ~512px
  xl: "max-w-xl", // ~576px
  "2xl": "max-w-2xl", // ~672px
  "3xl": "max-w-3xl", // ~768px
  "4xl": "max-w-4xl", // ~896px
  "5xl": "max-w-5xl", // ~1024px
  "6xl": "max-w-6xl", // ~1152px
  "7xl": "max-w-7xl", // ~1280px
  full: "max-w-[95vw]",
};

export function BaseModal({
  isOpen,
  onClose,
  children,
  size = "md",
  className = "",
  showCloseButton = false,
  ...props
}: BaseModalProps) {
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const authModalAttr = props["data-auth-modal"];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-[2px]"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`relative w-full ${sizeClasses[size]} bg-[#FAF6F3] shadow-2xl flex flex-col max-h-[90vh] z-10 ${className}`}
            data-auth-modal={authModalAttr}
            onClick={(e) => e.stopPropagation()}
          >
            {showCloseButton && (
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 text-[#3D1126] hover:opacity-70 transition-opacity"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function ModalHeader({
  title,
  onClose,
  className = "",
}: {
  title: string;
  onClose?: () => void;
  className?: string;
}) {
  return (
    <div className={`p-6 shrink-0 flex items-center justify-between ${className}`}>
      <h2 className="font-poppins font-semibold text-[20px] leading-[28px] text-black capitalize">
        {title}
      </h2>

    </div>
  );
}

export function ModalBody({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex-1 overflow-y-auto p-6 ${className}`}>
      {children}
    </div>
  );
}

export function ModalFooter({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`p-6 shrink-0 border-t border-[#e5e5e5] ${className}`}>
      {children}
    </div>
  );
}

interface ConfirmationContentProps {
  title: string;
  message: string;
  type?: "success" | "danger" | "warning" | "info";
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmationModalContent({
  title,
  message,
  type = "info",
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmationContentProps) {
  const getIcon = () => {
    switch (type) {
      case "danger":
        return (
          <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full border border-[#da1a32]/40 bg-[#fce8ec]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#da1a32" strokeWidth="1.5" />
              <path d="M9 9L15 15M15 9L9 15" stroke="#da1a32" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        );
      case "success":
        return (
          <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full border border-[#2fb344]/50 bg-[#e9f7ec]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#2fb344" strokeWidth="1.5" />
              <path d="M8 12.5L10.5 15L16 9.5" stroke="#2fb344" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8 text-center">
      {getIcon()}
      <h2 className="font-['Playfair_Display'] text-[24px] font-semibold text-[#3D1126] capitalize">
        {title}
      </h2>
      <p className="mt-3 font-poppins text-[16px] leading-[24px] text-[#3D1126]">
        {message}
      </p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={`px-8 py-3 font-poppins text-[14px] font-medium transition-colors ${type === "danger"
            ? "bg-[#da1a32] text-white hover:bg-[#b8162a]"
            : "bg-[#1A1A1A] text-white hover:bg-[#1a1719]"
            } disabled:opacity-60`}
        >
          {isLoading ? "Processing..." : confirmLabel}
        </button>
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="border border-[#3D1126] px-8 py-3 font-poppins text-[14px] font-medium text-[#3D1126] hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          {cancelLabel}
        </button>
      </div>
    </div>
  );
}
