'use client';

interface DisputesFiltersProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: {
    all: number;
    open: number;
    under_review: number;
    resolved: number;
    escalated: number;
  };
}

export default function DisputesFilters({ activeTab, onTabChange, counts }: DisputesFiltersProps) {
  const tabs = [
    { id: 'all', label: 'All Disputes', count: counts.all },
    { id: 'Open', label: 'Open', count: counts.open },
    { id: 'Progress', label: 'Under Review', count: counts.under_review },
    { id: 'Resolved', label: 'Resolved', count: counts.resolved },
    { id: 'Rejected', label: 'Rejected', count: counts.escalated }
  ];

  return (
    <div className="bg-white  border border-gray-200 p-6 mb-8 font-poppins">
      <div className="flex items-center space-x-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3  text-sm font-medium transition-all duration-200 whitespace-nowrap font-poppins ${
              activeTab === tab.id
                ? 'bg-gray-100 text-gray-900 border border-gray-300'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold font-poppins ${
              activeTab === tab.id
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