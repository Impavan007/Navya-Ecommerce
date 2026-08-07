'use client';

import React from 'react';
import { RiErrorWarningLine } from 'react-icons/ri';
import CommonModal from '../../components/common/CommonModal';

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
    title?: string;
    description?: string;
}

export default function DeleteModal({
    isOpen,
    onClose,
    onConfirm,
    isDeleting,
    title = "Delete Confirmation",
    description = "Are you sure you want to delete this item? This action cannot be undone."
}: DeleteModalProps) {
    return (
        <CommonModal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
            <div className="flex items-center gap-3 text-[#DC2626] mb-4">
                <RiErrorWarningLine className="text-2xl" />
                <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
                {description}
            </p>
            <div className="flex gap-3">
                <button
                    onClick={onClose}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 bg-[#DC2626] text-white rounded-lg text-sm font-medium hover:bg-[#b91c1c] disabled:opacity-50 transition-colors"
                >
                    {isDeleting ? "Deleting..." : "Confirm"}
                </button>
            </div>
        </CommonModal>
    );
}
