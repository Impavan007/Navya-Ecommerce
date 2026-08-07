'use client';

interface OrdersFiltersProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function OrdersFilters({ activeTab, onTabChange }: OrdersFiltersProps) {
  const tabs = [
    { id: 'all', label: 'All Orders', count: 1247 },
    { id: 'pending', label: 'Pending', count: 32 },
    { id: 'active', label: 'Active', count: 89 },
    { id: 'completed', label: 'Completed', count: 1056 },
    { id: 'cancelled', label: 'Cancelled', count: 45 },
    { id: 'refunded', label: 'Refunded', count: 23 },
    { id: 'late', label: 'Late Returns', count: 12 },
    { id: 'disputed', label: 'Disputes', count: 8 }
  ];

  return (
    <div className="mb-8 font-poppins">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-gray-800 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="font-poppins">{tab.label}</span>
                {/* <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  activeTab === tab.id
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-600'
                } font-poppins`}>
                  {tab.count}
                </span> */}
              </div>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}