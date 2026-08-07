'use client';

import { useListingsStore } from "../../store/Listing/ListingStore";

interface ListingsFiltersProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function ListingsFilters({ activeTab, onTabChange }: ListingsFiltersProps) {
  const { statusCount } = useListingsStore();
  const counts = statusCount || {};
  const tabs = [
    { id: 'All', label: 'All Listings', count: counts.all ?? 0 },
    { id: 'Pending', label: 'Pending Approval', count: counts.pending ?? 0 },
    { id: 'Active', label: 'Approved', count: counts.active ?? 0 },
    { id: 'Rejected', label: 'Rejected', count: counts.rejected ?? 0 },
    { id: 'Inactive', label: 'Inactive', count: counts.inactive ?? 0 },
  ];

  return (
    <div className="bg-white  border border-gray-200 p-6 mb-8 font-poppins">
      <div className="flex items-center space-x-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap font-poppins border ${activeTab === tab.id
                ? 'bg-gray-100 text-gray-900 border-gray-300'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent'
              }`}
          >
            <span>{tab.label}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold font-poppins ${activeTab === tab.id
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600'
              }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
