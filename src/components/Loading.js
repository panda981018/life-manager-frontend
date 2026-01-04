import React from 'react';

function Loading() {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-xl text-gray-700 font-medium">로딩 중...</p>
      </div>
    </div>
  );
}

export default Loading;