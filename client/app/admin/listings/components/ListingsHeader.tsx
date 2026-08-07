'use client';

import axiosClient from '@/app/lender/LenderAPi/Axiosclient';
import { API_ENDPOINTS } from '@/app/lender/LenderAPi/LenderAPiendPoints';
import { useEffect, useState } from 'react';

interface ListingsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
  filters: {
    category: string;
    brand: string;
    dateRange: string;
  };
  onFiltersChange: (filters: any) => void;
  onClearAll?: () => void;
  showClearAll?: boolean;
}

export default function ListingsHeader({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  filters,
  onFiltersChange,
  onClearAll,
  showClearAll
}: ListingsHeaderProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery); // Local state for input

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

  // Sync local search query with parent when prop changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Update parent search query and trigger search
    onSearchChange(localSearchQuery);
    onSearchSubmit();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearchChange(localSearchQuery);
      onSearchSubmit();
    }
  };

  const handleClearSearch = () => {
    setLocalSearchQuery('');
    onSearchChange('');
    onSearchSubmit(); // Trigger search with empty query
  };

  const brands = [
    { value: 'All', label: 'All Brands' },
    { value: 'gucci', label: 'Gucci' },
    { value: 'prada', label: 'Prada' },
    { value: 'chanel', label: 'Chanel' },
    { value: 'dior', label: 'Dior' },
    { value: 'valentino', label: 'Valentino' }
  ];

  const dateRanges = [
    { value: 'All', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'this_week', label: 'This Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' }
  ];

  return (
    <div className="bg-gray-50 border-b border-gray-200 px-8 py-6 font-poppins">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#3D1126] font-canela">Listings Management</h1>

        <div className="flex items-center space-x-4">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-search-line text-gray-400"></i>
              </div>
            </div>
            <input
              type="text"
              value={localSearchQuery} // Use local state
              onChange={(e) => setLocalSearchQuery(e.target.value)} // Only update local state
              onKeyPress={handleKeyPress}
              placeholder="Search listings, brands, lenders..."
              className="block w-80 pl-10 pr-20 py-2 border border-gray-200 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white font-playfair"
            />
            {/* Clear button when there's text */}
            {/* {localSearchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-8 pr-2 flex items-center text-gray-400 hover:text-gray-600"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-close-line"></i>
                </div>
              </button>
            )} */}
            <button
              type="submit"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-arrow-right-line"></i>
              </div>
            </button>
          </form>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 border transition-colors whitespace-nowrap font-poppins ${showFilters
              ? 'bg-gray-100 border-gray-300 text-gray-800'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-filter-line"></i>
            </div>
            <span className="text-sm font-medium">Filters</span>
          </button>

          {/* Header-level Clear All Button */}
          {showClearAll && (
            <button
              onClick={onClearAll}
              className="text-sm text-red-600 hover:text-red-700 font-medium font-poppins px-2 py-2 flex items-center space-x-1"
            >
              <i className="ri-refresh-line"></i>
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Row */}
      {showFilters && (
        <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 font-poppins">Category:</label>
            <select
              value={filters.category}
              onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
              className="border border-gray-200 px-3 py-2 text-sm bg-[#F3D6DC] text-black focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent font-playfair"
            >
              <option value="All">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 font-poppins">Date:</label>
            <select
              value={filters.dateRange}
              onChange={(e) => onFiltersChange({ ...filters, dateRange: e.target.value })}
              className="border border-gray-200 px-3 py-2 text-sm bg-[#F3D6DC] text-black focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent font-playfair"
            >
              {dateRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onClearAll}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium font-poppins"
          >
            Clear All Filters & Search
          </button>
        </div>
      )}
    </div>
  );
}