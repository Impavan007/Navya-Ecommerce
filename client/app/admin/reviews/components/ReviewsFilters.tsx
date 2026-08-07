'use client';

interface ReviewsFiltersProps {
  activeTab: 'all' | 'pending' | 'approved' | 'flagged' | 'removed';
  onTabChange: (tab: 'all' | 'pending' | 'approved' | 'flagged' | 'removed') => void;
  counts: {
    all: number;
    pending: number;
    approved: number;
    // flagged: number;
    removed: number;
  };
}

export default function ReviewsFilters({ activeTab, onTabChange, counts }: ReviewsFiltersProps) {
  const tabs = [
    { id: 'all', label: 'All Reviews', count: counts.all },
    { id: 'pending', label: 'Pending', count: counts.pending },
    { id: 'approved', label: 'Approved', count: counts.approved },
    // { id: 'flagged', label: 'Flagged', count: counts.flagged },
    { id: 'removed', label: 'Removed', count: counts.removed }
  ];

  return (
    <div className="bg-white border border-gray-200 p-6 mb-8">
      <div className="flex items-center gap-8  pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as any)}
            className={`flex items-center gap-2 py-1 transition-all relative whitespace-nowrap group ${activeTab === tab.id
                ? 'text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <span className={`text-sm font-medium font-poppins`}>
              {tab.label}
            </span>
            <span
              className={`px-2 py-0.5 text-[11px] rounded-full font-medium transition-colors ${activeTab === tab.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                }`}
            >
              {tab.count}
            </span>
            {activeTab === tab.id && (
              <div className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-gray-900" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}