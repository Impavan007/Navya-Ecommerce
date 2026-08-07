'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import ExportModal from './ExportModal';

const ratingDistribution = [
  { rating: '5★', count: 70, percentage: 55 },
  { rating: '4★', count: 40, percentage: 31 },
  { rating: '3★', count: 12, percentage: 9 },
  { rating: '2★', count: 4, percentage: 3 },
  { rating: '1★', count: 2, percentage: 2 }
];

const trendData = [
  { month: 'Jun', rating: 4.2 },
  { month: 'Jul', rating: 4.4 },
  { month: 'Aug', rating: 4.5 },
  { month: 'Sep', rating: 4.6 },
  { month: 'Oct', rating: 4.7 }
];

const itemRatings = [
  {
    id: 1,
    name: 'Red Silk Dress',
    image: 'https://readdy.ai/api/search-image?query=Elegant%20red%20silk%20dress%20on%20white%20background%2C%20luxury%20fashion%20photography%2C%20minimalist%20styling%2C%20premium%20quality%20fabric%2C%20editorial%20fashion%20shoot&width=60&height=80&seq=dress2&orientation=portrait',
    avgRating: 4.8,
    totalReviews: 24,
    recentReview: 'Absolutely stunning dress, perfect for my gala event'
  },
  {
    id: 2,
    name: 'Chanel Bag',
    image: 'https://readdy.ai/api/search-image?query=Luxury%20Chanel%20handbag%20on%20white%20background%2C%20premium%20fashion%20photography%2C%20classic%20quilted%20design%2C%20elegant%20styling%2C%20high-end%20accessories&width=60&height=80&seq=bag2&orientation=portrait',
    avgRating: 4.9,
    totalReviews: 18,
    recentReview: 'Perfect condition and exactly as described'
  },
  {
    id: 3,
    name: 'Black Blazer',
    image: 'https://readdy.ai/api/search-image?query=Classic%20black%20blazer%20on%20white%20background%2C%20professional%20fashion%20photography%2C%20tailored%20fit%2C%20luxury%20business%20wear%2C%20minimalist%20styling&width=60&height=80&seq=blazer2&orientation=portrait',
    avgRating: 4.7,
    totalReviews: 22,
    recentReview: 'Great quality and professional look'
  },
  {
    id: 4,
    name: 'Sequin Jacket',
    image: 'https://readdy.ai/api/search-image?query=Glamorous%20sequin%20jacket%20on%20white%20background%2C%20luxury%20fashion%20photography%2C%20sparkling%20details%2C%20premium%20evening%20wear%2C%20editorial%20styling&width=60&height=80&seq=jacket2&orientation=portrait',
    avgRating: 3.9,
    totalReviews: 15,
    recentReview: 'Beautiful but sizing was off'
  },
  {
    id: 5,
    name: 'Designer Heels',
    image: 'https://readdy.ai/api/search-image?query=Luxury%20designer%20high%20heels%20on%20white%20background%2C%20premium%20fashion%20photography%2C%20elegant%20stiletto%20design%2C%20sophisticated%20styling&width=60&height=80&seq=heels2&orientation=portrait',
    avgRating: 4.2,
    totalReviews: 19,
    recentReview: 'Comfortable and stylish for the event'
  }
];

const feedbackTags = [
  { tag: 'Perfect Fit', count: 45 },
  { tag: 'Great Quality', count: 38 },
  { tag: 'Fast Delivery', count: 32 },
  { tag: 'Excellent Communication', count: 28 },
  { tag: 'As Described', count: 25 },
  { tag: 'Sizing Issues', count: 8 },
  { tag: 'Late Delivery', count: 5 },
  { tag: 'Condition Issues', count: 3 }
];

export default function RatingsAnalytics() {
  const [showExportModal, setShowExportModal] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'area'>('area');

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`ri-star-${i < Math.floor(rating) ? 'fill' : 'line'} w-4 h-4 flex items-center justify-center ${
          i < Math.floor(rating) ? 'text-yellow-500' : 'text-gray-300'
        }`}
      ></i>
    ));
  };

  return (
    <>
      <div className="space-y-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white  shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-3xl font-serif text-gray-900">4.7</span>
                  <div className="flex items-center gap-1">
                    {renderStars(4.7)}
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <i className="ri-star-fill text-yellow-600 text-xl w-6 h-6 flex items-center justify-center"></i>
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">+0.2 from last month</p>
          </div>
          
          <div className="bg-white  shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-3xl font-serif text-gray-900 mt-2">128</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-chat-3-line text-blue-600 text-xl w-6 h-6 flex items-center justify-center"></i>
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">+12 this month</p>
          </div>
          
          <div className="bg-white  shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Rate</p>
                <p className="text-3xl font-serif text-gray-900 mt-2">94%</p>
              </div>
              <div className="w-12 h-12 bg-[#F3D6DC] rounded-full flex items-center justify-center">
                <i className="ri-check-line text-green-600 text-xl w-6 h-6 flex items-center justify-center"></i>
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">+2% from last month</p>
          </div>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Rating Distribution */}
          <div className="bg-white  shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-serif text-gray-900">Rating Distribution</h3>
              <button
                onClick={() => setShowExportModal(true)}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              >
                Export
              </button>
            </div>
            
            <div className="space-y-4">
              {ratingDistribution.map((item) => (
                <div key={item.rating} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700 w-8">{item.rating}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Rating Trend */}
          <div className="bg-white  shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-serif text-gray-900">Rating Trend</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setChartType('line')}
                  className={`px-3 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                    chartType === 'line' ? 'bg-yellow-100 text-yellow-800' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Line
                </button>
                <button
                  onClick={() => setChartType('area')}
                  className={`px-3 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                    chartType === 'area' ? 'bg-yellow-100 text-yellow-800' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Area
                </button>
              </div>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                    <YAxis domain={[4.0, 5.0]} stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rating" 
                      stroke="#eab308" 
                      strokeWidth={3}
                      dot={{ fill: '#eab308', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                ) : (
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                    <YAxis domain={[4.0, 5.0]} stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="rating" 
                      stroke="#eab308" 
                      fill="#fef3c7"
                      strokeWidth={2}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Item-Based Ratings */}
        <div className="bg-white  shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif text-gray-900">Item Performance</h3>
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white  hover:bg-yellow-700 transition-colors text-sm whitespace-nowrap cursor-pointer"
              >
                <i className="ri-download-line w-4 h-4 flex items-center justify-center"></i>
                Export
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full table-auto table-word-wrap">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Item", "Avg Rating", "Total Reviews", "Most Recent Review"].map((header, idx) => (
                    <th
                      key={idx}
                      className="text-left py-3 px-6 text-sm font-medium text-gray-700 break-words whitespace-normal"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {itemRatings.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors align-top"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-16 rounded object-cover"
                        />
                        <span className="font-medium text-gray-900">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{item.avgRating}</span>
                        <div className="flex items-center gap-1">
                          {renderStars(item.avgRating)}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-600">{item.totalReviews} reviews</span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-600 max-w-xs truncate">
                        "{item.recentReview}"
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Feedback Tags */}
        <div className="bg-white  shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-serif text-gray-900 mb-6">Common Feedback Tags</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {feedbackTags.map((tag) => (
              <div
                key={tag.tag}
                className={`p-4  border-2 transition-colors ${
                  tag.count > 20 
                    ? 'border-green-200 bg-green-50' 
                    : tag.count > 10 
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{tag.tag}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    tag.count > 20 
                      ? 'bg-[#F3D6DC] text-green-800' 
                      : tag.count > 10 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {tag.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          type="analytics"
        />
      )}
    </>
  );
}
