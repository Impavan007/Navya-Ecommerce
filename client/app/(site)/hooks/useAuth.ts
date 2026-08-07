/**
 * Authentication Hooks for User Section
 * Provides React hooks for authentication operations using Zustand
 */

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApiService } from '../services/api/auth';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { useFormApi } from './useApi';
import type { User, SignInRequest, SignUpRequest } from '../types/api';

export function useAuth() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    signIn: storeSignIn,
    signOut: storeSignOut,
    setLoading,
  } = useAuthStore();

  const { setApiLoading } = useUIStore();

  const signIn = useCallback(async (data: SignInRequest) => {
    setLoading(true);
    setApiLoading(true);

    try {

      const response = await authApiService.signIn(data);
      console.log(response)
      if (response.success && response.data) {

        const apiUser = response.data.user as any;
        const isSwitchedFromApi =
          typeof apiUser?.isSwitched === 'boolean'
            ? apiUser.isSwitched
            : typeof apiUser?.is_switched === 'boolean'
              ? apiUser.is_switched
              : undefined;

        // Create a User object that matches the store interface
        const userData: User = {
          id: response.data.user.id,
          email: response.data.user.email,
          firstName: response.data.user.name.split(' ')[0] || '',
          lastName: response.data.user.name.split(' ').slice(1).join(' ') || '',
          preferences: {
            currency: 'INR',
            language: 'en',
            notifications: {
              email: true,
              sms: false,
              push: true,
              marketing: false,
              bookingUpdates: true,
              reviewReminders: true,
            },
            privacy: {
              profileVisibility: 'public',
              showInSearch: true,
              allowMessages: true,
            },
          },
          isEmailVerified: true,
          isPhoneVerified: false,
          role: (response.data.user.role.toLowerCase() === 'lender' || response.data.user.role.toLowerCase() === 'seller' ? 'seller' : response.data.user.role.toLowerCase() === 'admin' ? 'admin' : 'buyer') as 'buyer' | 'seller' | 'admin',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // include switch flag from API (for navbar use)
          switch_account: Boolean(response.data.user.switch_account),
          isSwitched: isSwitchedFromApi,
        };
        // //
        console.log('i am here')
        const frontendRole = (response.data.user.role.toLowerCase() === 'lender' || response.data.user.role.toLowerCase() === 'seller') ? 'seller' : (response.data.user.role.toLowerCase() === 'admin' ? 'admin' : 'buyer');
        storeSignIn(userData, response.data.token, frontendRole);

        // Redirect to buyer homepage by default (unless admin)
        const redirectPath = frontendRole === 'admin' ? '/admin' : '/';
        window.location.href = redirectPath;
      }

      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
      setApiLoading(false);
    }
  }, [storeSignIn, router, setLoading, setApiLoading]);

  const signUp = useCallback(async (data: SignUpRequest) => {
    setLoading(true);
    setApiLoading(true);

    try {
      const response = await authApiService.signUp(data);

      if (response.success) {
        // If email verification is required, don't auto-sign in
        if (response.data?.requiresEmailVerification) {
          // Show verification message
          return response;
        }

        // Auto sign in if no email verification required
        if (response.data?.user) {
          const signInResponse = await authApiService.signIn({
            email: data.email,
            password: data.password,
          });

          if (signInResponse.success && signInResponse.data) {
            // Create a User object that matches the store interface
            const userData: User = {
              id: signInResponse.data.user.id,
              email: signInResponse.data.user.email,
              firstName: signInResponse.data.user.name.split(' ')[0] || '',
              lastName: signInResponse.data.user.name.split(' ').slice(1).join(' ') || '',
              preferences: {
                currency: 'INR',
                language: 'en',
                notifications: {
                  email: true,
                  sms: false,
                  push: true,
                  marketing: false,
                  bookingUpdates: true,
                  reviewReminders: true,
                },
                privacy: {
                  profileVisibility: 'public',
                  showInSearch: true,
                  allowMessages: true,
                },
              },
              isEmailVerified: true,
              isPhoneVerified: false,
              role: (signInResponse.data.user.role.toLowerCase() === 'lender' || signInResponse.data.user.role.toLowerCase() === 'seller' ? 'seller' : signInResponse.data.user.role.toLowerCase() === 'admin' ? 'admin' : 'buyer') as 'buyer' | 'seller' | 'admin',
              status: 'active',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            const frontendRole = (signInResponse.data.user.role.toLowerCase() === 'lender' || signInResponse.data.user.role.toLowerCase() === 'seller') ? 'seller' : (signInResponse.data.user.role.toLowerCase() === 'admin' ? 'admin' : 'buyer');
            storeSignIn(userData, signInResponse.data.token, frontendRole);
            const redirectPath = frontendRole === 'seller' ? '/lender' : frontendRole === 'admin' ? '/admin' : '/';
            window.location.href = redirectPath;
          }
        }
      }

      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
      setApiLoading(false);
    }
  }, [storeSignIn, router, setLoading, setApiLoading]);

  const signOut = useCallback(async () => {
    setLoading(true);

    try {
      await authApiService.signOut();
      storeSignOut();
      window.location.href = '/auth/sign-in';
    } catch (error) {
      console.error('Sign out error:', error);
      // Force sign out even if API call fails
      storeSignOut();
      window.location.href = '/auth/sign-in';
    } finally {
      setLoading(false);
    }
  }, [storeSignOut, router, setLoading]);

  const sendOtp = useCallback(async (email: string, type: 'signup' | 'forgot_password' | 'login') => {
    return authApiService.sendOtp({ email, type });
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: string, type: 'signup' | 'forgot_password' | 'login') => {
    setLoading(true);
    setApiLoading(true);

    try {
      const response = await authApiService.verifyOtp({ email, otp, type });

      if (response.success && response.data) {
        if (response.data.token && response.data.user) {
          const frontendRole = (response.data.user.role.toLowerCase() === 'lender' || response.data.user.role.toLowerCase() === 'seller') ? 'seller' : (response.data.user.role.toLowerCase() === 'admin' ? 'admin' : 'buyer');
          storeSignIn(response.data.user, response.data.token, frontendRole);

          // Redirect based on OTP type and user role
          if (type === 'signup') {
            router.push('/');
          } else if (type === 'login') {
            const redirectPath =
              frontendRole === 'seller'
                ? '/lender'
                : frontendRole === 'admin'
                  ? '/admin'
                  : '/';

            window.location.href = redirectPath;
          }
        }
      }

      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
      setApiLoading(false);
    }
  }, [storeSignIn, router, setLoading, setApiLoading]);

  const requestOtp = useCallback(async (email: string) => {
    setLoading(true);
    setApiLoading(true);

    try {
      const response = await authApiService.requestOtp({ email });
      return response;
    } finally {
      setLoading(false);
      setApiLoading(false);
    }
  }, [setLoading, setApiLoading]);

  const verifyOtpForgot = useCallback(async (email: string, otp: string) => {
    setLoading(true);
    setApiLoading(true);

    try {
      const response = await authApiService.verifyOtpForgot({ email, otp });
      return response;
    } finally {
      setLoading(false);
      setApiLoading(false);
    }
  }, [setLoading, setApiLoading]);

  const resetPassword = useCallback(async (newPassword: string, confirmPassword: string, token: string) => {
    setLoading(true);
    setApiLoading(true);

    try {
      const response = await authApiService.resetPassword({
        newPassword,
        confirmPassword,
        token
      });

      if (response.success) {
        router.push('/auth/sign-in');
      }

      return response;
    } finally {
      setLoading(false);
      setApiLoading(false);
    }
  }, [router, setLoading, setApiLoading]);

  const forgotPassword = useCallback(async (email: string) => {
    return authApiService.forgotPassword({ email });
  }, []);

  return {
    user,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    sendOtp,
    verifyOtp,
    requestOtp,
    verifyOtpForgot,
    forgotPassword,
    resetPassword,
  };
}

/**
 * Hook for protected routes that require authentication
 */
export function useRequireAuth() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/sign-in');
    }
  }, [isAuthenticated, router]);

  return { isAuthenticated, user };
}

/**
 * Hook for routes that should redirect authenticated users
 */
export function useRedirectIfAuthenticated() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  return { isAuthenticated };
}
