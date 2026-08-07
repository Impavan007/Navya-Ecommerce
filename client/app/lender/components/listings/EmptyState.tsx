'use client';

import Link from 'next/link';

export default function EmptyState() {
  return (
    <div className="bg-white  shadow-sm border border-gray-200 p-12 text-center">
      <div className="max-w-md mx-auto">
        <img
          src="https://readdy.ai/api/search-image?query=elegant%20fashion%20wardrobe%20illustration%2C%20minimalist%20line%20art%20style%2C%20empty%20closet%20with%20hangers%2C%20soft%20pastel%20colors%2C%20clean%20white%20background%2C%20editorial%20fashion%20magazine%20aesthetic&width=300&height=200&seq=empty1&orientation=landscape"
          alt="Empty wardrobe"
          className="w-48 h-32 mx-auto mb-6 object-cover "
        />
        
        <h3 className="text-lg font-poppins font-bold text-gray-900 mb-2">
          You haven't added any listings yet
        </h3>
        
        <p className="text-gray-600 mb-6 font-playfair">
          Start building your textile supply business by adding your first item to the marketplace.
        </p>
        
        <Link
          href="/lender/listings/new"
          className="inline-flex items-center px-6 py-3 bg-gray-800 text-white font-medium  hover:bg-gray-900 transition-colors cursor-pointer whitespace-nowrap font-poppins"
        >
          <i className="ri-add-line mr-2 w-5 h-5 flex items-center justify-center"></i>
          Add Your First Listing
        </Link>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4 font-playfair">Need help getting started?</p>
          <div className="flex flex-col sm:flex-row sm:justify-center space-y-2 sm:space-y-0 sm:space-x-4">
            <button className="text-sm text-gray-800 hover:text-gray-900 font-medium cursor-pointer whitespace-nowrap font-poppins">
              View Listing Guidelines
            </button>
            <button className="text-sm text-gray-800 hover:text-gray-900 font-medium cursor-pointer whitespace-nowrap font-poppins">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}