'use client';

import axiosClient from "@/app/lender/LenderAPi/Axiosclient";
import { API_ENDPOINTS } from "@/app/lender/LenderAPi/LenderAPiendPoints";
import { useState, useRef, useEffect } from "react";

interface BasicInfoSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  mode?: 'add' | 'edit';
}

export default function BasicInfoSection({ formData, setFormData, mode }: BasicInfoSectionProps) {
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [subcategories, setSubcategories] = useState<{ _id: string; name: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  const [isSizeDropdownOpen, setIsSizeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sizes = [
    'XS (UK/IN 6)',
    'S (UK/IN 8)',
    'M (UK/IN 10)',
    'L (UK/IN 12)',
    'XL (UK/IN 14)',
    'XXL (UK/IN 16)',
    '3XL (UK/IN 18)',
    '4XL (UK/IN 20)',
    '5XL (UK/IN 22)'
  ];
  const occasionOptions = [
    { label: "Birthday / Party", value: "Birthday / Party" },
    { label: "Wedding Guest", value: "Wedding Guest" },
    { label: "Workwear", value: "Workwear" },
    { label: "Holiday / Resort", value: "Holiday / Resort" },
    { label: "Festival / Event", value: "Festival / Event" },
    { label: "Black Tie / Gala", value: "Black Tie / Gala" },
    { label: "Traditional Wear", value: "Traditional Wear" },
    { label: 'Casual / Everyday', value: 'Casual / Everyday' }
  ];

  // ✅ Generic input handler
  const handleInputChange = (field: string, value: any) => {
    setFormData({ [field]: value });
  };

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSizeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Handle multi-select toggle for sizes
  const handleSizeToggle = (size: string) => {
    const selectedSizes = Array.isArray(formData.size) ? [...formData.size] : [];
    const isSelected = selectedSizes.includes(size);

    const updatedSizes = isSelected
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];

    handleInputChange("size", updatedSizes);
  };

  // ✅ Clear all selected sizes
  const handleClearSizes = () => {
    handleInputChange("size", []);
  };

  // ✅ Select all sizes
  const handleSelectAllSizes = () => {
    handleInputChange("size", [...sizes]);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await axiosClient.get(API_ENDPOINTS.Categories);
        setCategories(res.data.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSubcategories = async (categoryId: string) => {
      try {
        setLoadingSubcategories(true);
        const res = await axiosClient.get(`${API_ENDPOINTS.Categories}/${categoryId}/sub-categories`);
        const subData = res.data?.data;
        if (Array.isArray(subData)) {
          setSubcategories(subData);
        } else if (subData && Array.isArray(subData.subcategories)) {
          setSubcategories(subData.subcategories);
        } else {
          setSubcategories([]);
        }
      } catch (err) {
        console.error("Error fetching subcategories:", err);
      } finally {
        setLoadingSubcategories(false);
      }
    };

    if (formData.category) {
      fetchSubcategories(formData.category);
    } else {
      setSubcategories([]);
    }
  }, [formData.category]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-[24px] font-['Canela'] font-bold text-[#3D1126] mb-4">Basic Information</h3>
        <p className="text-[#6D6D6D] text-[14px] mb-6 font-roboto">
          Provide essential details about your textile item to help buyers find and understand your listing.
        </p>
      </div>

      {/* GRID START */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Title */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
            Item Title *
          </label>
          <input
            type="text"
            value={formData.title || ""}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-3 py-2 border-b bg-[#FAF6F3] border-gray-300 focus:outline-none focus:ring-0 text-sm font-poppins"
            placeholder="e.g., Red Silk Evening Dress"
            maxLength={100}
          />
          <p className="text-xs text-gray-500 mt-1 font-playfair">
            Be descriptive and specific. Include color, style, and key features.
          </p>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
            Category *
          </label>
          <select
            value={formData.category || ""}
            onChange={(e) => {
              const selectedCatId = e.target.value;
              handleInputChange('category', selectedCatId);
              handleInputChange('subcategory', '');
            }}
            className="w-full px-3 py-2 border-b bg-[#FAF6F3] border-gray-300 focus:outline-none focus:ring-0 text-sm font-poppins"
          >
            <option value="">Select Category</option>
            {loadingCategories
              ? <option>Loading...</option>
              : categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
          </select>
        </div>

        {/* Subcategory */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
            Subcategory *
          </label>
          <select
            value={formData.subcategory || ""}
            onChange={(e) => handleInputChange('subcategory', e.target.value)}
            className="w-full px-3 py-2 border-b bg-[#FAF6F3] border-gray-300 focus:outline-none focus:ring-0 text-sm font-poppins"
          >
            <option value="">Select a subcategory</option>
            {subcategories.map(sub => (
              <option key={sub._id} value={sub._id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        {/* Occasion */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
            Occasion
          </label>
          <select
            value={formData.occasion || ""}
            onChange={(e) => handleInputChange("occasion", e.target.value)}
            className="w-full px-3 py-2 border-b bg-[#FAF6F3] border-gray-300 focus:outline-none focus:ring-0 text-sm font-poppins"
          >
            <option value="">Select Occasion</option>
            {occasionOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* ✅ SIZE DROPDOWN - EU SIZES ONLY */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
            Size *
          </label>

          <div
            onClick={() => setIsSizeDropdownOpen(!isSizeDropdownOpen)}
            className="w-full px-3 py-2 border-b bg-[#FAF6F3] border-gray-300 focus:outline-none focus:ring-0 text-sm font-poppins cursor-pointer flex justify-between items-center"
          >
            <span>
              {formData.size && formData.size.length > 0
                ? `${formData.size.length} size(s) selected`
                : "Select sizes"}
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${isSizeDropdownOpen ? "rotate-180" : "rotate-0"
                }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {isSizeDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 shadow-lg rounded-md">
              {/* Header with Select All/Clear buttons */}
              <div className="flex justify-between items-center p-3 border-b border-gray-200">
                <button
                  type="button"
                  onClick={handleSelectAllSizes}
                  className="text-sm text-blue-600 hover:text-blue-800 font-poppins"
                >
                  Select All
                </button>
                <span className="text-sm font-medium text-gray-700 font-poppins">Indian Sizes</span>
                <button
                  type="button"
                  onClick={handleClearSizes}
                  className="text-sm text-red-600 hover:text-red-800 font-poppins"
                >
                  Clear
                </button>
              </div>

              {/* List of EU sizes with checkboxes */}
              <div className="max-h-56 overflow-y-auto">
                {sizes.map((size) => (
                  <label
                    key={size}
                    className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 font-playfair border-b border-gray-100 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={formData.size?.includes(size) || false}
                      onChange={() => handleSizeToggle(size)}
                      className="mr-3 text-gray-800 focus:ring-gray-800 rounded"
                    />
                    {size}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Brand */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
            Designer/Brand *
          </label>
          <input
            type="text"
            value={formData.brand || ""}
            onChange={(e) => handleInputChange('brand', e.target.value)}
            className="w-full px-3 py-2 border-b bg-[#FAF6F3] border-gray-300 focus:outline-none focus:ring-0 text-sm font-poppins"
            placeholder="e.g., Valentino, Zara, H&M"
          />
          <p className="text-xs text-gray-500 mt-1 font-playfair">
            Include the designer or brand name to help with search and credibility.
          </p>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
            Quantity *
          </label>
          <input
            type="number"
            min={1}
            value={formData.quantity || 1}
            onChange={(e) => handleInputChange("quantity", Number(e.target.value))}
            placeholder="Enter quantity"
            className="w-full px-3 py-2 border-b bg-[#FAF6F3] border-gray-300 focus:outline-none focus:ring-0 text-sm font-poppins"
          />
        </div>

        {/* Shipping Tier */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
            Shipping Tier *
          </label>
          <select
            value={formData.shipping_tier || ""}
            onChange={(e) => handleInputChange("shipping_tier", e.target.value)}
            className="w-full px-3 py-2 border-b bg-[#FAF6F3] border-gray-300 focus:outline-none focus:ring-0 text-sm font-poppins"
          >
            <option value="">Select Shipping Tier</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
            Price (Rs.) *
          </label>
          <input
            type="number"
            min={0}
            value={formData.rentalPrice || ""}
            onChange={(e) => handleInputChange("rentalPrice", e.target.value)}
            placeholder="Enter price"
            className="w-full px-3 py-2 border-b bg-[#FAF6F3] border-gray-300 focus:outline-none focus:ring-0 text-sm font-poppins"
          />
        </div>

        {/* Description */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
            Description *
          </label>
          <textarea
            value={formData.description || ""}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-gray-800 focus:border-transparent text-sm font-poppins bg-transparent"
            placeholder="Describe the item's style, fabric, occasion, and any special features..."
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500 font-playfair">
              Describe the style, fabric, fit, and perfect occasions for this piece.
            </p>
            <span className="text-xs text-gray-400 font-playfair">
              {formData.description?.length || 0}/500
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}