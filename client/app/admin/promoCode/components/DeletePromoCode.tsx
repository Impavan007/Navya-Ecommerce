'use client';

import React, { useState } from 'react';
import { RiErrorWarningLine } from 'react-icons/ri';
import CommonModal from '../../../components/common/CommonModal';
import usePromoStore from '../../store/PromoCode/PromoStore';

interface DeletePromoCodeProps {
    promo: any;
    onClose: () => void;
}

export default function DeletePromoCode({ promo, onClose }: DeletePromoCodeProps) {
    const { deletePromoCode } = usePromoStore();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        setIsDeleting(true);
        const success = await deletePromoCode(promo._id || promo.id);
        setIsDeleting(false);
        if (success) {
            onClose();
        }
    };

    return (
        <CommonModal isOpen={true} onClose={onClose} size="sm" showCloseButton={false}>
            <div className="flex items-center gap-3 text-[#DC2626] mb-4">
                <RiErrorWarningLine className="text-2xl" />
                <h3 className="text-lg font-semibold font-canela">Delete Promo Code</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6 font-roboto">
                Are you sure you want to delete the promo code <span className="font-bold">{promo.code}</span>? This action cannot be undone and will prevent any future usage of this code.
            </p>
            <div className="flex gap-3">
                <button
                    onClick={onClose}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 font-roboto"
                >
                    Cancel
                </button>
                <button
                    onClick={handleConfirm}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 bg-[#DC2626] text-white rounded-lg text-sm font-medium hover:bg-[#b91c1c] disabled:opacity-50 transition-colors font-roboto"
                >
                    {isDeleting ? "Deleting..." : "Confirm Delete"}
                </button>
            </div>
        </CommonModal>
    );
}
