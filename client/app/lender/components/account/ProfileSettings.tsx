'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import useProfileStore, { ProfileData } from '../../stores/Profile/profileStore';
import CommonLoader from '@/app/components/common/CommonLoader';

// Validation types
interface ValidationErrors {
  fullName?: string;
  phone?: string;
  street_name?: string;
  house_number?: string;
  postal_code?: string;
  city?: string;
  bio?: string;
  profileImage?: string;
}

export default function ProfileSettings() {
  const { profile, loading, error, fetchProfile, updateProfile } = useProfileStore();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileData>(profile);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Update local formData whenever store profile changes
  useEffect(() => {
    setFormData(profile);
    setValidationErrors({}); // Clear errors when profile loads
  }, [profile]);

  // Netherlands-specific validation rules
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Full Name validation (Dutch names can contain spaces, hyphens, and apostrophes)
    if (!formData.fullName?.trim()) {
      errors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 2) {
      errors.fullName = 'Name must contain at least 2 characters';
    } else if (!/^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð\s\-'.]+$/.test(formData.fullName)) {
      errors.fullName = 'Name contains invalid characters';
    }

    // Phone number validation (Indian phone numbers)
    if (formData.phone && !/^(\+91|91|0)?[6-9][0-9]{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid Indian phone number (e.g., 9876543210 or +919876543210)';
    }

    // Discrete Address validation
    const mainAddress = formData.addresses?.[0];
    if (isEditing) {
      if (!mainAddress?.street_name?.trim()) {
        errors.street_name = 'Street name is required';
      }
      if (!mainAddress?.house_number?.trim()) {
        errors.house_number = 'House number is required';
      }
      if (!mainAddress?.postal_code?.trim()) {
        errors.postal_code = 'PIN code is required';
      } else if (!/^[1-9][0-9]{5}$/.test(mainAddress.postal_code.trim())) {
        errors.postal_code = 'Enter a valid 6-digit PIN code';
      }
      if (!mainAddress?.city?.trim()) {
        errors.city = 'City is required';
      }
    }

    // Bio length validation
    if (formData.bio && formData.bio.length > 500) {
      errors.bio = 'Bio cannot exceed 500 characters';
    }

    // Profile image validation (file size and type)
    if (formData.profileImage instanceof File) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

      if (formData.profileImage.size > maxSize) {
        errors.profileImage = 'Image must be smaller than 5MB';
      } else if (!allowedTypes.includes(formData.profileImage.type)) {
        errors.profileImage = 'Only JPEG, PNG, GIF and WebP images are allowed';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const addresses = [...(prev.addresses || [])];
      if (addresses.length === 0) {
        addresses.push({
          label: 'home',
          street_name: '',
          house_number: '',
          house_number_suffix: '',
          postal_code: '',
          city: '',
        });
      }
      addresses[0] = { ...addresses[0], [name]: value };
      return { ...prev, addresses };
    });

    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please check the input fields');
      return;
    }

    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Update failed', err);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate image before setting state
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

      if (file.size > maxSize) {
        setValidationErrors(prev => ({
          ...prev,
          profileImage: 'Image must be smaller than 5MB'
        }));
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        setValidationErrors(prev => ({
          ...prev,
          profileImage: 'Only JPEG, PNG, GIF and WebP images are allowed'
        }));
        return;
      }

      // Clear any previous image errors
      setValidationErrors(prev => ({
        ...prev,
        profileImage: undefined
      }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({ ...prev, profileImage: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Format phone number for display (Indian format)
  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '';

    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return `+${cleaned}`;
    } else if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }

    return phone;
  };

  if (loading) return <p className="text-center h-screen flex items-center justify-center"><CommonLoader /></p>;

  return (
    <div className="space-y-6 font-playfair">
      {/* Profile Photo */}
      <div className="bg-white shadow-sm border border-gray-200 p-6 rounded-lg">
        <h3 className="font-poppins text-xl font-semibold text-gray-900 mb-6">Profile Photo</h3>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-gray-100 flex-shrink-0">
              <Image
                src={
                  formData.profileImage instanceof File
                    ? URL.createObjectURL(formData.profileImage)
                    : formData.profileImage
                }
                alt="Profile"
                width={120}
                height={120}
                className="w-full h-full object-cover"
              />
            </div>

            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-gray-800 text-white rounded-full min-h-10 min-w-10 h-10 w-10 flex items-center justify-center cursor-pointer hover:bg-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2">
                <i className="ri-camera-line w-4 h-4 flex items-center justify-center"></i>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex-1">
            {isEditing && (
              <div>
                <p className="text-sm text-gray-600 mb-2 font-poppins">
                  Upload a new profile photo. Maximum 5MB. Allowed formats: JPEG, PNG, GIF, WebP.
                </p>
                {validationErrors.profileImage && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.profileImage}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white shadow-sm border border-gray-200 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-poppins text-xl font-semibold text-gray-900">Personal Information</h3>
          <button
            onClick={() => {
              setIsEditing(!isEditing);
              setValidationErrors({});
              setFormData(profile); // Reset form data when canceling
            }}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-800 hover:text-gray-900 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 rounded font-poppins"
          >
            <i className={`${isEditing ? 'ri-close-line' : 'ri-edit-line'} w-4 h-4 flex items-center justify-center`}></i>
            <span>{isEditing ? 'Cancel' : 'Edit'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:border-gray-800 disabled:bg-gray-50 disabled:text-gray-500 transition-colors font-playfair ${validationErrors.fullName
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-gray-800 focus:border-gray-800'
                }`}
              required
            />
            {validationErrors.fullName && (
              <p className="text-red-600 text-sm mt-1">{validationErrors.fullName}</p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-3 py-2 pr-10 border border-gray-300 bg-gray-50 text-gray-500 font-playfair rounded"
            />
            <p className="text-xs text-gray-500 mt-1">
              Email is verified and cannot be changed
            </p>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formatPhoneNumber(formData.phone || '')}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="e.g., 9876543210"
              className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:border-gray-800 disabled:bg-gray-50 disabled:text-gray-500 transition-colors font-playfair ${validationErrors.phone
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-gray-800 focus:border-gray-800'
                }`}
            />
            {validationErrors.phone && (
              <p className="text-red-600 text-sm mt-1">{validationErrors.phone}</p>
            )}
            {!validationErrors.phone && isEditing && (
              <p className="text-xs text-gray-500 mt-1">
                Format: 9876543210 or +919876543210
              </p>
            )}
          </div>

          {/* Detailed Address Information */}
          <div className="col-span-full border-t border-gray-100 pt-6 mt-2">
            <h4 className="font-poppins text-lg font-semibold text-gray-900 mb-4">Address Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Status/Label */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                  Label
                </label>
                <input
                  type="text"
                  name="label"
                  value={formData.addresses?.[0]?.label || ''}
                  onChange={handleAddressChange}
                  disabled={!isEditing}
                  placeholder="e.g., Home, Work"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-800 disabled:bg-gray-50 disabled:text-gray-500 font-playfair"
                />
              </div> */}

              {/* Street Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                  Street / Area / Locality *
                </label>
                <input
                  type="text"
                  name="street_name"
                  value={formData.addresses?.[0]?.street_name || ''}
                  onChange={handleAddressChange}
                  disabled={!isEditing}
                  placeholder="e.g., MG Road, Bandra West"
                  className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-500 font-playfair ${validationErrors.street_name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-gray-800'
                    }`}
                />
                {validationErrors.street_name && (
                  <p className="text-red-600 text-sm mt-1 font-poppins">{validationErrors.street_name}</p>
                )}
              </div>

              {/* House Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                  Flat / House No., Building *
                </label>
                <input
                  type="text"
                  name="house_number"
                  value={formData.addresses?.[0]?.house_number || ''}
                  onChange={handleAddressChange}
                  disabled={!isEditing}
                  placeholder="e.g., A-204"
                  className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-500 font-playfair ${validationErrors.house_number ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-gray-800'
                    }`}
                />
                {validationErrors.house_number && (
                  <p className="text-red-600 text-sm mt-1 font-poppins">{validationErrors.house_number}</p>
                )}
              </div>

              {/* House Number Suffix */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                  Landmark (optional)
                </label>
                <input
                  type="text"
                  name="house_number_suffix"
                  value={formData.addresses?.[0]?.house_number_suffix || ''}
                  onChange={handleAddressChange}
                  disabled={!isEditing}
                  placeholder="e.g., Near City Mall"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-800 disabled:bg-gray-50 disabled:text-gray-500 font-playfair"
                />
              </div>

              {/* Postal Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                  PIN Code *
                </label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.addresses?.[0]?.postal_code || ''}
                  onChange={handleAddressChange}
                  disabled={!isEditing}
                  placeholder="e.g., 400001"
                  className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-500 font-playfair ${validationErrors.postal_code ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-gray-800'
                    }`}
                />
                {validationErrors.postal_code && (
                  <p className="text-red-600 text-sm mt-1 font-poppins">{validationErrors.postal_code}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.addresses?.[0]?.city || ''}
                  onChange={handleAddressChange}
                  disabled={!isEditing}
                  placeholder="e.g., Mumbai"
                  className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-500 font-playfair ${validationErrors.city ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-gray-800'
                    }`}
                />
                {validationErrors.city && (
                  <p className="text-red-600 text-sm mt-1 font-poppins">{validationErrors.city}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bio Textbox */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
            About Me
          </label>
          <textarea
            name="bio"
            value={formData.bio || ''}
            onChange={handleInputChange}
            disabled={!isEditing}
            rows={4}
            className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:border-gray-800 disabled:bg-gray-50 disabled:text-gray-500 transition-colors resize-none font-playfair ${validationErrors.bio
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-gray-800 focus:border-gray-800'
              }`}
            placeholder="Tell us about your business, your manufacturing capabilities, or your textile sourcing..."
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-md text-gray-500 font-playfair">
              Share something about your textile supply business and manufacturing capabilities.
            </p>
            <span className={`text-xs ${(formData.bio || '').length > 450 ? 'text-orange-500' : 'text-gray-400'
              } font-playfair`}>
              {(formData.bio || '').length}/500
            </span>
          </div>
          {validationErrors.bio && (
            <p className="text-red-600 text-sm mt-1">{validationErrors.bio}</p>
          )}
          <p className="text-red-600 text-sm mt-2">
            Please note: this information will appear publicly on your profile and can be viewed by buyers.
          </p>
        </div>

        {isEditing && (
          <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                setIsEditing(false);
                setValidationErrors({});
                setFormData(profile); // Reset to original data
              }}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 rounded font-poppins"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 transition-colors cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 rounded font-poppins"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

