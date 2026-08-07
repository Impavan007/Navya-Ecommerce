/**
 * Authentication Store using Zustand
 * Manages user authentication state globally
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { storeAuthToken, clearAuthData, storeUserData, getUserData, syncAuthToken } from '../utils/auth';
import { profileApiService } from '../services/api/profile';
import type { User, ProfileData } from '../types/api';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  profileData: ProfileData | null;
  isProfileLoading: boolean;
  isProfileLoaded: boolean;

  // Actions
  signIn: (user: User, token: string, role: 'buyer' | 'seller' | 'admin') => void;
  signOut: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
  fetchProfile: (force?: boolean) => Promise<void>;
  setProfileData: (data: ProfileData) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      profileData: null,
      isProfileLoading: false,
      isProfileLoaded: false,

      // Actions
      signIn: (user: User, token: string, role: 'buyer' | 'seller' | 'admin') => {
        // Store token in both cookies and localStorage
        storeAuthToken(token, role, 7);

        // Store user data in localStorage
        storeUserData(user);

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      signOut: () => {
        // Clear all authentication data
        clearAuthData();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          profileData: null,
          isProfileLoaded: false,
          isProfileLoading: false,
        });
      },

      updateUser: (updatedUser: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...updatedUser },
          });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      initialize: () => {
        // Sync tokens between cookies and localStorage
        syncAuthToken();

        // Check if user is already authenticated on app start
        const token = Cookies.get('auth_token');
        const userData = getUserData();

        if (token && !get().isAuthenticated) {
          set({
            isAuthenticated: true,
            user: userData // Set user data if available from localStorage
          });
        }
      },

      fetchProfile: async (force = false) => {
        const { isProfileLoading, isProfileLoaded, isAuthenticated } = get();

        // Don't fetch if not authenticated
        if (!isAuthenticated) return;

        // Don't fetch if already loading or already loaded (unless forced)
        // if (isProfileLoading || (isProfileLoaded && !force)) return;

        set({ isProfileLoading: true });

        try {
          const response = await profileApiService.getProfile();
          if (response.success && response.data) {
            set({
              profileData: response.data,
              isProfileLoaded: true
            });

            // Also sync basic user info to the user object
            const currentUser = get().user;
            if (currentUser) {
              set({
                user: {
                  ...currentUser,
                  profile_image: response.data.profile_image,
                  firstName: response.data.name?.split(' ')[0] || '',
                  lastName: response.data.name?.split(' ').slice(1).join(' ') || '',
                  name: response.data.name,
                } as User
              });
            }
          }
        } catch (error) {
          console.error('Error fetching profile in store:', error);
        } finally {
          set({ isProfileLoading: false });
        }
      },

      setProfileData: (data: ProfileData) => {
        set({
          profileData: data,
          isProfileLoaded: true
        });

        // Also sync basic user info from the provided data
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              profile_image: data.profile_image,
              firstName: data.name?.split(' ')[0] || '',
              lastName: data.name?.split(' ').slice(1).join(' ') || '',
              name: data.name,
            } as User
          });
        }
      },
    }),
    {
      name: 'navyaa-auth', // Key for localStorage
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        profileData: state.profileData,
        isProfileLoaded: state.isProfileLoaded,
      }),
    }
  )
);
