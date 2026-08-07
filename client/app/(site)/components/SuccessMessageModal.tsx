"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { BaseModal, ConfirmationModalContent } from "./Modal";

interface SuccessMessageModalProps {
  title: string;
  message: string;
  primaryCtaLabel?: string;
  redirectPath: string;
  onClose?: () => void;
}

export default function SuccessMessageModal({
  title,
  message,
  primaryCtaLabel = "Return to home page",
  redirectPath,
  onClose,
}: SuccessMessageModalProps) {
  const router = useRouter();

  const handlePrimaryAction = () => {
    router.push(redirectPath);
  };

  return (
    <BaseModal isOpen={true} onClose={onClose || (() => {})} size="md" showCloseButton={!!onClose}>
      <ConfirmationModalContent
        title={title}
        message={message}
        confirmLabel={primaryCtaLabel}
        onConfirm={handlePrimaryAction}
        onCancel={onClose || (() => {})}
        type="success"
      />
    </BaseModal>
  );
}
