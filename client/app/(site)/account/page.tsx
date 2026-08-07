"use client";

import ProtectedRoute from "../components/ProtectedRoute";
import AddAddressPopup from "../components/AddAddressPopup";
import EditAddressPopup from "../components/EditAddressPopup";
import DeleteConfirmationPopup from "../components/DeleteConfirmationPopup";
import AddressMenu from "../components/AddressMenu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import Breadcrumb from "../components/Breadcrumb";
import { profileApiService } from "../services/api/profile";
import { userApiService } from "../services/api/user";
import type { ProfileData, ProfileAddress } from "../types/api";
import { getUserData, storeUserData } from "../utils/auth";
import { useAuthStore } from "../stores/authStore";

interface AddressData {
  id?: number;
  _id?: string;
  label: string;
  street_name: string;
  house_number: string;
  house_number_suffix: string;
  postal_code: string;
  city: string;
  state?: string;
  is_primary: boolean;
}

export default function AccountProfilePage() {
  const router = useRouter();
  // Profile state
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  // Remove redundant loading state as we use isStoreLoading from store
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPhoneField, setIsEditingPhoneField] = useState(false);
  const [firstNameInput, setFirstNameInput] = useState('');
  const [lastNameInput, setLastNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isDeleteAddressOpen, setIsDeleteAddressOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<number | null>(null);
  const [isDeletingAddress, setIsDeletingAddress] = useState(false);

  // Profile picture state
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [isUploadingProfilePic, setIsUploadingProfilePic] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Address management state
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isEditAddressOpen, setIsEditAddressOpen] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddressData, setEditingAddressData] = useState<AddressData | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<number | null>(null);
  const [addresses, setAddresses] = useState<(AddressData & { id: number })[]>([]);
  const {
    user: authUser,
    updateUser: updateAuthUser,
    fetchProfile,
    setProfileData: setStoreProfileData,
    profileData: storeProfileData,
    isProfileLoading: isStoreLoading
  } = useAuthStore();

  const updateStoredAuthUserName = (fullName: string) => {
    const trimmed = fullName?.trim();
    if (!trimmed) return;
    const stored = getUserData();
    if (!stored) return;
    const [first, ...rest] = trimmed.split(/\s+/);
    const updatedUser = {
      ...stored,
      firstName: first || stored.firstName,
      lastName: rest.join(' ') || stored.lastName,
      name: trimmed,
      updatedAt: new Date().toISOString(),
    };
    storeUserData(updatedUser);
  };

  // Initial Fetch
  useEffect(() => {
    // Use the centralized fetcher
    fetchProfile();
  }, [fetchProfile]);

  // Sync store data to local state when it arrives
  useEffect(() => {
    if (storeProfileData) {
      setProfileData(storeProfileData);
      setProfilePicture(storeProfileData.profile_image);
      const name = storeProfileData.name || '';
      setFirstNameInput(name.split(' ')[0] || '');
      setLastNameInput(name.split(' ').slice(1).join(' ') || '');
      setPhoneInput(storeProfileData.phone || '');
      
      // Sync addresses from store
      if (storeProfileData.addresses) {
        const transformed = storeProfileData.addresses.map((addr, index) => ({
          id: index + 1,
          _id: addr._id,
          label: addr.label,
          street_name: addr.street_name,
          house_number: addr.house_number,
          house_number_suffix: addr.house_number_suffix || '',
          postal_code: addr.postal_code,
          city: addr.city,
          state: (addr as any).state || '',
          is_primary: addr.is_primary
        }));
        setAddresses(transformed);
      }
    }
  }, [storeProfileData]);

  // Remove the redundant local fetchProfileData

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size should not exceed 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicturePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload the profile picture
    handleUploadProfilePicture(file);
  };

  const handleUploadProfilePicture = async (file: File) => {
    try {
      setIsUploadingProfilePic(true);
      const payload = {
        profile_image: file,
        name: profileData?.name || undefined,
        phone: profileData?.phone || undefined,
        address: profileData?.address || undefined,
      } as any;

      const resp = await profileApiService.updateProfileForm(payload);
      if (!resp.success) throw new Error(resp.message || 'Update failed');

      if (resp.data) {
        setStoreProfileData(resp.data);
        setProfileData(resp.data);
        setProfilePicture(resp.data.profile_image);
        setProfilePicturePreview(null);

        updateAuthUser({
          profile_image: resp.data.profile_image,
          updatedAt: new Date().toISOString(),
        });
        toast.success('Profile picture updated successfully!');
      }
    } catch (e: any) {
      console.error('Error uploading profile picture:', e);
      toast.error(e.message || 'Failed to upload profile picture');
      setProfilePicturePreview(null);
    } finally {
      setIsUploadingProfilePic(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClickUploadProfilePicture = () => {
    fileInputRef.current?.click();
  };

  const handleStartEditName = () => {
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    try {
      setIsSavingProfile(true);
      const payload = {
        name: `${firstNameInput} ${lastNameInput}`.trim(),
        // Preserve existing fields to avoid unsetting server values
        phone: profileData?.phone || undefined,
        address: profileData?.address || undefined,
      } as any;
      const resp = await profileApiService.updateProfileForm(payload);
      if (!resp.success) throw new Error(resp.message || 'Update failed');
      
      if (resp.data) {
        setProfileData(resp.data);
        // Re-render addresses from server
        const transformed = resp.data.addresses.map((addr, index) => ({
          id: index + 1,
          _id: addr._id,
          label: addr.label,
          street_name: addr.street_name,
          house_number: addr.house_number,
          house_number_suffix: addr.house_number_suffix || '',
          postal_code: addr.postal_code,
          city: addr.city,
          state: (addr as any).state || '',
          is_primary: addr.is_primary
        }));
        setAddresses(transformed);
        setIsEditingName(false);
        updateStoredAuthUserName(payload.name);
        const [first, ...rest] = payload.name.split(/\s+/).filter(Boolean);
        updateAuthUser({
          firstName: first || '',
          lastName: rest.join(' ') || '',
          updatedAt: new Date().toISOString(),
        });
        toast.success(resp.message || 'Profile updated');
      }
    } catch (e) {
      toast.error('Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleStartEditPhone = () => {
    setIsEditingPhoneField(true);
  };

  const handleSavePhone = async () => {
    try {
      setIsSavingProfile(true);
      const payload = {
        phone: phoneInput,
        name: profileData?.name || undefined,
        address: profileData?.address || undefined,
      } as any;
      const resp = await profileApiService.updateProfileForm(payload);
      if (!resp.success) throw new Error(resp.message || 'Update failed');
      
      if (resp.data) {
        setProfileData(resp.data);
        setIsEditingPhoneField(false);
        toast.success(resp.message || 'Profile updated');
      }
    } catch (e) {
      toast.error('Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddAddress = () => {
    setIsAddAddressOpen(true);
  };

  const handleCloseAddAddress = () => {
    setIsAddAddressOpen(false);
  };

  const handleSaveAddress = async (addressData: AddressData) => {
    setIsSavingAddress(true);

    try {
      const payload = {
        label: addressData.label,
        street_name: addressData.street_name,
        house_number: addressData.house_number,
        house_number_suffix: addressData.house_number_suffix,
        postal_code: addressData.postal_code,
        city: addressData.city,
        state: addressData.state,
        is_primary: addressData.is_primary,
      };

      const resp = await userApiService.addRenterAddress(payload);

      if (!resp.success) {
        throw new Error(resp.message || 'Failed to add address');
      }

      // Transform API addresses back to local AddressData[]
      const transformed = resp.data.addresses.map((addr, index) => ({
        id: index + 1,
        _id: addr._id,
        label: addr.label,
        street_name: addr.street_name,
        house_number: addr.house_number,
        house_number_suffix: addr.house_number_suffix || '',
        postal_code: addr.postal_code,
        city: addr.city,
        state: (addr as any).state || '',
        is_primary: addr.is_primary
      }));

      setAddresses(transformed);
      toast.success(resp.message || 'Address added successfully!');
      setIsAddAddressOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add address';
      toast.error(errorMessage);
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Menu handlers
  const handleMenuClick = (addressId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    // Close any other open menu first
    if (isMenuOpen !== addressId) {
      setIsMenuOpen(addressId);
    } else {
      setIsMenuOpen(null);
    }
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(null);
  };

  const handleEditAddress = (addressId: number) => {
    const address = addresses.find(addr => addr.id === addressId);
    if (address) {
      setEditingAddressData(address);
      setIsEditAddressOpen(true);
    }
  };

  const handleDeleteAddress = (addressId: number) => {
    setAddressToDelete(addressId);
    setIsDeleteAddressOpen(true);
  };

  const handleConfirmDeleteAddress = async () => {
    if (addressToDelete === null) return;

    const toDelete = addresses.find(a => a.id === addressToDelete);
    const apiId = toDelete?._id;
    if (!apiId) {
      toast.error('Missing address id for delete');
      setIsDeleteAddressOpen(false);
      return;
    }

    try {
      setIsDeletingAddress(true);
      const resp = await userApiService.deleteRenterAddress(apiId);
      if (!resp.success) {
        throw new Error(resp.message || 'Failed to delete address');
      }

      const transformed = resp.data.addresses.map((addr, index) => ({
        id: index + 1,
        _id: addr._id,
        label: addr.label,
        street_name: addr.street_name,
        house_number: addr.house_number,
        house_number_suffix: addr.house_number_suffix || '',
        postal_code: addr.postal_code,
        city: addr.city,
        state: (addr as any).state || '',
        is_primary: addr.is_primary
      }));

      setAddresses(transformed);
      toast.success(resp.message || 'Address deleted successfully!');
    } catch (e) {
      toast.error('Failed to delete address. Please try again.');
    } finally {
      setIsDeletingAddress(false);
      setIsDeleteAddressOpen(false);
      setAddressToDelete(null);
    }
  };

  const handleSaveEditAddress = async (addressData: AddressData) => {
    setIsEditingAddress(true);

    try {
      const current = addresses.find(a => a.id === addressData.id);
      const apiId = current?._id || addressData._id || editingAddressData?._id;
      if (!apiId) {
        throw new Error('Missing address id for update');
      }

      const payload = {
        label: addressData.label,
        street_name: addressData.street_name,
        house_number: addressData.house_number,
        house_number_suffix: addressData.house_number_suffix,
        postal_code: addressData.postal_code,
        city: addressData.city,
        state: addressData.state,
        is_primary: addressData.is_primary,
      };

      const resp = await userApiService.updateRenterAddress(apiId, payload);
      if (!resp.success) {
        throw new Error(resp.message || 'Failed to update address');
      }

      const transformed = resp.data.addresses.map((addr, index) => ({
        id: index + 1,
        _id: addr._id,
        label: addr.label,
        street_name: addr.street_name,
        house_number: addr.house_number,
        house_number_suffix: addr.house_number_suffix || '',
        postal_code: addr.postal_code,
        city: addr.city,
        state: (addr as any).state || '',
        is_primary: addr.is_primary
      }));

      setAddresses(transformed);
      toast.success(resp.message || 'Address updated successfully!');

      // Close popup
      setIsEditAddressOpen(false);
      setEditingAddressData(null);
    } catch (error) {
      toast.error('Failed to update address. Please try again.');
    } finally {
      setIsEditingAddress(false);
    }
  };

  const handleCloseEditAddress = () => {
    setIsEditAddressOpen(false);
    setEditingAddressData(null);
  };

  const openDeleteModal = () => setIsDeleteOpen(true);
  const closeDeleteModal = () => setIsDeleteOpen(false);

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      const resp = await userApiService.deleteAccountNow();
      if (!resp.success) throw new Error('Delete failed');
      toast.success('Account deleted successfully');
      // Redirect to home (or sign-in) after a short delay
      setTimeout(() => {
        router.push('/');
      }, 800);
    } catch (e) {
      toast.error('Failed to delete account');
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  const openDeactivateModal = () => setIsDeactivateOpen(true);
  const closeDeactivateModal = () => setIsDeactivateOpen(false);

  const handleConfirmDeactivate = async () => {
    try {
      setIsChangingStatus(true);
      const resp = await userApiService.changeAccountStatus(profileData?.status === 'Active' ? 'Deactivate' : 'Activate');
      if (!resp.success) throw new Error('Failed to change status');
      toast.success(profileData?.status === 'Active' ? 'Account deactivated' : 'Account activated');
      if (resp.data) {
        setProfileData(prev => prev ? { ...prev, status: resp.data!.status } : null);
        // Refresh full profile in store to ensure consistency
        fetchProfile(true);
      }
      setIsDeactivateOpen(false);
    } catch (e) {
      toast.error('Failed to change status');
    } finally {
      setIsChangingStatus(false);
    }
  };
  return (
    <ProtectedRoute
      fallback={
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Sign in to access your account</h2>
          <p className="text-white/80">Please sign in to view and manage your profile.</p>
        </div>
      }
    >
      <div className="min-h-screen bg-[#FAF6F3]">

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "My account" },
            { label: "My Profile" }
          ]}
        />

        {/* Content */}
        <main className=" mx-auto px-[20px] md:px-10 grid grid-cols-1 gap-[28px] mt-5 pb-10">
          <section className="w-full">
            <div className="flex items-end gap-[24px] mb-[12px] h-auto md:h-[24px]">
              <p className="font-['Poppins'] text-[16px] font-medium leading-[24px] text-black capitalize m-0">Profile Picture</p>
            </div>

            {isStoreLoading ? (
              <div className="flex items-center gap-[28px]">
                <div className="w-[120px] h-[120px] bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-[44px] w-[150px] bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-[28px]">
                {/* Profile Picture Display */}
                <div className="relative w-[120px] h-[120px] rounded-full overflow-hidden border-2 border-[#e1dac8] bg-[#f5f5f5] flex items-center justify-center">
                  {profilePicturePreview ? (
                    <img src={profilePicturePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                  ) : profilePicture ? (
                    <img src={profilePicture} alt="Profile Picture" className="w-full h-full object-cover" />
                  ) : (
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#ccc]">
                      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M 4 20 Q 4 14 12 14 Q 20 14 20 20" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                  )}
                  {isUploadingProfilePic && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <div className="flex flex-col gap-[8px] items-center sm:items-start text-center sm:text-left">
                  <button
                    onClick={handleClickUploadProfilePicture}
                    disabled={isUploadingProfilePic}
                    className="bg-[#F3D6DC] px-[16px] py-[12px] disabled:opacity-60 hover:bg-[#ebbdc5] transition-colors"
                  >
                    <p className="font-['Poppins'] font-medium text-[14px] leading-[20px] text-black m-0 whitespace-nowrap">
                      {isUploadingProfilePic ? 'Uploading...' : 'Change Picture'}
                    </p>
                  </button>
                  <p className="font-['Poppins'] text-[12px] leading-[16px] text-[#8a8a8a] m-0">
                    JPG, PNG, GIF or WebP. Max 5MB.
                  </p>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
              </div>
            )}
          </section>

          {/* Personal Information */}
          <section className="w-full h-auto flex flex-col gap-[12px]">
            <div className="flex items-end gap-[24px] h-auto md:h-[24px]">
              <p className="font-['Poppins'] font-medium text-[16px] leading-[24px] text-black capitalize m-0">Personal information</p>
              {!isEditingName && (
                <button onClick={handleStartEditName} className="font-['Poppins'] font-medium text-[15px] leading-[22px] text-[#6d6d6d] underline decoration-line">Edit</button>
              )}
            </div>

            {isStoreLoading ? (
              <div className="flex items-center gap-[28px]">
                <div className="w-[402px]">
                  <div className="border-b border-[#6d6d6d] py-[12px] flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  </div>
                </div>
                <div className="w-[402px]">
                  <div className="border-b border-[#6d6d6d] py-[12px] flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  </div>
                </div>
                <div className="h-[44px] flex items-center">
                  <div className="bg-[rgba(205,198,182,0.59)] px-[16px] py-[12px]">
                    <p className="font-['Poppins'] text-[14px] leading-[20px] text-[#a8a8a8] m-0">Save</p>
                  </div>
                </div>
              </div>
            ) : profileError ? (
              <div className="text-red-500 py-4">
                <p className="font-['Poppins'] text-[14px] leading-[20px]">{profileError}</p>
                <button
                  onClick={() => fetchProfile(true)}
                  className="mt-2 text-blue-500 underline font- poppins text-[14px]"
                  disabled={isStoreLoading}
                >
                  {isStoreLoading ? "Refreshing..." : "Try again"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center gap-[28px] h-auto md:h-[56px] self-stretch">
                {/* First name */}
                <div className="w-full md:w-[402px] h-[48px]">
                  <div className="border-b-[0.7px] border-[#6d6d6d] py-[12px] h-full flex items-center justify-between box-sizing-border-box">
                    {isEditingName ? (
                      <input value={firstNameInput} onChange={(e) => setFirstNameInput(e.target.value)} className="bg-transparent outline-none font-['Poppins'] font-normal text-[16px] leading-[24px] text-[#3D1126] w-full" placeholder="Enter your First name" />
                    ) : (
                      <p className="font-['Poppins'] font-normal text-[16px] leading-[24px] text-[#8a8a8a] m-0">{profileData?.name.split(' ')[0] || 'N/A'}</p>
                    )}
                  </div>
                </div>
                {/* Last name */}
                <div className="w-full md:w-[402px] h-[48px]">
                  <div className="border-b-[0.7px] border-[#6d6d6d] py-[12px] h-full flex items-center justify-between box-sizing-border-box">
                    {isEditingName ? (
                      <input value={lastNameInput} onChange={(e) => setLastNameInput(e.target.value)} className="bg-transparent outline-none font-['Poppins'] font-normal text-[16px] leading-[24px] text-[#3D1126] w-full" placeholder="Enter your Last name" />
                    ) : (
                      <p className="font-['Poppins'] font-normal text-[16px] leading-[24px] text-[#8a8a8a] m-0">{profileData?.name.split(' ').slice(1).join(' ') || 'N/A'}</p>
                    )}
                  </div>
                </div>
                {/* Save */}
                <div className="h-[56px] flex items-center self-stretch w-full md:w-auto">
                  {isEditingName ? (
                    <button onClick={handleSaveName} disabled={isSavingProfile} className="bg-[#F3D6DC] w-[80px] h-[56px] flex items-center justify-center gap-[10px] rounded-[8px] px-[20px] py-[16px] disabled:opacity-60 hover:bg-[#ebbdc5] transition-colors">
                      <p className="font-['Poppins'] font-medium text-[16px] leading-[24px] text-[#3D1126] m-0 capitalize">Save</p>
                    </button>
                  ) : (
                    <div className="bg-[#F3D6DC]/40 w-full md:w-[80px] h-[56px] flex items-center justify-center gap-[10px] rounded-[8px] px-[20px] py-[16px]">
                      <p className="font-['Poppins'] font-medium text-[16px] leading-[24px] text-[#3D1126]/40 m-0 capitalize">Save</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Email Address */}
          <section className="w-full h-auto flex flex-col gap-[12px]">
            <div className="flex items-end gap-[24px] h-auto md:h-[24px]">
              <p className="font-['Poppins'] font-medium text-[16px] leading-[24px] text-black capitalize m-0">Email Address</p>
              {/* <button className="font-['Poppins'] font-medium text-[15px] leading-[22px] text-[#6d6d6d] underline decoration-line">Edit</button> */}
            </div>

            {isStoreLoading ? (
              <div className="flex items-center gap-[28px]">
                <div className="w-[402px]">
                  <div className="border-b border-[#6d6d6d] py-[12px] flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                  </div>
                </div>
                <div className="h-[44px] flex items-center">
                  <div className="bg-[rgba(205,198,182,0.59)] px-[16px] py-[12px]">
                    <p className="font-['Poppins'] text-[14px] leading-[20px] text-[#a8a8a8] m-0">Save</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-[28px] h-[56px] self-stretch">
                <div className="w-[402px] h-[48px]">
                  <div className="border-b-[0.7px] border-[#6d6d6d] py-[12px] h-full flex items-center justify-between box-sizing-border-box">
                    <p className="font-['Poppins'] font-normal text-[16px] leading-[24px] text-[#8a8a8a] m-0">
                      {profileData?.email || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="h-[56px] flex items-center self-stretch w-full md:w-auto">
                  <div className="bg-[#F3D6DC] w-full md:w-[80px] h-[56px] flex items-center justify-center gap-[10px] rounded-[8px] px-[20px] py-[16px]">
                    <p className="font-['Poppins'] font-medium text-[16px] leading-[24px] text-[#A8A8A8] m-0 capitalize">Save</p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Mobile Number */}
          <section className="w-full h-auto flex flex-col gap-[12px]">
            <div className="flex items-end gap-[24px] h-auto md:h-[24px]">
              <p className="font-['Poppins'] font-medium text-[16px] leading-[24px] text-black capitalize m-0">Mobile Number</p>
              {!isEditingPhoneField && (
                <button onClick={handleStartEditPhone} className="font-['Poppins'] font-medium text-[15px] leading-[22px] text-[#6d6d6d] underline decoration-line">Edit</button>
              )}
            </div>

            {isStoreLoading ? (
              <div className="flex items-center gap-[28px]">
                <div className="w-[402px]">
                  <div className="border-b border-[#6d6d6d] py-[12px] flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-28"></div>
                  </div>
                </div>
                <div className="h-[44px] flex items-center">
                  <div className="bg-[rgba(205,198,182,0.59)] px-[16px] py-[12px]">
                    <p className="font-['Poppins'] text-[14px] leading-[20px] text-[#a8a8a8] m-0">Save</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-[28px] h-[56px] self-stretch">
                <div className="w-[402px] h-[48px]">
                  <div className="border-b-[0.7px] border-[#6d6d6d] py-[12px] h-full flex items-center justify-between box-sizing-border-box">
                    {isEditingPhoneField ? (
                      <input value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} className="bg-transparent outline-none font-['Poppins'] font-normal text-[16px] leading-[24px] text-[#3D1126] w-full" placeholder="+91 98765 43210" />
                    ) : (
                      <p className="font-['Poppins'] font-normal text-[16px] leading-[24px] text-[#8a8a8a] m-0">{profileData?.phone || 'Not provided'}</p>
                    )}
                  </div>
                </div>
                <div className="h-[56px] flex items-center self-stretch w-full md:w-auto">
                  {isEditingPhoneField ? (
                    <button onClick={handleSavePhone} disabled={isSavingProfile} className="bg-[#F3D6DC] w-full md:w-[80px] h-[56px] flex items-center justify-center gap-[10px] rounded-[8px] px-[20px] py-[16px] disabled:opacity-60 hover:bg-[#ebbdc5] transition-colors">
                      <p className="font-['Poppins'] font-medium text-[16px] leading-[24px] text-[#3D1126] m-0 capitalize">Save</p>
                    </button>
                  ) : (
                    <div className="bg-[#F3D6DC] w-full md:w-[80px] h-[56px] flex items-center justify-center gap-[10px] rounded-[8px] px-[20px] py-[16px]">
                      <p className="font-['Poppins'] font-medium text-[16px] leading-[24px] text-[#A8A8A8] m-0 capitalize">Save</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Manage Addresses */}
          <section className="w-full max-w-[940px] flex flex-col gap-[12px]">
            <p className="font-['Poppins'] font-medium text-[16px] leading-[24px] text-black capitalize m-0">Manage Addresses</p>

            {/* Add new address button */}
            <button
              onClick={handleAddAddress}
              className="flex items-center gap-[8px] bg-transparent border border-[#3D1126] rounded-[8px] w-full h-[44px] pl-[12px] pr-[16px] py-[12px] hover:bg-[#1A1A1A]/5 transition-colors cursor-pointer box-sizing-border-box"
            >
              <div className="w-[20px] h-[20px] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="#323232" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="font-['Poppins'] font-medium text-[14px] leading-[20px] text-[#3D1126] m-0">Add new address</p>
            </button>

            {/* Address cards */}
            {isStoreLoading ? (
              <div className="flex flex-col gap-[8px]">
                {[1, 2, 3].map((idx) => (
                  <div key={idx} className="border border-[#a8a8a8] px-[24px] py-[20px] w-full">
                    <div className="flex items-center justify-between mb-[9px]">
                      <div className="bg-gray-200 h-6 w-16 rounded animate-pulse"></div>
                      <div className="w-[28px] h-[28px] bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="flex items-center gap-[10px] mb-[2px]">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="font-['Poppins'] text-[16px] leading-[24px]">No addresses found</p>
                <p className="font-['Poppins'] text-[14px] leading-[20px] mt-2">Add your first address using the button above</p>
              </div>
            ) : (
              <div className="flex flex-col gap-[8px] w-full self-stretch">
                {addresses.map((address) => (
                  <div key={address.id} className="border border-[#a8a8a8] px-[24px] py-[20px] w-full min-h-[160px] flex flex-col gap-[8px] box-sizing-border-box relative">
                    <div className="flex items-center justify-between h-[40px] w-full self-stretch">
                      <div className="bg-[#F3D6DC] rounded-[8px] w-[74px] h-[40px] flex items-center justify-center gap-[10px] px-[20px] py-[8px]">
                        <p className="font-['Poppins'] font-medium text-[16px] leading-[24px] text-[#6d6d6d] m-0 capitalize">
                          {address.label}
                        </p>
                      </div>
                      <div className="relative">
                        <button
                          onClick={(e) => handleMenuClick(address.id, e)}
                          className="w-[28px] h-[28px] flex items-center justify-center hover:bg-gray-100 rounded cursor-pointer"
                        >
                          {/* qlementine-icons:menu-dots-16 icon placeholder */}
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="1.5" fill="black" />
                            <circle cx="12" cy="7" r="1.5" fill="black" />
                            <circle cx="12" cy="17" r="1.5" fill="black" />
                          </svg>
                        </button>

                        {/* Address Menu */}
                        {isMenuOpen === address.id && (
                          <AddressMenu
                            isOpen={true}
                            onClose={handleCloseMenu}
                            onEdit={() => handleEditAddress(address.id)}
                            onDelete={() => handleDeleteAddress(address.id)}
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-[10px] h-[20px]">
                      <p className="font-['Poppins'] font-medium text-[14px] leading-[20px] text-black m-0">{profileData?.name || 'Mary Peter Whitehead'}</p>
                      <p className="font-['Poppins'] font-medium text-[14px] leading-[20px] text-black m-0">{profileData?.phone || '+91 98765 43210'}</p>
                    </div>

                    <div className="flex flex-col gap-[2px] h-[42px] self-stretch">
                      <p className="font-['Poppins'] font-normal text-[14px] leading-[20px] text-[#6d6d6d] m-0">
                        {address.house_number}{address.house_number_suffix ? `, ${address.house_number_suffix}` : ''}, {address.street_name}
                      </p>
                      <p className="font-['Poppins'] font-normal text-[14px] leading-[20px] text-[#6d6d6d] m-0">
                        {address.city?.toUpperCase()}{address.state ? ` — ${address.state}` : ''} — {address.postal_code}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Danger actions */}
          <div className="flex items-center gap-[20px] justify-end pt-[8px] pb-[24px] ">
            <button onClick={openDeleteModal} className="bg-[#e32f2b] text-white px-[16px] py-[12px] font-['Poppins'] rounded-md text-[14px] leading-[20px]">Delete Account</button>
            <button onClick={openDeactivateModal} className="border border-[#3D1126] px-[16px] py-[12px] font-['Poppins'] rounded-md text-[14px] leading-[20px] text-[#3D1126] ">{profileData?.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}</button>
          </div>
        </main>


        {/* Add Address Popup */}
        <AddAddressPopup
          isOpen={isAddAddressOpen}
          onClose={handleCloseAddAddress}
          onSave={handleSaveAddress}
          isLoading={isSavingAddress}
        />

        {/* Edit Address Popup */}
        {editingAddressData && (
          <EditAddressPopup
            isOpen={isEditAddressOpen}
            onClose={handleCloseEditAddress}
            onSave={handleSaveEditAddress}
            addressData={editingAddressData as AddressData & { id: number }}
            isLoading={isEditingAddress}
          />
        )}


        {/* Delete Account Modal */}
        <DeleteConfirmationPopup
          isOpen={isDeleteOpen}
          onClose={closeDeleteModal}
          onConfirm={handleConfirmDelete}
          isLoading={isDeleting}
          context="account_delete"
        />

        {/* Deactivate Account Modal */}
        <DeleteConfirmationPopup
          isOpen={isDeactivateOpen}
          onClose={closeDeactivateModal}
          onConfirm={handleConfirmDeactivate}
          isLoading={isChangingStatus}
          context={profileData?.status === 'Active' ? "account_deactivate" : "account_activate"}
        />

        {/* Delete Address Modal */}
        <DeleteConfirmationPopup
          isOpen={isDeleteAddressOpen}
          onClose={() => {
            setIsDeleteAddressOpen(false);
            setAddressToDelete(null);
          }}
          onConfirm={handleConfirmDeleteAddress}
          isLoading={isDeletingAddress}
          context="address"
        />
      </div>
    </ProtectedRoute>
  );
}


