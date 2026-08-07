'use client';

interface StoriesFiltersProps {
  activeTab: 'all' | 'pending' | 'active' | 'rejected';
  onTabChange: (t: 'all' | 'pending' | 'active' | 'rejected') => void;
  counts: { all?: number; pending?: number; active?: number; rejected?: number };
}

export default function StoriesFilters({ activeTab, onTabChange, counts }: StoriesFiltersProps) {
  const tabs: Array<{ key: 'all' | 'pending' | 'active' | 'rejected'; label: string; count: number }> = [
    { key: 'all', label: 'All', count: counts.all || 0 },
    { key: 'pending', label: 'Pending', count: counts.pending || 0 },
    { key: 'active', label: 'Active', count: counts.active || 0 },
    { key: 'rejected', label: 'Rejected', count: counts.rejected || 0 },
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex space-x-6" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`${
              activeTab === tab.key
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            } font-poppins whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium`}
          >
            {tab.label}
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {tab.count}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
