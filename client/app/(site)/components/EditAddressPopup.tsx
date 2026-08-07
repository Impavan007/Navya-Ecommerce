"use client";

import React, { useState, useEffect } from "react";
import { BaseModal, ModalHeader, ModalBody, ModalFooter } from "./Modal";

interface EditAddressPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (addressData: AddressData) => void;
  addressData: AddressData;
  isLoading?: boolean;
}

interface AddressData {
  id?: number;
  _id?: string;
  label: string;
  house_number: string;         // Flat / House No., Building
  house_number_suffix: string;  // Landmark (optional)
  street_name: string;          // Street / Area / Locality
  city: string;
  state?: string;
  postal_code: string;          // 6-digit Indian PIN
  is_primary: boolean;
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const INDIAN_PIN_REGEX = /^[1-9][0-9]{5}$/;

export default function EditAddressPopup({
  isOpen,
  onClose,
  onSave,
  addressData,
  isLoading = false
}: EditAddressPopupProps) {
  const [formData, setFormData] = useState<AddressData>({
    label: 'home',
    house_number: '',
    house_number_suffix: '',
    street_name: '',
    city: '',
    state: '',
    postal_code: '',
    is_primary: false
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AddressData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof AddressData, boolean>>>({});

  const validationRules: Record<string, { required?: boolean; pattern?: RegExp; message: string }> = {
    house_number: {
      required: true,
      message: 'Flat / House No. is required'
    },
    street_name: {
      required: true,
      message: 'Street / Area / Locality is required'
    },
    city: {
      required: true,
      message: 'City / District / Town is required'
    },
    state: {
      required: true,
      message: 'State is required'
    },
    postal_code: {
      required: true,
      pattern: INDIAN_PIN_REGEX,
      message: 'Enter a valid 6-digit PIN code (e.g., 400001)'
    }
  };

  // Populate form when addressData changes or popup opens
  useEffect(() => {
    if (isOpen && addressData) {
      setFormData({
        _id: addressData._id,
        label: addressData.label || 'home',
        house_number: addressData.house_number || '',
        house_number_suffix: addressData.house_number_suffix || '',
        street_name: addressData.street_name || '',
        city: addressData.city || '',
        state: (addressData as any).state || '',
        postal_code: addressData.postal_code || '',
        is_primary: !!addressData.is_primary
      });
      setErrors({});
      setTouched({});
    }
  }, [isOpen, addressData]);

  const validateField = (field: keyof AddressData, value: any): string => {
    const rules = validationRules[field as string];
    if (!rules) return '';
    const str = String(value || '').trim();
    if (rules.required && !str) return rules.message;
    if (str && rules.pattern && !rules.pattern.test(str)) return rules.message;
    return '';
  };

  const handleInputChange = (field: keyof AddressData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
    }
  };

  const handleInputBlur = (field: keyof AddressData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validateField(field, formData[field]) }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AddressData, string>> = {};
    let isValid = true;
    (Object.keys(validationRules) as Array<keyof AddressData>).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) { newErrors[field] = error; isValid = false; }
    });
    setErrors(newErrors);
    if (!isValid) {
      const allTouched = (Object.keys(validationRules) as Array<keyof AddressData>).reduce(
        (acc, key) => { acc[key] = true; return acc; }, {} as any
      );
      setTouched(allTouched);
    }
    return isValid;
  };

  const handleSave = () => {
    if (!isLoading && validateForm()) onSave(formData);
  };

  const fieldClass = (err?: string) =>
    `border-b ${err ? 'border-red-500' : 'border-[#6d6d6d]'} pb-1`;

  const inputClass =
    "w-full font-poppins text-[16px] leading-[24px] text-[#3D1126] bg-transparent border-none outline-none";

  const labelClass = "font-poppins text-[13px] text-[#8a8a8a] mt-1";
  const errClass   = "font-poppins text-[11px] text-red-500 mt-0.5";

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalHeader title="Edit Address" />

      <ModalBody className="md:px-[48px] pt-0">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-8">

            {/* Row 1: Flat/House No. + Landmark */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <div className="flex flex-col flex-1">
                <div className={fieldClass(errors.house_number)}>
                  <input
                    type="text"
                    value={formData.house_number}
                    placeholder="e.g. A-204, Krishna Towers"
                    onChange={(e) => handleInputChange('house_number', e.target.value)}
                    onBlur={() => handleInputBlur('house_number')}
                    className={inputClass}
                  />
                </div>
                <label className={labelClass}>Flat / House No., Building *</label>
                {errors.house_number && <p className={errClass}>{errors.house_number}</p>}
              </div>

              <div className="flex flex-col flex-1">
                <div className="border-b border-[#6d6d6d] pb-1">
                  <input
                    type="text"
                    value={formData.house_number_suffix}
                    placeholder="e.g. Near City Mall"
                    onChange={(e) => handleInputChange('house_number_suffix', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <label className={labelClass}>Landmark (optional)</label>
              </div>
            </div>

            {/* Row 2: Street / Area / Locality */}
            <div className="flex flex-col w-full">
              <div className={fieldClass(errors.street_name)}>
                <input
                  type="text"
                  value={formData.street_name}
                  placeholder="e.g. MG Road, Bandra West"
                  onChange={(e) => handleInputChange('street_name', e.target.value)}
                  onBlur={() => handleInputBlur('street_name')}
                  className={inputClass}
                />
              </div>
              <label className={labelClass}>Street / Area / Locality *</label>
              {errors.street_name && <p className={errClass}>{errors.street_name}</p>}
            </div>

            {/* Row 3: PIN Code + City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <div className="flex flex-col flex-1">
                <div className={fieldClass(errors.postal_code)}>
                  <input
                    type="text"
                    value={formData.postal_code}
                    placeholder="e.g. 400001"
                    maxLength={6}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      handleInputChange('postal_code', val);
                    }}
                    onBlur={() => handleInputBlur('postal_code')}
                    className={inputClass}
                  />
                </div>
                <label className={labelClass}>PIN Code *</label>
                {errors.postal_code && <p className={errClass}>{errors.postal_code}</p>}
              </div>

              <div className="flex flex-col flex-1">
                <div className={fieldClass(errors.city)}>
                  <input
                    type="text"
                    value={formData.city}
                    placeholder="e.g. Mumbai"
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    onBlur={() => handleInputBlur('city')}
                    className={inputClass}
                  />
                </div>
                <label className={labelClass}>City / District / Town *</label>
                {errors.city && <p className={errClass}>{errors.city}</p>}
              </div>
            </div>

            {/* Row 4: State */}
            <div className="flex flex-col w-full">
              <div className={fieldClass(errors.state)}>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  onBlur={() => handleInputBlur('state')}
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value="">Select State / UT</option>
                  {INDIAN_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <label className={labelClass}>State / Union Territory *</label>
              {errors.state && <p className={errClass}>{errors.state}</p>}
            </div>

          </div>

          {/* Address Type */}
          <div className="flex flex-col gap-4">
            <p className="font-poppins font-medium text-[16px] text-black">Address Type</p>
            <div className="flex gap-8">
              {['home', 'work'].map((type) => (
                <label key={type} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="radio"
                      name="edit-label"
                      checked={formData.label === type}
                      onChange={() => handleInputChange('label', type)}
                      className="peer appearance-none w-5 h-5 border-2 border-[#6d6d6d] rounded-full checked:border-[#1A1A1A] transition-all cursor-pointer"
                    />
                    <div className="absolute w-2.5 h-2.5 bg-[#1A1A1A] rounded-full scale-0 peer-checked:scale-100 transition-transform" />
                  </div>
                  <span className="font-poppins font-medium text-[16px] text-[#3D1126] capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Is Primary */}
          <div className="flex items-center justify-between pt-6 border-t border-[#e5e5e5]">
            <div className="flex flex-col">
              <p className="font-poppins font-medium text-[16px] text-black">Set as primary address</p>
              <p className="font-poppins text-[12px] text-[#8a8a8a]">This address will be used as your default delivery address</p>
            </div>
            <button
              type="button"
              onClick={() => handleInputChange('is_primary', !formData.is_primary)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.is_primary ? 'bg-[#1A1A1A]' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.is_primary ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <div className="flex justify-end gap-4">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={`px-10 py-3 rounded-lg font-poppins font-semibold text-[16px] transition-all ${isLoading
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-[#1A1A1A] hover:bg-[#1a1719] text-white shadow-lg'
              }`}
          >
            {isLoading ? 'Updating...' : 'Update'}
          </button>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-10 py-3 rounded-lg border-2 border-[#3D1126] font-poppins font-semibold text-[16px] text-[#3D1126] hover:bg-gray-100 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </ModalFooter>
    </BaseModal>
  );
}
