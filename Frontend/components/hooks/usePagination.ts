import { useState } from 'react';

/**
 * Custom hook for pagination logic.
 * Manages current page state and provides pagination utilities.
 */
export const usePagination = (itemsPerPage: number = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const getPaginatedItems = <T>(items: T[]): T[] => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  const getTotalPages = (totalItems: number): number => {
    return Math.ceil(totalItems / itemsPerPage);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const nextPage = (totalItems: number) => {
    const totalPages = getTotalPages(totalItems);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = (totalItems: number) => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return {
    currentPage,
    getPaginatedItems,
    getTotalPages,
    goToPage,
    nextPage,
    prevPage
  };
};
