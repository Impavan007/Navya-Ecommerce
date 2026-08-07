import { useEffect, useState, useRef, useCallback } from 'react';
import CommonModal from '../../../components/common/CommonModal';
import { useListingsStore } from '../../stores/Listing/FetchProducts';
import CommonLoader from '@/app/components/common/CommonLoader';
import axiosClient from '../../LenderAPi/Axiosclient';
import { API_ENDPOINTS } from '../../LenderAPi/LenderAPiendPoints';

interface AddItemsModalProps {
  onClose: () => void;
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;
}

export default function AddItemsModal({ onClose, selectedItems, setSelectedItems }: AddItemsModalProps) {
  const [allListings, setAllListings] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [pagination, setPagination] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const observer = useRef<IntersectionObserver | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Handle intersection for infinite scroll (trigger 3 items before the end)
  const lastItemRef = useCallback((node: HTMLDivElement | null) => {
    if (isFetching) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && pagination && pagination.currentPage < pagination.totalPages) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isFetching, pagination]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Handle search and page reset
  useEffect(() => {
    setPage(1);
    setAllListings([]);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [debouncedSearch]);

  // Fetch logic
  useEffect(() => {
    const loadItems = async () => {
      if (isFetching) return;
      setIsFetching(true);
      try {
        const params = {
          status: 'Active',
          page,
          limit: 12,
          search: debouncedSearch
        };
        
        const res = await axiosClient.get(API_ENDPOINTS.Products, { params });
        
        if (res.data?.success) {
          const newProducts = res.data.data.products || [];
          setAllListings(prev => page === 1 ? newProducts : [...prev, ...newProducts]);
          setPagination(res.data.data.pagination);
        }
      } catch (error) {
        console.error('Failed to fetch items:', error);
      } finally {
        setIsFetching(false);
      }
    };

    loadItems();
  }, [page, debouncedSearch]);

  const toggleSelect = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((x) => x !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };
  return (
    <CommonModal
      isOpen={true}
      onClose={onClose}
      title="Select Active Items"
      size="lg"
    >
      <div>
        {/* Search Bar */}
        <div className="flex mb-4 space-x-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or brand"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setSearch('')}
            className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Clear
          </button>
        </div>

        {/* Items Grid */}
        <div 
          ref={scrollContainerRef}
          className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2"
        >
          {allListings.map((item, index) => {
            // Trigger 3 items before the end (with a minimum of 0)
            const isTriggerItem = index === Math.max(0, allListings.length - 3);
            return (
              <div
                key={item.id || item._id}
                ref={isTriggerItem ? lastItemRef : null}
                className={`border p-3 cursor-pointer transition rounded-xl ${
                  selectedItems.includes(item.id || item._id) ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleSelect(item.id || item._id)}
              >
                <div className="relative aspect-square mb-2 overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={item.cover_image || (item.images && item.images[0]) || '/placeholder-item.png'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {selectedItems.includes(item.id || item._id) && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</h3>
                <p className="text-xs text-gray-500 mb-1">{item.brand}</p>
                <p className="text-xs text-gray-900 font-bold">Rs.{item.rentalPrice || item.rental_price_per_day || 0}</p>
              </div>
            );
          })}

          {isFetching && page === 1 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-3">
              <CommonLoader size="lg" color="gray" />
              <p className="text-sm text-gray-500 font-poppins">Loading items...</p>
            </div>
          )}

          {!isFetching && allListings.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-sm text-gray-500 font-poppins">No active listings found.</p>
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="text-blue-600 text-xs mt-2 hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
          
          {isFetching && page > 1 && (
            <div className="col-span-full py-4 flex justify-center">
              <CommonLoader size="sm" color="gray" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Done ({selectedItems.length||0})
          </button>
        </div>
      </div>
    </CommonModal>
  );
}
