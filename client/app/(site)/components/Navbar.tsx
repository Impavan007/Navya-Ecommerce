"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useAuthStore } from "../stores/authStore";
import { useNotifications } from "../hooks/useNotifications";
import { categoriesApiService } from "../services/api/categories";
import { productsApiService } from "../services/api/products";
import { authApiService } from "../services/api/auth";
import { useUIStore } from "../stores/uiStore";
import { useWaitlistPopup } from "../hooks/useWaitlistPopup";
import { useSettings } from "../hooks/useSettings";
import { ShimmerWrapper, ShimmerText } from "./Shimmer";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-hot-toast";
import NotificationModal from "./NotificationModal";
import BecomeLenderModal from "./BecomeLenderModal";
import {
  MenuIcon,
  CloseIcon,
  SearchIcon,
  AccountIcon,
  NotificationIcon,
  CartIcon,
  SupportIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  WishlistIcon,
  BookingsIcon,
  ChevronRightIcon,
  BecomealenderbuttonIcon,
  CloseIconnavbar
} from "../icons/icons";
import PrimaryButton from "./PrimaryButton";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { settings } = useSettings();

  // Top-level state
  const [hasMounted, setHasMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  // UI state
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isOccasionDropdownOpen, setIsOccasionDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileOccasionOpen, setIsMobileOccasionOpen] = useState(false);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const occasionRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Categories state
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [subcatCache, setSubcatCache] = useState<Record<string, { _id: string; name: string }[]>>({});
  const [subcatLoadingId, setSubcatLoadingId] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{ type: string; value: string; display: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Auth & Account state
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);
  const [localUserData, setLocalUserData] = useState<any>(null);
  const [isBecomeLenderOpen, setIsBecomeLenderOpen] = useState(false);
  const [isLocalAuth, setIsLocalAuth] = useState(false);

  // Responsive breakpoints effect
  useEffect(() => {
    if (!hasMounted) return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [hasMounted]);

  // Authentication state
  const {
    user: authUser,
    isAuthenticated: authAuthenticated,
    signOut,
  } = useAuth();
  const { openPopup } = useWaitlistPopup();
  const storeSignIn = useAuthStore((state) => state.signIn);
  const updateUser = useAuthStore((state) => state.updateUser);



  // Set mounted state
  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    // Only lock scroll if menu is open AND we are on a mobile/tablet device (width < 1024px)
    if (isMobileMenuOpen && windowWidth < 1024) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    };
  }, [isMobileMenuOpen, windowWidth]);

  // Handle mobile menu close when signup modal opens
  const isWaitlistModalOpen = useUIStore((state) => state.isWaitlistModalOpen);
  useEffect(() => {
    if (isWaitlistModalOpen) {
      setIsMobileMenuOpen(false);
      setIsProfilePopupOpen(false);
    }
  }, [isWaitlistModalOpen]);

  // Check for localStorage auth on component mount
  useEffect(() => {
    if (!hasMounted) return;

    const checkLocalAuth = () => {
      try {
        // Check if we have auth data in localStorage
        const token = localStorage.getItem("auth_token");
        const name = localStorage.getItem("user_name") || "";
        const email = localStorage.getItem("user_email") || "";

        const isLocal = !!(token && (name || email));
        setIsLocalAuth(isLocal);

        if (isLocal && (!authUser || !authAuthenticated)) {
          const role = localStorage.getItem("role") || "user";
          const switchAccount =
            localStorage.getItem("switch_account") === "true";
          const isSwitched = localStorage.getItem("isSwitched") === "true";

          // Parse name into first and last name
          const nameParts = name.split(" ");
          const firstName = nameParts[0] || "";
          const lastName = nameParts.slice(1).join(" ") || "";

          const userFromLocalStorage = {
            id: "", // Not available in localStorage
            email,
            firstName,
            lastName,
            name,
            role: (role.toLowerCase() === 'lender' || role.toLowerCase() === 'seller' ? 'seller' : role.toLowerCase() === 'admin' ? 'admin' : 'buyer') as "buyer" | "seller" | "admin",
            switch_account: switchAccount,
            isSwitched,
            is_switched: isSwitched,
            preferences: {
              currency: "INR",
              language: "en",
              notifications: {
                email: true,
                sms: false,
                push: true,
                marketing: false,
                bookingUpdates: true,
                reviewReminders: true,
              },
              privacy: {
                profileVisibility: "public" as "public" | "friends" | "private",
                showInSearch: true,
                allowMessages: true,
              },
            },
            isEmailVerified: true,
            isPhoneVerified: false,
            status: "active" as "active" | "suspended" | "deactivated",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          setLocalUserData(userFromLocalStorage);

          // Also update the auth store if it's empty
          const currentState = useAuthStore.getState();
          if (!currentState.user) {
            storeSignIn(userFromLocalStorage, token!, role as any);
          }
        }
      } catch (error) {
        console.error("Error checking local auth:", error);
      }
    };

    checkLocalAuth();

    // Check auth status periodically to catch Google OAuth redirects
    const interval = setInterval(checkLocalAuth, 1000);
    return () => clearInterval(interval);
  }, [authUser, authAuthenticated, storeSignIn, hasMounted]);

  // Combine auth sources
  const user = authUser || localUserData;
  const isAuthenticated = authAuthenticated || isLocalAuth;

  // Notifications
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    loadingMore,
    hasMore,
    fetchNotifications,
    loadMore,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // Handle logout for both auth methods
  const handleLogout = () => {
    // Clear Zustand auth
    signOut();

    // Clear localStorage if available
    if (hasMounted) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_name");
      localStorage.removeItem("role");
      localStorage.removeItem("switch_account");
      localStorage.removeItem("isSwitched");

      // Clear cookies
      document.cookie =
        "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie =
        "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie =
        "user_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie =
        "user_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }

    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
    setLocalUserData(null);
    setIsLocalAuth(false);

    toast.success("Logged out successfully");
    router.push("/");
  };

  const handleSwitchAccount = async () => {
    if (!isAuthenticated) return;

    try {
      setIsSwitchingAccount(true);

      // Save current auth token before calling API
      const currentToken =
        hasMounted ? localStorage.getItem("auth_token") : null;

      const response = await authApiService.switchAccount();
      const status = (response as any)?.status;
      if (status !== undefined && status !== 201) {
        toast.error(response.message || "Failed to switch account");
        return;
      }

      if (response.success && response.data) {
        const apiUser = response.data.user;
        const roleFromApi = apiUser.role;
        const roleForCookie =
          roleFromApi === "Lender" || roleFromApi === "admin"
            ? roleFromApi
            : "user";
        const normalizedRole =
          typeof roleFromApi === "string" ? roleFromApi.toLowerCase() : "user";

        // Get actual switch status from API
        const isSwitchedFromApi =
          typeof apiUser?.isSwitched === "boolean"
            ? apiUser.isSwitched
            : typeof apiUser?.is_switched === "boolean"
              ? apiUser.is_switched
              : apiUser?.isswithced || false;

        // Use actual API data instead of hardcoded values
        const userData: any = {
          id: apiUser.id || apiUser._id || "",
          email: apiUser.email || "",
          firstName: apiUser.firstName || apiUser.name?.split(" ")[0] || "",
          lastName:
            apiUser.lastName ||
            apiUser.name?.split(" ").slice(1).join(" ") ||
            "",
          name:
            apiUser.name ||
            `${apiUser.firstName || ""} ${apiUser.lastName || ""}`.trim(),
          preferences: apiUser.preferences || {
            currency: "INR",
            language: "en",
            notifications: {
              email: true,
              sms: false,
              push: true,
              marketing: false,
              bookingUpdates: true,
              reviewReminders: true,
            },
            privacy: {
              profileVisibility: "public",
              showInSearch: true,
              allowMessages: true,
            },
          },
          isEmailVerified:
            apiUser.isEmailVerified || apiUser.emailVerified || true,
          isPhoneVerified:
            apiUser.isPhoneVerified || apiUser.phoneVerified || false,
          role: normalizedRole as "user" | "lender" | "admin",
          status: apiUser.status || "active",
          createdAt: apiUser.createdAt || new Date().toISOString(),
          updatedAt: apiUser.updatedAt || new Date().toISOString(),
          switch_account: Boolean(apiUser.switch_account),
          isSwitched: isSwitchedFromApi,
          is_switched: isSwitchedFromApi,
        };

        // Set new localStorage data if available
        if (hasMounted) {
          // Clear old auth data first
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_email");
          localStorage.removeItem("user_name");
          localStorage.removeItem("role");
          localStorage.removeItem("switch_account");
          localStorage.removeItem("isSwitched");

          localStorage.setItem("user_name", userData.name);
          localStorage.setItem("user_email", userData.email);
          localStorage.setItem("role", roleForCookie);
          localStorage.setItem(
            "switch_account",
            String(userData.switch_account),
          );
          localStorage.setItem("isSwitched", String(userData.isSwitched));

          // Use new token from response, fall back to current token if not provided
          const tokenToStore = response.data.token || currentToken;
          if (tokenToStore) {
            localStorage.setItem("auth_token", tokenToStore);
          }
        }

        // Persist token/user just like sign-in
        storeSignIn(userData, (response.data.token || currentToken) as string, roleForCookie as any);
        toast.success(response.message || "Account switched successfully");
        router.push("/lender");
      } else {
        toast.error(response.message || "Failed to switch account");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to switch account");
    } finally {
      setIsSwitchingAccount(false);
    }
  };

  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const isProfileLoaded = useAuthStore((state) => state.isProfileLoaded);

  // Fetch updated profile data including profile image
  useEffect(() => {
    // Skip if not authenticated or if we're on the account page
    // (The account page handles its own profile fetch)
    if (!isAuthenticated || pathname === '/account') return;

    // Only fetch if not already loaded
    if (!isProfileLoaded) {
      fetchProfile();
    }
  }, [isAuthenticated, pathname, isProfileLoaded, fetchProfile]);

  // Fetch notifications when authenticated and dropdown opens
  useEffect(() => {
    if (isAuthenticated && isNotifDropdownOpen) {
      fetchNotifications({ page: 1, limit: 10 }, false);
    }
  }, [isAuthenticated, isNotifDropdownOpen, fetchNotifications]);

  // Fetch notifications on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications({ page: 1, limit: 10 }, false);
    }
  }, [isAuthenticated, fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedOutsideUser = dropdownRef.current && !dropdownRef.current.contains(target);
      const clickedOutsideNotif = notifRef.current && !notifRef.current.contains(target);
      const clickedOutsideSearch = searchRef.current && !searchRef.current.contains(target);
      const clickedOutsideMenu = menuRef.current && !menuRef.current.contains(target);
      const clickedOutsideOccasion = occasionRef.current && !occasionRef.current.contains(target);
      const clickedOutsideMobileMenu = mobileMenuRef.current && !mobileMenuRef.current.contains(target);

      if (clickedOutsideUser) setIsUserDropdownOpen(false);
      if (clickedOutsideNotif) setIsNotifDropdownOpen(false);
      if (clickedOutsideSearch) setIsSearchOpen(false);
      if (clickedOutsideMenu) setIsMenuOpen(false);
      if (clickedOutsideOccasion) setIsOccasionDropdownOpen(false);

      if (clickedOutsideMobileMenu) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle smart sticky navbar visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show at the very top
      if (currentScrollY < 10) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      // Determine visibility based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide navbar
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show navbar
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfilePopupOpen(false);
  }, [router]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      setIsProfilePopupOpen(false);
    }
  }, [isMobileMenuOpen]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          const response = await productsApiService.getSearchSuggestions(searchQuery);
          if (response.success && response.data) {
            setSuggestions(response.data.suggestions);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error("Failed to fetch suggestions:", error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle search functionality
  const handleSearch = (queryOverride?: string) => {
    const query = (queryOverride || searchQuery).trim();

    if (!query) {
      toast.error("Please enter a search term");
      return;
    }

    // Redirect to product page with query parameter
    router.push(`/productPage?q=${encodeURIComponent(query)}`);
    setIsSearchOpen(false);
    setShowSuggestions(false);
    setSearchQuery(query);
  };

  // Handle Enter key press in search input
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleOccasionClick = (occasionLabel: string) => {
    // close any open panels/dropdowns
    setIsFilterOpen(false);
    setIsMenuOpen(false);
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsOccasionDropdownOpen(false);
    setSearchQuery("");
    router.push(`/productPage?occasion=${encodeURIComponent(occasionLabel)}`);
  };

  // Load categories for Menu dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const resp = await categoriesApiService.getAllCategories();
        if ((resp as any)?.success) {
          const list = (resp as any).data || [];
          setCategories(list.map((c: any) => ({ _id: c._id, name: c.name })));
        } else {
          setCategories([]);
        }
      } catch {
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    if (
      (isMenuOpen || isMobileMenuOpen) &&
      categories.length === 0 &&
      !categoriesLoading
    ) {
      fetchCategories();
    }
  }, [isMenuOpen, isMobileMenuOpen]);

  const isMobile = hasMounted ? windowWidth < 768 : false;
  const isTablet = hasMounted
    ? windowWidth >= 768 && windowWidth < 1024
    : false;

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return "Login";

    if (user.firstName || user.lastName) {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }

    if (user.name) {
      return user.name;
    }

    return "Login";
  };

  // Get user email
  const getUserEmail = () => {
    if (!user) return "";
    return user.email || "";
  };

  // Check if switch account should be shown - FIXED LOGIC
  const switchAccountFlag = hasMounted
    ? ((user as any)?.switch_account ??
      localStorage.getItem("switch_account") === "true")
    : false;

  const isSwitchedFlag = hasMounted
    ? ((user as any)?.isSwitched ??
      (user as any)?.is_switched ??
      (user as any)?.isswithced ??
      localStorage.getItem("isSwitched") === "true")
    : false;

  // FIXED: Show switch account button if user has permission AND is NOT already switched
  const canSwitchToLender =
    hasMounted &&
    Boolean(
      isAuthenticated &&
      switchAccountFlag && // User has switch_account permission
      !isSwitchedFlag, // User is NOT already switched (show when isSwitched is false or undefined)
    );

  return (
    <>
      {isSwitchingAccount && hasMounted && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center">
          <div className="bg-white px-6 py-4 rounded shadow flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#3D1126]" />
            <p className="font-poppins text-sm text-[#3D1126]">
              Switching account...
            </p>
          </div>
        </div>
      )}
      <nav className={`backdrop-blur-md bg-[#FFFCF8]/90 border-b border-[#E8E3DD] h-[72px] md:h-[88px] fixed top-0 left-0 w-full z-40 transition-transform duration-300 ease-in-out shadow-xs ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="h-full w-full flex items-center justify-between relative mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center justify-center gap-4">
            <span
              onClick={() => setIsMobileMenuOpen(true)}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <MenuIcon size={44} color="#18181B" />
            </span>

            <Link href="/" className="flex items-center">
              <span className="font-serif tracking-[0.25em] text-2xl font-bold bg-gradient-to-r from-[#18181B] via-[#C8A96A] to-[#18181B] bg-clip-text text-transparent uppercase select-none">
                NAVYAA
              </span>
            </Link>
          </div>

          {/* Right Side - Icons and Menu */}
          <div className=" flex items-center gap-[16px]">
            <div
              className="hidden md:block w-[250px] md:w-[350px] lg:w-[450px]"
              ref={searchRef}
            >
              <div className="bg-[#F8F4EF] rounded-full border border-[#E8E3DD] focus-within:border-[#C8A96A] flex items-center gap-3 px-4 py-2 relative transition-all">
                <SearchIcon color="#7C7C7C" size={16} />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
                  placeholder="Search luxury outfits, designers, styles..."
                  className="flex-1 outline-none bg-transparent font-sans text-sm text-[#18181B] placeholder:text-[#7C7C7C]"
                />

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-[#E8E3DD] mt-2 rounded-2xl shadow-lg z-[100] max-h-[300px] overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => handleSearch(suggestion.value)}
                        className="px-4 py-3 hover:bg-[#F8F4EF] cursor-pointer flex items-center justify-between gap-3 border-b border-[#E8E3DD]/60 last:border-0"
                      >
                        <span className="text-sm font-sans text-[#18181B]">{suggestion.display}</span>
                        <span className="text-[10px] font-sans text-[#C8A96A] uppercase font-semibold">
                          {suggestion.type}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-[8px] md:gap-[12px]">
              {canSwitchToLender ? (
                <button
                  onClick={handleSwitchAccount}
                  disabled={isSwitchingAccount}
                  className="hidden md:flex items-center gap-2 px-5 py-2.5 cursor-pointer hover:bg-[#C8A96A] hover:text-white transition-all bg-[#18181B] text-[#FFFCF8] rounded-full font-sans font-semibold text-xs tracking-wide shadow-xs"
                >
                  <span className="whitespace-nowrap">
                    {isSwitchingAccount ? "Switching..." : "Supplier Portal"}
                  </span>
                  <BecomealenderbuttonIcon />
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      openPopup();
                    } else {
                      setIsBecomeLenderOpen(true);
                    }
                  }}
                  className="hidden md:flex items-center gap-2 px-5 py-2.5 cursor-pointer hover:bg-[#C8A96A] hover:text-white transition-all bg-[#18181B] text-[#FFFCF8] rounded-full font-sans font-semibold text-xs tracking-wide shadow-xs"
                >
                  <span className="whitespace-nowrap">
                    Become a Supplier
                  </span>
                  <BecomealenderbuttonIcon />
                </button>
              )}
            </div>

            {/* Occasion Dropdown - shows the same filters outside of menu */}
            {/* <div className="hidden md:relative md:block" ref={occasionRef}>
              <button
                onClick={() => {
                  setIsOccasionDropdownOpen((v) => !v);
                  // close other panels when opening
                  setIsMenuOpen(false);
                  setIsSearchOpen(false);
                  setIsUserDropdownOpen(false);
                  setIsNotifDropdownOpen(false);
                }}
                className="flex items-center gap-[4px] hover:opacity-70 transition-opacity font-['Poppins'] text-[16px] leading-[24px] text-[#3D1126]"
              >
                Occasion
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${isOccasionDropdownOpen ? 'rotate-180' : ''} transition-transform`}>
                  <path d="M1 1L6 6L11 1" stroke="#3D1126" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {isOccasionDropdownOpen && (
                <div className="absolute top-[44px] md:top-[60px] right-0 bg-white border border-[#d5d5d5] rounded-[8px] shadow-lg w-[300px] md:w-[320px] z-[100]">
                  <div className="px-[16px] py-[12px]">
                    {[
                      'Wedding Guest',
                      'Birthday / Party',
                      'Workwear',
                      'Holiday / Resort',
                      'Festival / Event',
                      'Black Tie / Gala',
                      'Traditional Wear',
                      'Casual / Everyday'
                    ].map((label) => (
                      <button
                        key={label}
                        className="w-full text-left py-[12px] hover:bg-[#FAF6F3] font-['Poppins'] text-[13px] leading-[18px] text-[#3D1126]"
                        onClick={() => handleOccasionClick(label)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div> */}

            {/* Menu Button + Dropdown - Hidden on mobile */}

          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-[70] transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none "}`}
      >
        <div
          className="absolute inset-0 bg-black/40"
          aria-hidden="true"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div
          ref={mobileMenuRef}
          className={`absolute top-0 left-0 w-[85vw] max-w-[360px] h-full bg-[#F6E4E7] px-[24px] pt-[28px] pb-[24px] flex flex-col justify-between shadow-xl overscroll-none transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* TOP SECTION */}
          <div className="flex-1 overflow-y-auto hide-scrollbar">
            {/* Main Menu Header */}
            <div className="flex items-center gap-[18px] mb-[48px] -ml-2">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-[50px] h-[50px] flex items-center justify-center"
              >
                <CloseIconnavbar size={22} color="#3D1126" />
              </button>

              <Link href="/" className="flex items-center">
                <span className="font-serif tracking-[0.2em] text-2xl font-bold bg-gradient-to-r from-[#BFA15F] to-[#E5C9A4] bg-clip-text text-transparent uppercase select-none">
                  NAVYAA
                </span>
              </Link>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex flex-col min-h-full">
              <div className="flex-1 flex flex-col">
                {/* Main Menu Links */}
                <div className="flex-1 flex flex-col animate-in slide-in-from-left duration-300">
                  <div className="border-b border-[#F3D6DC]">
                    <button
                      className="w-full flex justify-between items-center py-[20px]"
                      onClick={() => setActiveCategoryId(prev => prev ? null : "open")}
                    >
                      <span className="font-poppins text-[18px] text-[#000000] font-medium">Category</span>
                      <ChevronDownIcon
                        className={`${activeCategoryId ? 'rotate-180' : ''} transition-transform`}
                        color="#3D1126"
                      />
                    </button>
                    <AnimatePresence>
                      {activeCategoryId && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="flex flex-col overflow-hidden"
                        >
                          {categories.map((item) => (
                            <button
                              key={item._id}
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                router.push(`/productPage?category=${item._id}`);
                              }}
                              className="w-full text-left py-[14px] px-[16px] font-poppins text-[16px] text-[#3D1126]/80 hover:bg-white/40 border-b border-[#F3D6DC]/40 last:border-0 transition-colors"
                            >
                              {item.name}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="border-b border-[#F3D6DC]">
                    <button
                      className="w-full flex justify-between items-center py-[20px]"
                      onClick={() => setIsMobileOccasionOpen(v => !v)}
                    >
                      <span className="font-poppins text-[18px] text-[#000000] font-medium">Fabric Type</span>
                      <ChevronDownIcon
                        className={`${isMobileOccasionOpen ? 'rotate-180' : ''} transition-transform`}
                        color="#3D1126"
                      />
                    </button>
                    <AnimatePresence>
                      {isMobileOccasionOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="flex flex-col overflow-hidden"
                        >
                          {['Woven Fabrics', 'Knit Fabrics', 'Sustainable Textiles', 'Trims & Accessories', 'Technical Textiles', 'Printed Fabrics', 'Denim', 'Organic Cotton'].map((label) => (
                            <button
                              key={label}
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                handleOccasionClick(label);
                              }}
                              className="w-full text-left py-[14px] px-[16px] font-poppins text-[16px] text-[#3D1126]/80 hover:bg-white/40 border-b border-[#F3D6DC]/40 last:border-0 transition-colors"
                            >
                              {label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Link
                    href="/Faq"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex justify-between items-center py-[20px] border-b border-[#F3D6DC]"
                  >
                    <span className="font-poppins text-[18px] text-[#000000] font-medium">FAQ</span>
                    <ChevronRightIcon size={18} color="#3D1126" />
                  </Link>

                  <div className="flex flex-col mt-auto pt-10 pb-2">
                    {/* my booking */}
                    <Link
                      href={isAuthenticated ? "/bookings" : "#"}
                      onClick={(e) => {
                        if (!isAuthenticated) {
                          e.preventDefault();
                          openPopup();
                        } else {
                          setIsMobileMenuOpen(false);
                        }
                      }}
                      className="flex justify-between items-center py-[20px] border-b border-[#F3D6DC]"
                    >
                      <div className="flex items-center gap-3">
                        <BookingsIcon size={22} color="#3D1126" />
                        <span className="font-poppins text-[16px] text-[#3D1126] font-medium">My Orders</span>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 6L15 12L9 18" stroke="#3D1126" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </Link>

                    {/* wishlists */}
                    <Link
                      href={isAuthenticated ? "/wishlists" : "#"}
                      onClick={(e) => {
                        if (!isAuthenticated) {
                          e.preventDefault();
                          openPopup();
                        } else {
                          setIsMobileMenuOpen(false);
                        }
                      }}
                      className="flex justify-between items-center py-[20px] border-b border-[#F3D6DC]"
                    >
                      <div className="flex items-center gap-3">
                        <WishlistIcon size={22} color="#3D1126" />
                        <span className="font-poppins text-[16px] text-[#3D1126] font-medium">Wishlists</span>
                      </div>
                      <ChevronRightIcon size={18} color="#3D1126" />
                    </Link>

                    {/* Notification - Mobile */}
                    <button
                      onClick={(e) => {
                        if (!isAuthenticated) {
                          e.preventDefault();
                          setIsMobileMenuOpen(false);
                          openPopup();
                        } else {
                          setIsMobileMenuOpen(false);
                          setIsNotifDropdownOpen(true);
                        }
                      }}
                      className="flex justify-between items-center w-full py-[20px] border-b border-[#F3D6DC]"
                    >
                      <div className="flex items-center gap-3">
                        <NotificationIcon size={22} color="#3D1126" />
                        <span className="font-poppins text-[16px] text-[#3D1126] font-medium">Notifications</span>
                      </div>
                      <div className="relative flex items-center">
                        {unreadCount > 0 && (
                          <span className="bg-[#da1a32] text-white text-[10px] font-medium rounded-full w-[16px] h-[16px] flex items-center justify-center border border-white mr-2">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                        <ChevronRightIcon size={18} color="#3D1126" />
                      </div>
                    </button>

                    {/* Cart */}
                    <Link
                      href={isAuthenticated ? "/cart" : "#"}
                      onClick={(e) => {
                        if (!isAuthenticated) {
                          e.preventDefault();
                          openPopup();
                        } else {
                          setIsMobileMenuOpen(false);
                        }
                      }}
                      className="flex justify-between items-center py-[20px] border-b border-[#F3D6DC]"
                    >
                      <div className="flex items-center gap-3">
                        <CartIcon size={22} color="#3D1126" />
                        <span className="font-poppins text-[16px] text-[#3D1126] font-medium">My Cart</span>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 6L15 12L9 18" stroke="#3D1126" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </Link>



                    {/* Profile Link */}
                    <Link
                      href={isAuthenticated ? "/account" : "/auth/sign-in"}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex justify-between items-center w-full py-[20px]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center border border-[#F0CCD1]">
                          {user?.profile_image ? (
                            <img
                              src={user.profile_image}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="8" r="4" stroke="#3D1126" strokeWidth="1.5" />
                              <path d="M4 21C4 17 8 15 12 15C16 15 20 17 20 21" stroke="#3D1126" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          )}
                        </div>
                        <span className="font-poppins text-[16px] text-[#3D1126] font-medium">{getUserDisplayName()}</span>
                      </div>
                      <ChevronRightIcon size={18} color="#3D1126" />
                    </Link>

                    {/* Logout Button */}
                    {isAuthenticated && (
                      <div className="pt-4">
                        <PrimaryButton
                          onClick={handleLogout}
                          text="Logout"
                          className="w-full bg-[#1D2625] text-white py-4 rounded-xl flex items-center justify-center"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <NotificationModal
        isOpen={isNotifDropdownOpen}
        onClose={() => setIsNotifDropdownOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        loading={notificationsLoading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        markAsRead={markAsRead}
        markAllAsRead={markAllAsRead}
        loadMore={loadMore}
        onSwitchAccount={handleSwitchAccount}
      />

      {/* Become a Seller Modal */}
      <BecomeLenderModal
        isOpen={isBecomeLenderOpen}
        onClose={() => setIsBecomeLenderOpen(false)}
      />
    </>
  );
}
