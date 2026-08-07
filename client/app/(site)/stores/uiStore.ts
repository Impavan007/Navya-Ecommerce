/**
 * UI Store using Zustand
 * Manages global UI state like loading, notifications, modals
 */

import { create } from 'zustand';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  timestamp: number;
}

interface UIState {
  // Global loading states
  isPageLoading: boolean;
  isApiLoading: boolean;

  // Navigation
  currentPath: string;
  previousPath: string;

  // Modals
  activeModal: string | null;
  modalData: Record<string, any>;

  // Notifications
  notifications: Notification[];

  // Search
  searchQuery: string;
  isSearchOpen: boolean;

  // Mobile menu
  isMobileMenuOpen: boolean;

  // Waitlist / Auth modal
  isWaitlistModalOpen: boolean;

  // Actions
  setPageLoading: (loading: boolean) => void;
  setApiLoading: (loading: boolean) => void;
  setCurrentPath: (path: string) => void;
  setPreviousPath: (path: string) => void;

  // Modal actions
  openModal: (modalName: string, data?: Record<string, any>) => void;
  closeModal: () => void;
  updateModalData: (data: Record<string, any>) => void;

  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Search actions
  setSearchQuery: (query: string) => void;
  setSearchOpen: (open: boolean) => void;
  clearSearch: () => void;

  // Mobile menu actions
  setMobileMenuOpen: (open: boolean) => void;

  // Waitlist / Auth modal actions
  setWaitlistModalOpen: (open: boolean) => void;

  // Utility actions
  reset: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  isPageLoading: false,
  isApiLoading: false,
  currentPath: '/',
  previousPath: '/',
  activeModal: null,
  modalData: {},
  notifications: [],
  searchQuery: '',
  isSearchOpen: false,
  isMobileMenuOpen: false,
  isWaitlistModalOpen: false,

  // Actions
  setPageLoading: (loading: boolean) => {
    set({ isPageLoading: loading });
  },

  setApiLoading: (loading: boolean) => {
    set({ isApiLoading: loading });
  },

  setCurrentPath: (path: string) => {
    set((state) => ({
      previousPath: state.currentPath,
      currentPath: path,
    }));
  },

  setPreviousPath: (path: string) => {
    set({ previousPath: path });
  },

  // Modal actions
  openModal: (modalName: string, data = {}) => {
    set({
      activeModal: modalName,
      modalData: data,
    });
  },

  closeModal: () => {
    set({
      activeModal: null,
      modalData: {},
    });
  },

  updateModalData: (data: Record<string, any>) => {
    set((state) => ({
      modalData: { ...state.modalData, ...data },
    }));
  },

  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
    };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-remove notification after duration
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, notification.duration);
    }
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  // Search actions
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setSearchOpen: (open: boolean) => {
    set({ isSearchOpen: open });
  },

  clearSearch: () => {
    set({
      searchQuery: '',
      isSearchOpen: false,
    });
  },

  // Mobile menu actions
  setMobileMenuOpen: (open: boolean) => {
    set({ isMobileMenuOpen: open });
  },

  // Waitlist / Auth modal actions
  setWaitlistModalOpen: (open: boolean) => {
    set({ isWaitlistModalOpen: open });
  },

  // Utility actions
  reset: () => {
    set({
      isPageLoading: false,
      isApiLoading: false,
      activeModal: null,
      modalData: {},
      notifications: [],
      searchQuery: '',
      isSearchOpen: false,
      isMobileMenuOpen: false,
      isWaitlistModalOpen: false,
    });
  },
}));

// Helper hooks for common UI patterns
export const useNotifications = () => {
  const { notifications, addNotification, removeNotification, clearNotifications } = useUIStore();

  const showSuccess = (title: string, message?: string, duration = 3000) => {
    addNotification({ type: 'success', title, message, duration });
  };

  const showError = (title: string, message?: string, duration = 5000) => {
    addNotification({ type: 'error', title, message, duration });
  };

  const showWarning = (title: string, message?: string, duration = 4000) => {
    addNotification({ type: 'warning', title, message, duration });
  };

  const showInfo = (title: string, message?: string, duration = 3000) => {
    addNotification({ type: 'info', title, message, duration });
  };

  return {
    notifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearNotifications,
  };
};

export const useModal = () => {
  const { activeModal, modalData, openModal, closeModal, updateModalData } = useUIStore();

  return {
    activeModal,
    modalData,
    openModal,
    closeModal,
    updateModalData,
    isOpen: (modalName: string) => activeModal === modalName,
  };
};

export const useLoading = () => {
  const { isPageLoading, isApiLoading, setPageLoading, setApiLoading } = useUIStore();

  return {
    isPageLoading,
    isApiLoading,
    isLoading: isPageLoading || isApiLoading,
    setPageLoading,
    setApiLoading,
  };
};
