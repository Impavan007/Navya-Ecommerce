"use client";

import React from "react";
import { BaseModal, ConfirmationModalContent } from "./Modal";

interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmationModal({
  title,
  message,
  confirmLabel = "Yes proceed",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmationModalProps) {
  return (
    <BaseModal isOpen={true} onClose={onCancel} size="md">
      <ConfirmationModalContent
        title={title}
        message={message}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        onConfirm={onConfirm}
        onCancel={onCancel}
        isLoading={loading}
        type="danger" // Confirmation modals in this project often imply a destructive action
      />
    </BaseModal>
  );
}
