'use client';

interface UsersFiltersProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: {
    all: number;
    Renters: number;
    lenders: number;
    suspended: number;
  };
}

export default function UsersFilters({ activeTab, onTabChange, counts }: UsersFiltersProps) {
  const tabs = [
    { id: 'all', label: 'All Users', count: counts.all },
    { id: 'Renters', label: 'Renters', count: counts.Renters },
    { id: 'lenders', label: 'Lenders', count: counts.lenders },
    { id: 'suspended', label: 'Suspended', count: counts.suspended },
  ];

  return (
    <div className="bg-white border border-gray-200 p-6 font-roboto">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap font-roboto ${activeTab === tab.id
                ? 'bg-[#F3D6DC] text-[#4B5563] border border-[#F3D6DC]'
                : 'text-gray-600 hover:text-gray-900 hover:bg-[#FAF6F3] border border-transparent'
              }`}
          >
            <div className="flex items-center space-x-2">
              <span>{tab.label}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold font-roboto ${activeTab === tab.id
                  ? 'bg-[#1A1A1A] text-white'
                  : 'bg-gray-100 text-gray-600'
                }`}>
                {tab.count}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}