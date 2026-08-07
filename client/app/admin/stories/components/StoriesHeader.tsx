'use client';

interface StoriesHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: () => void;
  loading?: boolean;
  period:'all'| 'today' | 'week' | 'month' | 'year';
  onPeriodChange: (p: 'all' |'today' | 'week' | 'month' | 'year') => void;
}

export default function StoriesHeader({ searchQuery, onSearchChange, onSearchSubmit, loading, period, onPeriodChange }: StoriesHeaderProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit();
  };

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#3D1126] font-canela">Stories Review</h1>

        <div className="flex items-center space-x-3">
        <div>
          <select
            value={period}
            onChange={(e) => onPeriodChange(e.target.value as any)}
            className="border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent font-poppins"
          >
             <option value="all">All</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-search-line text-gray-400"></i>
            </div>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title or lender..."
            className="block w-80 pl-10 pr-10 py-2 border border-gray-200 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white font-poppins"
          />
          <button type="submit" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
            <div className="w-5 h-5 flex items-center justify-center">
              {loading ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : <i className="ri-arrow-right-line"></i>}
            </div>
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}