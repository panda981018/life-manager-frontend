import React from "react";

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
        <h3 className="text-lg font-bold text-gray-800 mb-4">{message}</h3>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-medium min-h-[48px]"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition font-medium min-h-[48px]"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
