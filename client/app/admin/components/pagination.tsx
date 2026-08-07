// components/Pagination.tsx
'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);


  return (
    <div className="flex justify-end mt-[20px] gap-2 font-poppins text-[13px]">
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className={`px-4 py-2 border transition-colors ${currentPage === 1 ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-gray-50 text-[#1D2625] border-[#eee] hover:border-[#ccc] hover:text-black'}`}
      >
        &lt; Back
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-[36px] h-[38px] flex items-center justify-center border transition-colors ${page === currentPage ? "bg-black text-white border-black" : "border-[#eee] bg-gray-50 text-[#1D2625] hover:border-[#ccc] hover:text-black"}`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 border transition-colors ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-gray-50 text-[#1D2625] border-[#eee] hover:border-[#ccc] hover:text-black'}`}
      >
        Next &gt;
      </button>
    </div>
  );
}
