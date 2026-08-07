"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { MapPin, X } from "lucide-react";
import type { RenterAddressListItem } from "../types/api";

interface ChangeAddressPopupProps {
  isOpen: boolean;
  onClose: () => void;
  addresses: RenterAddressListItem[];
  selectedAddressId?: string | null;
  onSelectAddress: (id: string) => void;
  onAddNewAddress: () => void;
}

import { BaseModal, ModalHeader, ModalBody, ModalFooter } from "./Modal";

export default function ChangeAddressPopup({
  isOpen,
  onClose,
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddNewAddress,
}: ChangeAddressPopupProps) {
  const [pincode, setPincode] = useState("");
  const [errors, setErrors] = useState<{ pincode?: string; address?: string }>({});

  const validate = () => {
    const newErrors: { pincode?: string; address?: string } = {};

    // Indian PIN code check (6 digits, first digit non-zero)
    if (!pincode) {
      newErrors.pincode = "PIN code is required";
    } else if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      newErrors.pincode = "Enter a valid 6-digit PIN code (e.g., 400001)";
    }

    // Address selection check
    if (!selectedAddressId) {
      newErrors.address = "Please select a delivery address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      toast.error("Please fix the highlighted errors.");
      return;
    }

    toast.success(`Checking delivery for PIN code: ${pincode}`);
  };

  const handleUseLocation = () => {
    toast.loading("Detecting current location...");
    setTimeout(() => {
      toast.success("Location detected successfully!");
    }, 1500);
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} size="md" showCloseButton>
      <ModalHeader title="Select Delivery Address" onClose={onClose} />
      <ModalBody>
        {/* Address List */}
        {addresses.length > 0 ? (
          <div className="flex flex-col gap-4 mb-6">
            {addresses.map((addr) => (
              <label
                key={addr._id}
                className={`flex items-start gap-4 cursor-pointer p-4 transition-all border ${selectedAddressId === addr._id
                  ? "border-black bg-gray-50"
                  : "border-gray-100 hover:border-gray-300"
                  }`}
              >
                <div className="pt-1">
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === addr._id}
                    onChange={() => {
                      onSelectAddress(addr._id);
                      if (errors.address)
                        setErrors((prev) => ({ ...prev, address: "" }));
                    }}
                    className="accent-black w-5 h-5"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] text-gray-900 mb-1">
                    Deliver to:{" "}
                    <span className="font-semibold capitalize">
                      {addr.house_number}{addr.house_number_suffix ? `, ${addr.house_number_suffix}` : ''}, {addr.street_name}
                    </span>
                  </p>
                  <p className="text-[13px] text-[#3D1126] font-medium mb-1">
                    {addr.city?.toUpperCase()}{(addr as any).state ? ` — ${(addr as any).state}` : ''} — {addr.postal_code}
                  </p>
                  <div className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-[#888] text-[10px] uppercase font-bold tracking-wider">
                    {addr.label}
                  </div>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 mb-6">
            <p className="text-gray-500 font-poppins italic">No addresses found.</p>
          </div>
        )}

        {errors.address && (
          <p className="text-red-500 text-xs mb-4 text-center">
            {errors.address}
          </p>
        )}
      </ModalBody>
      <ModalFooter>
        {/* Add New Address */}
        <button
          onClick={onAddNewAddress}
          className="bg-black text-white text-[14px] font-medium font-poppins px-6 py-4 w-full hover:bg-gray-900 transition-colors"
        >
          Add New Address
        </button>
      </ModalFooter>
    </BaseModal>
  );
}
