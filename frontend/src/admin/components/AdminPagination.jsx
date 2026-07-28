import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminPagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="admin-pagination">
      <button type="button" disabled={page <= 0} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft size={16} /> Trước
      </button>
      <span>Trang {page + 1} / {totalPages}</span>
      <button type="button" disabled={page + 1 >= totalPages} onClick={() => onPageChange(page + 1)}>
        Sau <ChevronRight size={16} />
      </button>
    </div>
  );
}
