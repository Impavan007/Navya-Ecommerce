'use client';

interface ChartViewProps {
  category: string;
  data: any;
}

export default function ChartView({ category, data }: ChartViewProps) {
  const chartData = {
    bookings: {
      title: 'Bookings Trend',
      data: [
        { month: 'Jan', value: 120 },
        { month: 'Feb', value: 150 },
        { month: 'Mar', value: 180 },
        { month: 'Apr', value: 220 },
        { month: 'May', value: 280 },
        { month: 'Jun', value: 320 }
      ]
    },
    transactions: {
      title: 'Transaction Volume',
      data: [
        { month: 'Jan', value: 45000 },
        { month: 'Feb', value: 52000 },
        { month: 'Mar', value: 48000 },
        { month: 'Apr', value: 61000 },
        { month: 'May', value: 75000 },
        { month: 'Jun', value: 89000 }
      ]
    },
    disputes: {
      title: 'Dispute Rate',
      data: [
        { month: 'Jan', value: 2.1 },
        { month: 'Feb', value: 1.8 },
        { month: 'Mar', value: 2.3 },
        { month: 'Apr', value: 1.9 },
        { month: 'May', value: 2.0 },
        { month: 'Jun', value: 1.7 }
      ]
    }
  };

  const currentChart = chartData[category as keyof typeof chartData];
  
  if (!currentChart) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 flex items-center justify-center text-gray-400">
              <i className="ri-bar-chart-line"></i>
            </div>
          </div>
          <h3 className="text-lg font-serif font-semibold text-gray-900 mb-2">Charts Coming Soon</h3>
          <p className="text-gray-600">Visualization for {category} data will be available soon</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...currentChart.data.map(d => d.value));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-serif font-semibold text-gray-900">{currentChart.title}</h2>
          <p className="text-sm text-gray-600 mt-1">Last 6 months trend</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100  transition-colors">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-download-line text-gray-500"></i>
            </div>
          </button>
          <button className="p-2 hover:bg-gray-100  transition-colors">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-fullscreen-line text-gray-500"></i>
            </div>
          </button>
        </div>
      </div>

      {/* Simple Bar Chart */}
      <div className="h-64">
        <div className="flex items-end justify-between h-full space-x-4 pb-8">
          {currentChart.data.map((item, index) => {
            const height = (item.value / maxValue) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center mb-2">
                  <div
                    className="w-full bg-yellow-400 rounded-t-lg transition-all duration-500 hover:bg-yellow-500 cursor-pointer relative group"
                    style={{ height: `${height}%`, minHeight: '8px' }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {category === 'transactions' ? `Rs.${item.value.toLocaleString()}` : 
                       category === 'disputes' ? `${item.value}%` : 
                       item.value.toLocaleString()}
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-600 font-medium">{item.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart Legend */}
      <div className="flex items-center justify-center space-x-6 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-400 rounded"></div>
          <span className="text-sm text-gray-600">
            {category === 'transactions' ? 'Volume (Rs.)' : 
             category === 'disputes' ? 'Rate (%)' : 
             'Count'}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          Trend: {currentChart.data[currentChart.data.length - 1].value > currentChart.data[0].value ? '↗' : '↘'} 
          {category === 'transactions' ? ' Revenue Growth' : 
           category === 'disputes' ? ' Rate Change' : 
           ' Volume Change'}
        </div>
      </div>
    </div>
  );
}