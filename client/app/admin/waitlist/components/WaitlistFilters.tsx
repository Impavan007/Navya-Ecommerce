"use client";

interface WaitlistFiltersProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabCounts: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  filters: any;
  onFiltersChange: (filters: any) => void;
}

export default function WaitlistFilters({
  activeTab,
  onTabChange,
  tabCounts,
  filters,
  onFiltersChange,
}: WaitlistFiltersProps) {
  const tabs = [
    { id: "all", label: "All Users", count: tabCounts.all },
    { id: "pending", label: "Pending", count: tabCounts.pending },
    { id: "approved", label: "Approved", count: tabCounts.approved },
    { id: "rejected", label: "Rejected", count: tabCounts.rejected },
  ];

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    // Update filters.status when tab changes
    onFiltersChange((prev: any) => ({
      ...prev,
      status: tabId === "all" ? "" : tabId, // empty string means fetch all
    }));
  };

  return (
    <div className="bg-white shadow-sm border border-gray-200 font-roboto">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors font-roboto ${
                activeTab === tab.id
                  ? "border-[#F3D6DC] text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
              <span
                className={`ml-2 py-0.5 px-2 rounded-full text-xs font-roboto ${
                  activeTab === tab.id
                    ? "bg-[#F3D6DC] text-[#4B5563]"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 font-roboto">
              Sort by:
            </label>
            <select
              className="px-3 py-3 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#F3D6DC] focus:border-transparent pr-8 font-roboto bg-[#F3D6DC] text-black"
              value={filters.sort || "newest"}
              onChange={(e) =>
                onFiltersChange({ ...filters, sort: e.target.value })
              }
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="A-Z">Name A-Z</option>
              <option value="Z-A">Name Z-A</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 font-roboto">
              Period:
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) =>
                onFiltersChange({ ...filters, dateRange: e.target.value })
              }
              className="px-3 py-3 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#F3D6DC] focus:border-transparent pr-8 font-roboto bg-[#F3D6DC] text-black"
            >
              <option value="">All time</option>
              <option value="today">Today</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
