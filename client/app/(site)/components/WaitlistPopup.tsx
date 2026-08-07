"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import PrimaryButton from "./PrimaryButton";
import PrimaryButtonLight from "./PrimaryButtonLight";
import { waitlistApiService } from "../services/api/waitlist";
import { ENDPOINTS } from "../services/api/config";
import type { WaitlistRequest } from "../types/api";
import { BaseModal, ConfirmationModalContent } from "./Modal";

interface WaitlistPopupProps {
  isOpen: boolean;
  onClose?: () => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  city?: string;
  brands?: string;
  interest?: string;
}

interface ValidationRules {
  pattern: RegExp;
  message: string;
  minLength?: number;
  maxLength?: number;
}

export default function WaitlistPopup({ isOpen, onClose }: WaitlistPopupProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    city: "",
    interest: "",
    brands: ""
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isChecked, setIsChecked] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Validation rules
  const validationRules: Record<string, ValidationRules> = {
    name: {
      pattern: /^[a-zA-Z\s.'-]{2,50}$/,
      message: "Name should be 2-50 characters with only letters, spaces, apostrophes, periods, and hyphens",
      minLength: 2,
      maxLength: 50
    },
    email: {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: "Please enter a valid email address",
      minLength: 5,
      maxLength: 100
    },
    city: {
      pattern: /^[a-zA-Z\s,'-.]{2,30}$/,
      message: "City name should be 2-30 characters with only letters, spaces, commas, apostrophes, periods, and hyphens",
      minLength: 2,
      maxLength: 30
    },
    brands: {
      pattern: /^[a-zA-Z0-9\s,\-&.'()]{0,500}$/,
      message: "Brands can only contain letters, numbers, spaces, commas, hyphens, ampersands, periods, apostrophes, and parentheses",
      maxLength: 500
    }
  };

  const interestOptions = [
    { value: "renting", label: "Buying" },
    { value: "lending", label: "Selling" },
    { value: "both", label: "Both" }
  ];
////
  // Check if we're on the sign-in page
  const isSignInPage = pathname === '/auth/sign-in';

  // Real-time validation function
  const validateField = (field: string, value: string): string => {
    const rules = validationRules[field];
    if (!rules) return "";

    // Check if field is required but empty
    if (field !== 'brands' && value.trim() === '') {
      return "This field is required";
    }

    // Check min length
    if (rules.minLength && value.length < rules.minLength && value.length > 0) {
      return `Minimum ${rules.minLength} characters required`;
    }

    // Check max length
    if (rules.maxLength && value.length > rules.maxLength) {
      return `Maximum ${rules.maxLength} characters allowed`;
    }

    // Check pattern if value is not empty
    if (value.trim() !== '' && !rules.pattern.test(value)) {
      return rules.message;
    }

    return "";
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Mark field as touched
    if (!touchedFields.has(field)) {
      setTouchedFields(prev => new Set(prev).add(field));
    }

    // Validate in real-time if field has been touched
    if (touchedFields.has(field)) {
      const error = validateField(field, value);
      setFormErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  };

  const handleInputBlur = (field: string) => {
    // Mark field as touched when user leaves the field
    if (!touchedFields.has(field)) {
      setTouchedFields(prev => new Set(prev).add(field));
    }

    // Validate field on blur
    const error = validateField(field, formData[field as keyof typeof formData]);
    setFormErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched to show all errors
    const allFields = ['name', 'email', 'city', 'interest'];
    setTouchedFields(new Set(allFields));

    // Validate all fields
    const newErrors: FormErrors = {};
    allFields.forEach(field => {
      if (field !== 'interest') {
        const error = validateField(field, formData[field as keyof typeof formData]);
        if (error) newErrors[field as keyof FormErrors] = error;
      }
    });

    // Validate interest separately
    if (!formData.interest) {
      newErrors.interest = "Please select what you're interested in";
    }

    // Additional validation for lending/both
    if ((formData.interest === 'lending' || formData.interest === 'both') && 
        selectedItems.length === 0 && 
        !formData.brands.trim()) {
      newErrors.brands = "Please add at least one brand or item you would like to lend";
    }

    setFormErrors(newErrors);

    // Check if form is valid
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the errors in the form");
      return;
    }

    if (!isChecked) {
      toast.error("Please accept the Terms of Service and Privacy Policy");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare brands data - combine selectedItems AND any text in the input field
      let brandsData = "";
      
      if (selectedItems.length > 0) {
        brandsData = selectedItems.join(", ");
      } else if (formData.brands.trim()) {
        brandsData = formData.brands.trim();
      }
////
      const waitlistData: WaitlistRequest = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        city: formData.city.trim(),
        role: formData.interest === 'lending' ? 'Lender' : 
              formData.interest === 'renting' ? 'Renter' : 'Both',
        brands: brandsData,
        brandImage: selectedFile || undefined
      };

      // //
      // //

      const response = await waitlistApiService.createWaitlist(waitlistData);
      
      // //

      if (response.success) {
        // //
        setShowSuccessModal(true);
        setFormData({
          name: "",
          email: "",
          city: "",
          interest: "",
          brands: ""
        });
        setSelectedItems([]);
        setIsChecked(false);
        setSelectedFile(null);
        setFormErrors({});
        setTouchedFields(new Set());
      } else {
        console.error("❌ Waitlist submission failed:", response.message);
        toast.error(response.message || "Failed to join waitlist");
      }
    } catch (error: any) {
      console.error("❌ Waitlist submission error:", {
        message: error?.message,
        status: error?.status,
        errors: error?.errors,
        fullError: error
      });
      toast.error(error.message || "Failed to join waitlist. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    setShowSuccessModal(false);
    if (onClose) {
      onClose();
    }
    router.push('/');
  };

  const addItem = (item: string) => {
    if (item.trim() && !selectedItems.includes(item.trim())) {
      const newItems = [...selectedItems, item.trim()];
      setSelectedItems(newItems);
      setFormData(prev => ({ ...prev, brands: "" }));
      // Clear brands error when item is added
      setFormErrors(prev => ({ ...prev, brands: "" }));
    }
  };

  const removeItem = (item: string) => {
    const newItems = selectedItems.filter(i => i !== item);
    setSelectedItems(newItems);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (formData.brands.trim()) {
        addItem(formData.brands);
      }
    }
  };

  const handleSignIn = () => {
    router.push('/auth/sign-in');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4'];
      if (!acceptedTypes.includes(file.type)) {
        toast.error('Please select a valid file type (JPEG, PNG, JPG, WEBP, PDF, MP4)');
        return;
      }

      // Validate file size (50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleInterestSelect = (value: string, label: string) => {
    setFormData(prev => ({ ...prev, interest: value }));
    setIsDropdownOpen(false);
    
    // Clear interest error when selected
    setFormErrors(prev => ({ ...prev, interest: "" }));
    
    // Clear brands and selected items when switching away from lending/both
    if (value !== 'lending' && value !== 'both') {
      setSelectedItems([]);
      setFormData(prev => ({ ...prev, brands: "" }));
      setFormErrors(prev => ({ ...prev, brands: "" }));
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest('.dropdown-container')) {
          setIsDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // Check if we're on any auth page
  const isAuthPage = pathname.startsWith('/auth/');

  if (!isOpen) return null;

  return (
    <>
      {/* Success Modal */}
      <BaseModal isOpen={showSuccessModal} onClose={handleContinue} size="md">
        <ConfirmationModalContent
          title="You're On The List!"
          message="Thanks for joining the Navyaa community. We'll be in touch soon with your early access invite!"
          type="success"
          confirmLabel="Continue"
          onConfirm={handleContinue}
          onCancel={handleContinue}
        />
      </BaseModal>

      {/* Waitlist Form Popup */}
      <BaseModal isOpen={isOpen} onClose={onClose || (() => {})} size="6xl">
        <div className="flex flex-col lg:flex-row bg-white">
            {/* Left Column - Background Image */}
            <div className="hidden lg:block lg:w-1/2 relative h-[600px] xl:h-[700px] 2xl:h-[933px] overflow-hidden">
              <Image
                src="/assets/waitlistgirl.png"
                alt="Waitlist Background"
                fill
                className="object-cover"
                unoptimized
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50" />
              <div className="absolute bottom-0 left-0 right-0 p-6 xl:p-8 text-white">
                <div className="space-y-6 xl:space-y-8">
                  <div>
                    <h2 className="font-['Playfair_Display'] font-bold text-2xl xl:text-[32px] leading-[1.2] xl:leading-[48px] text-white mb-2 xl:mb-3">
                      Join the Navyaa Waitlist today!
                    </h2>
                    <p className="font-poppins text-sm xl:text-[16px] leading-[1.4] xl:leading-[24px] text-[#f1f1f1]">
                      Be among the first to buy, sell, or do both with Navyaa — Amsterdam's first circular wardrobe.
                    </p>
                  </div>
                  
                  <div className="space-y-3 xl:space-y-4">
                    <p className="font-['Playfair_Display'] font-medium text-lg xl:text-[20px] leading-[1.3] xl:leading-[28px] text-[#e1dac8]">
                      We're gradually opening Navyaa in select cities.
                    </p>
                    
                    <div className="space-y-3 xl:space-y-4">
                      <p className="font-poppins font-medium text-sm xl:text-[14px] leading-[1.3] xl:leading-[20px] text-[#f1f1f1]">
                        Join the waitlist to:
                      </p>
                      
                      <div className="space-y-2 xl:space-y-3">
                        <div className="flex items-start gap-3 xl:gap-4">
                          <div className="w-6 h-6 xl:w-[30px] xl:h-[30px] bg-[#f1eee6] border border-[#e1dac8] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3.5 h-3.5 xl:w-4 xl:h-4" viewBox="0 0 24 24" fill="none">
                              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="#6D6D6D"/>
                            </svg>
                          </div>
                          <p className="font-poppins text-xs xl:text-[12px] leading-[1.3] xl:leading-[16px] text-[#f1f1f1] flex-1">
                            Get early access before public launch
                          </p>
                        </div>
                        
                        <div className="flex items-start gap-3 xl:gap-4">
                          <div className="w-6 h-6 xl:w-[30px] xl:h-[30px] bg-[#f1eee6] border border-[#e1dac8] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3.5 h-3.5 xl:w-4 xl:h-4" viewBox="0 0 24 24" fill="none">
                              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#6D6D6D" strokeWidth="2"/>
                              <path d="M8 12L10.5 14.5L16 9" stroke="#6D6D6D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <p className="font-poppins text-xs xl:text-[12px] leading-[1.3] xl:leading-[16px] text-[#f1f1f1] flex-1">
                            Receive updates when Navyaa opens near you
                          </p>
                        </div>
                        
                        <div className="flex items-start gap-3 xl:gap-4">
                          <div className="w-6 h-6 xl:w-[30px] xl:h-[30px] bg-[#f1eee6] border border-[#e1dac8] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3.5 h-3.5 xl:w-4 xl:h-4" viewBox="0 0 24 24" fill="none">
                              <path d="M3 7V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V7" stroke="#6D6D6D" strokeWidth="2"/>
                              <path d="M3 7L5 21H19L21 7" stroke="#6D6D6D" strokeWidth="2"/>
                            </svg>
                          </div>
                          <p className="font-poppins text-xs xl:text-[12px] leading-[1.3] xl:leading-[16px] text-[#f1f1f1] flex-1">
                            Be first to buy or list your closet when we go live
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="w-full lg:w-1/2 p-4 xs:p-5 sm:p-6 md:p-7 lg:p-8 relative">
              {onClose && (
                <button
                  onClick={onClose}
                  className="absolute top-2 right-2 xs:top-3 xs:right-3 sm:top-4 sm:right-4 w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors z-10"
                >
                  <svg className="w-5 h-5 xs:w-5.5 xs:h-5.5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}

              <div className="lg:hidden mb-4 xs:mb-5 sm:mb-6 text-center">
                <h2 className="font-['Playfair_Display'] font-bold text-xl xs:text-2xl sm:text-3xl text-[#3D1126] mb-2 xs:mb-3">
                  Join the Navyaa Waitlist
                </h2>
                <p className="font-poppins text-sm xs:text-base text-[#3D1126]">
                  Be among the first to buy, sell, or do both with Navyaa
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 xs:space-y-5 sm:space-y-6">
                <div className="space-y-3 xs:space-y-4">
                  {/* Name Field */}
                  <div>
                    <input
                      type="text"
                      placeholder="Enter your Full Name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      onBlur={() => handleInputBlur("name")}
                      className={`w-full border-b py-2 xs:py-3 sm:py-3 px-0 bg-transparent text-[#8a8a8a] text-sm xs:text-base sm:text-[16px] focus:outline-none placeholder:text-[#8a8a8a] ${
                        formErrors.name ? 'border-red-500' : 'border-[#6d6d6d] focus:border-[#3D1126]'
                      }`}
                      required
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <input
                      type="email"
                      placeholder="Enter your Email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      onBlur={() => handleInputBlur("email")}
                      className={`w-full border-b py-2 xs:py-3 sm:py-3 px-0 bg-transparent text-[#8a8a8a] text-sm xs:text-base sm:text-[16px] focus:outline-none placeholder:text-[#8a8a8a] ${
                        formErrors.email ? 'border-red-500' : 'border-[#6d6d6d] focus:border-[#3D1126]'
                      }`}
                      required
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                    )}
                  </div>

                  {/* City Field */}
                  <div>
                    <input
                      type="text"
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      onBlur={() => handleInputBlur("city")}
                      className={`w-full border-b py-2 xs:py-3 sm:py-3 px-0 bg-transparent text-[#8a8a8a] text-sm xs:text-base sm:text-[16px] focus:outline-none placeholder:text-[#8a8a8a] ${
                        formErrors.city ? 'border-red-500' : 'border-[#6d6d6d] focus:border-[#3D1126]'
                      }`}
                      required
                    />
                    {formErrors.city && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>
                    )}
                  </div>

                  {/* Interest Dropdown */}
                  <div className="relative dropdown-container">
                    <div 
                      onClick={toggleDropdown}
                      className={`w-full border-b py-2 xs:py-3 sm:py-3 px-0 bg-transparent cursor-pointer flex items-center justify-between ${
                        formErrors.interest ? 'border-red-500' : 'border-[#6d6d6d]'
                      }`}
                    >
                      <span className={`text-sm xs:text-base sm:text-[16px] ${formData.interest ? 'text-[#3D1126]' : 'text-[#a8a8a8]'}`}>
                        {formData.interest ? interestOptions.find(opt => opt.value === formData.interest)?.label : 'What are you interested in?'}
                      </span>
                      <div className={`transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                        <svg className="w-5 h-5 xs:w-5.5 xs:h-5.5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none">
                          <path d="M7 10L12 15L17 10" stroke="#6d6d6d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    {formErrors.interest && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.interest}</p>
                    )}

                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 bg-[#FAF6F3] border border-[#6d6d6d] border-t-0 z-20 max-h-48 overflow-y-auto">
                        {interestOptions.map((option) => (
                          <div
                            key={option.value}
                            onClick={() => handleInterestSelect(option.value, option.label)}
                            className={`px-3 xs:px-4 py-2 xs:py-3 cursor-pointer hover:bg-[#e1dac8] transition-colors border-b border-[#6d6d6d] border-opacity-30 last:border-b-0 ${
                              formData.interest === option.value ? 'bg-[#a8a8a8] text-[#FAF6F3]' : 'text-[#a8a8a8]'
                            }`}
                          >
                            <span className="text-sm xs:text-base sm:text-[16px] font-poppins">{option.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Brands Field - Conditional */}
                  {(formData.interest === 'lending' || formData.interest === 'both') && (
                    <div>
                      <input
                        type="text"
                        placeholder="What brand or items would you lend?"
                        value={formData.brands}
                        onChange={(e) => handleInputChange("brands", e.target.value)}
                        onBlur={() => handleInputBlur("brands")}
                        onKeyPress={handleKeyPress}
                        className={`w-full border-b py-2 xs:py-3 sm:py-3 px-0 bg-transparent text-[#8a8a8a] text-sm xs:text-base sm:text-[16px] focus:outline-none placeholder:text-[#8a8a8a] ${
                          formErrors.brands ? 'border-red-500' : 'border-[#6d6d6d] focus:border-[#3D1126]'
                        }`}
                      />
                      <p className="text-[#a8a8a8] text-xs xs:text-sm mt-1">
                        Press Enter to add each item. You can add multiple items.
                      </p>
                      {formErrors.brands && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.brands}</p>
                      )}
                    </div>
                  )}

                  {/* Selected Items Tags */}
                  {(formData.interest === 'lending' || formData.interest === 'both') && selectedItems.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedItems.map((item, index) => (
                        <div key={index} className="bg-[#e1dac8] px-3 xs:px-4 py-1 xs:py-2 rounded flex items-center gap-1 xs:gap-2">
                          <span className="text-[#6d6d6d] text-xs xs:text-sm sm:text-[16px]">{item}</span>
                          <button
                            type="button"
                            onClick={() => removeItem(item)}
                            className="text-[#6d6d6d] hover:text-[#3D1126] flex-shrink-0"
                          >
                            <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4" viewBox="0 0 24 24" fill="none">
                              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* File Upload - Conditional */}
                {(formData.interest === 'lending' || formData.interest === 'both') && (
                  <div className="space-y-2 xs:space-y-3">
                    <p className="text-[#a8a8a8] text-sm xs:text-base sm:text-[16px]">
                      Upload an image of your wardrobe (optional)
                    </p>
                    <div className="border-2 border-dashed border-[#cbd0dc] p-4 xs:p-5 sm:p-6 md:p-8 text-center">
                      <input
                        type="file"
                        id="brandImage"
                        accept="image/jpeg, image/jpg, image/png, image/webp, application/pdf, video/mp4"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="brandImage" className="cursor-pointer block">
                        <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                          <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 mx-auto">
                            <svg className="w-full h-full" viewBox="0 0 32 32" fill="none">
                              <path d="M16 2L20.09 11.26L30 12.27L22.5 19.14L24.18 28.82L16 23.77L7.82 28.82L9.5 19.14L2 12.27L11.91 11.26L16 2Z" fill="#6D6D6D"/>
                            </svg>
                          </div>
                          <div>
                            <p className="text-[#292d32] text-sm xs:text-base sm:text-[16px] font-poppins">
                              {selectedFile ? selectedFile.name : "Choose a file or drag & drop it here"}
                            </p>
                            <p className="text-[#a9acb4] text-xs xs:text-sm mt-1">
                              JPEG, PNG, JPG, WEBP, PDF, MP4 formats, up to 50MB
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>
                    <p className="text-[#a8a8a8] text-xs xs:text-sm">
                      Show us a glimpse of what you'd love to lend — a favorite piece, outfit, or wardrobe snapshot. This helps us get to know your style before launch.
                    </p>
                  </div>
                )}

                {/* Terms and Conditions */}
                <div className="flex items-start gap-2 xs:gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                    className="mt-0.5 xs:mt-1 flex-shrink-0"
                    required
                  />
                  <label htmlFor="terms" className="text-[#8a8a8a] text-xs xs:text-sm leading-[1.4] xs:leading-[16px]">
                    I accept the{" "}
                    <a href="#" className="underline text-black">Terms of Service</a>
                    {" "}and{" "}
                    <a href="#" className="underline text-black">Privacy Policy</a>
                    {" "}and agree to receive Navyaa updates.
                  </label>
                </div>

                {/* Submit Button */}
                <div className="space-y-3 xs:space-y-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#1A1A1A] text-white font-poppins font-medium text-sm xs:text-base py-3 xs:py-3 sm:py-4 px-4 rounded hover:bg-[#1a1a1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Joining Waitlist..." : "Join Waitlist"}
                  </button>
                  
                  {/* Only show "Sign in" section if NOT on the sign-in page */}
                  {!isSignInPage && (
                    <div className="text-center">
                      <p className="text-[#8a8a8a] text-sm xs:text-base mb-2">Or</p>
                      <div className="flex flex-col xs:flex-row items-center justify-center gap-1 xs:gap-2">
                        <p className="text-[#3D1126] text-sm xs:text-base">Already have an account?</p>
                        <button 
                          type="button" 
                          onClick={handleSignIn}
                          className="underline text-black font-medium hover:text-[#3D1126] transition-colors text-sm xs:text-base"
                        >
                          Sign in
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
      </BaseModal>
    </>
  );
}
