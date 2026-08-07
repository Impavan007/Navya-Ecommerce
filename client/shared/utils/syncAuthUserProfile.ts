'use client';

import { useAuthStore } from '@/app/(site)/stores/authStore';
import { getUserData, storeUserData } from '@/app/(site)/utils/auth';

interface SyncAuthPayload {
  fullName?: string | null;
  phone?: string | null;
  avatar?: string | null;
}

/**
 * Sync the cached navyaa-auth state and auth_user payload after profile updates.
 */
export function syncAuthUserProfile({ fullName, phone, avatar }: SyncAuthPayload) {
  const trimmedName = fullName?.trim();
  const updates: any = {};

  if (trimmedName) {
    const [first, ...rest] = trimmedName.split(/\s+/);
    updates.firstName = first || '';
    updates.lastName = rest.join(' ');
    updates.name = trimmedName;
  }

  if (typeof phone === 'string') {
    updates.phoneNumber = phone;
  }

  if (typeof avatar === 'string' && avatar.length > 0) {
    updates.avatar = avatar;
  }

  if (Object.keys(updates).length === 0) {
    return;
  }

  updates.updatedAt = new Date().toISOString();

  const authStore = useAuthStore.getState();
  authStore.updateUser(updates);

  const stored = getUserData();
  if (stored) {
    storeUserData({
      ...stored,
      ...updates,
    });
  }
}
