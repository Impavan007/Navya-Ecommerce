import { baseApiService } from './base';
import { ENDPOINTS } from './config';
import type { ProfileApiResponse } from '../../types/api';

export class ProfileApiService {
  /**
   * Get user profile data
   */
  async getProfile(): Promise<ProfileApiResponse> {
    return baseApiService.get<ProfileApiResponse['data']>(ENDPOINTS.USER.PROFILE);
  }

  /**
   * Update user profile data
   */
  async updateProfile(profileData: Partial<ProfileApiResponse['data']>): Promise<ProfileApiResponse> {
    return baseApiService.put<ProfileApiResponse['data']>(ENDPOINTS.USER.UPDATE_PROFILE, profileData);
  }

  /**
   * Update user profile via multipart/form-data (name, phone, bio, address, addresses, profile_image)
   */
  async updateProfileForm(data: {
    name?: string;
    phone?: string;
    bio?: string;
    address?: string;
    addresses?: string; // JSON string if needed
    profile_image?: File;
  }): Promise<ProfileApiResponse> {
    const formData = new FormData();
    if (data.name !== undefined) formData.append('name', data.name);
    if (data.phone !== undefined) formData.append('phone', data.phone);
    if (data.bio !== undefined) formData.append('bio', data.bio);
    if (data.address !== undefined) formData.append('address', data.address);
    if (data.addresses !== undefined) formData.append('addresses', data.addresses);
    if (data.profile_image) formData.append('profileImage', data.profile_image);

    // POST to /profile as per backend contract
    return baseApiService.upload<ProfileApiResponse['data']>(ENDPOINTS.USER.PROFILE, formData);
  }
}

export const profileApiService = new ProfileApiService();
