import React from "react";

function Pagination({ currentPage, totalPages, totalElements, onPageChange }) {
  const pages = [];
  const maxVisible = 5;

  let startPage = Math.max(0, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(0, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-4 px-2">
      {/* 좌측: 총 개수 */}
      <div className="text-sm text-gray-600">총 {totalElements}개</div>

      {/* 중앙: 페이지네이션 버튼 - 2페이지 이상일 때만 */}
      {totalPages > 1 ? (
        <div className="flex items-center gap-2">
          {/* 처음으로 */}
          <button
            onClick={() => onPageChange(0)}
            disabled={currentPage === 0}
            className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] text-sm"
            aria-label="첫 페이지"
          >
            «
          </button>

          {/* 이전 */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] text-sm"
            aria-label="이전 페이지"
          >
            ‹
          </button>

          {/* 페이지 번호 */}
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-4 py-2 rounded-lg min-h-[44px] font-medium text-sm ${
                currentPage === page
                  ? "bg-blue-500 text-white"
                  : "border border-gray-300 hover:bg-gray-100"
              }`}
            >
              {page + 1}
            </button>
          ))}

          {/* 다음 */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] text-sm"
            aria-label="다음 페이지"
          >
            ›
          </button>

          {/* 마지막으로 */}
          <button
            onClick={() => onPageChange(totalPages - 1)}
            disabled={currentPage === totalPages - 1}
            className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] text-sm"
            aria-label="마지막 페이지"
          >
            »
          </button>
        </div>
      ) : (
        <div></div>
      )}

      {/* 우측: 페이지 정보 (항상 표시) */}
      <div className="text-sm text-gray-600">
        {currentPage + 1} / {totalPages} 페이지
      </div>
    </div>
  );
}

export default Pagination;
