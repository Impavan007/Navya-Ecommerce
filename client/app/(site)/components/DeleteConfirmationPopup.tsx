"use client";

import React from "react";
import { BaseModal, ConfirmationModalContent } from "./Modal";

interface DeleteConfirmationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
  isLoading?: boolean;
  context?: 'cart' | 'wishlist' | 'account_delete' | 'account_deactivate' | 'account_activate' | 'address';
  customMessage?: string;
  customTitle?: string;
}

export default function DeleteConfirmationPopup({
  isOpen,
  onClose,
  onConfirm,
  itemName = "this item",
  isLoading = false,
  context = 'cart',
  customMessage,
  customTitle
}: DeleteConfirmationPopupProps) {
  if (!isOpen) return null;

  // Generate appropriate messages based on context
  const getTitle = () => {
    if (customTitle) return customTitle;
    if (context === 'wishlist') return 'Remove item from wishlist?';
    if (context === 'account_delete') return 'Delete account?';
    if (context === 'account_deactivate') return 'Deactivate account';
    if (context === 'account_activate') return 'Activate account';
    if (context === 'address') return 'Delete address?';
    return itemName === 'all items' ? 'Clear cart?' : 'Remove item from cart?';
  };

  const getConfirmText = () => {
    if (isLoading) {
      if (context === 'account_delete') return 'Deleting...';
      if (context === 'account_deactivate') return 'Processing...';
      if (context === 'address') return 'Deleting...';
      return 'Removing...';
    }
    if (context === 'account_delete') return 'Delete';
    if (context === 'account_deactivate') return 'Deactivate account';
    if (context === 'account_activate') return 'Activate account';
    if (context === 'address') return 'Delete';
    return context === 'wishlist' ? 'Remove' : 'Continue';
  };

  const getMessage = () => {
    if (customMessage) return customMessage;
    if (context === 'account_delete') return 'This action is permanent. All your data, including addresses and orders, will be removed.';
    if (context === 'account_deactivate') return 'Are you sure you want to deactivate your account? You can reactivate anytime by signing back in.';
    if (context === 'account_activate') return 'Are you sure you want to activate your account? This will restore your access to all features.';
    if (context === 'address') return 'Are you sure you want to delete this address? This action cannot be undone.';
    if (itemName === 'all items') {
      return `Are you sure you want to remove ${itemName}?`;
    }
    return `Are you sure you want to remove "${itemName}" from your ${context}?`;
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} size="lg">
      <ConfirmationModalContent
        title={getTitle()}
        message={getMessage()}
        type={context === 'account_activate' ? "success" : "danger"}
        confirmLabel={getConfirmText()}
        cancelLabel="Cancel"
        onConfirm={onConfirm}
        onCancel={onClose}
        isLoading={isLoading}
      />
    </BaseModal>
  );
}