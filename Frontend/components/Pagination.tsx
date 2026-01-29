import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 bg-white">
      <span className="text-xs text-gray-500 font-medium">
        Showing <span className="font-bold text-[#001733]">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> to <span className="font-bold text-[#001733]">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-bold text-[#001733]">{totalItems}</span> results
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1.5 border border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-600 disabled:opacity-40 hover:bg-gray-50 hover:text-[#001733] transition-colors rounded-sm"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 border border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-600 disabled:opacity-40 hover:bg-gray-50 hover:text-[#001733] transition-colors rounded-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
};