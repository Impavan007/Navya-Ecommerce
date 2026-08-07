'use client';

interface ReportCategoriesProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function ReportCategories({ activeCategory, onCategoryChange }: ReportCategoriesProps) {
  const categories = [
    { id: 'bookings', label: 'Bookings', icon: 'ri-shopping-bag-line', count: '1,234' },
    { id: 'users', label: 'Users', icon: 'ri-user-line', count: '2,847' },
    { id: 'transactions', label: 'Transactions', icon: 'ri-exchange-line', count: '3,456' },
    { id: 'payouts', label: 'Payouts', icon: 'ri-money-euro-circle-line', count: '567' },
    { id: 'disputes', label: 'Disputes', icon: 'ri-alert-line', count: '89' },
    { id: 'reviews', label: 'Reviews', icon: 'ri-star-line', count: '1,123' }
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-serif font-semibold text-gray-900 mb-4">Report Categories</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`p-4  border-2 transition-all duration-200 text-left ${
              activeCategory === category.id
                ? 'border-yellow-600 bg-yellow-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-8 h-8 flex items-center justify-center  ${
                activeCategory === category.id
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <i className={category.icon}></i>
              </div>
              <div className="flex-1">
                <h3 className={`font-medium text-sm ${
                  activeCategory === category.id ? 'text-yellow-700' : 'text-gray-900'
                }`}>
                  {category.label}
                </h3>
              </div>
            </div>
            <p className={`text-2xl font-serif font-bold ${
              activeCategory === category.id ? 'text-yellow-700' : 'text-gray-900'
            }`}>
              {category.count}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total records</p>
          </button>
        ))}
      </div>
    </div>
  );
}