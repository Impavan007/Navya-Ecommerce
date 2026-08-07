// components/Pagination.tsx - Enhanced mobile logic
'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isMobile?: boolean;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Get mobile display pages
  const getMobileDisplay = () => {
    const pages: number[] = [];

    if (totalPages === 1) {
      return [1];
    }

    if (currentPage === 1) {
      // First page: show 1, 2
      pages.push(1, 2);
    } else if (currentPage === totalPages) {
      // Last page: show last-1, last
      pages.push(totalPages - 1, totalPages);
    } else {
      // Middle pages: show current, next
      pages.push(currentPage, currentPage + 1);
    }

    return pages.slice(0, 2); // Ensure only 2 pages max
  };

  const mobilePages = getMobileDisplay();

  return (
    <div className="flex justify-center items-center mt-[20px] gap-2 font-poppins text-[13px]">
      {/* Previous Button - Always show on desktop, conditional on mobile */}
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className={`
          px-4 py-2 border transition-colors
          ${currentPage === 1 ? 'sm:block hidden bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-[#F3D6DC] text-[#1D2625] border-[#eee] hover:border-[#ccc] hover:text-black'}
          ${currentPage === 1 ? 'hidden' : 'block'}
        `}
      >
        &lt; Back
      </button>

      {/* Mobile: Show only 2 page numbers */}
      <div className="sm:hidden flex items-center gap-2">
        {mobilePages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`
              w-[36px] h-[38px] flex items-center justify-center border transition-colors
              ${page === currentPage ? "bg-black text-white border-black" : "border-[#eee] bg-[#F3D6DC] text-[#1D2625] hover:border-[#ccc] hover:text-black"}
            `}
          >
            {page}
          </button>
        ))}

        {/* Show ellipsis if there are more pages */}
        {totalPages > 2 && currentPage < totalPages - 1 && (
          <span className="px-1 text-gray-500">...</span>
        )}
      </div>

      {/* Desktop: Show all pages */}
      <div className="hidden sm:flex items-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`
              w-[36px] h-[38px] flex items-center justify-center border transition-colors
              ${page === currentPage ? "bg-black text-white border-black" : "border-[#eee] bg-[#F3D6DC] text-[#1D2625] hover:border-[#ccc] hover:text-black"}
            `}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next Button - Always show on desktop, conditional on mobile */}
      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className={`
          px-4 py-2 border transition-colors
          ${currentPage === totalPages ? 'sm:block hidden bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-[#F3D6DC] text-[#1D2625] border-[#eee] hover:border-[#ccc] hover:text-black'}
          ${currentPage === totalPages ? 'hidden' : 'block'}
        `}
      >
        Next &gt;
      </button>
    </div>
  );
}
