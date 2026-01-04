import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { transactionAPI } from "../services/api";
import Header from "../components/Header";
import Loading from "../components/Loading";
import ErrorModal from "../components/ErrorModal";
import Toast from "../components/Toast";

function TransactionsPage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");

  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [filterType, setFilterType] = useState("all"); // all, INCOME, EXPENSE
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [formData, setFormData] = useState({
    type: "EXPENSE",
    amount: "",
    category: "",
    description: "",
    transactionDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }
    loadData();
  }, [userId, navigate, dateRange]);

  // 검색, 필터, 정렬 적용
  useEffect(() => {
    let result = [...transactions];

    // 타입 필터링
    if (filterType !== "all") {
      result = result.filter((transaction) => transaction.type === filterType);
    }

    // 검색 필터링
    if (searchKeyword.trim()) {
      result = result.filter(
        (transaction) =>
          (transaction.category &&
            transaction.category
              .toLowerCase()
              .includes(searchKeyword.toLowerCase())) ||
          (transaction.description &&
            transaction.description
              .toLowerCase()
              .includes(searchKeyword.toLowerCase()))
      );
    }

    // 정렬
    switch (sortBy) {
      case "date-asc":
        result.sort(
          (a, b) => new Date(a.transactionDate) - new Date(b.transactionDate)
        );
        break;
      case "date-desc":
        result.sort(
          (a, b) => new Date(b.transactionDate) - new Date(a.transactionDate)
        );
        break;
      case "amount-asc":
        result.sort((a, b) => a.amount - b.amount);
        break;
      case "amount-desc":
        result.sort((a, b) => b.amount - a.amount);
        break;
      default:
        break;
    }

    setFilteredTransactions(result);
  }, [transactions, searchKeyword, sortBy, filterType]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [transactionsRes, summaryRes] = await Promise.all([
        transactionAPI.getByDateRange(
          userId,
          dateRange.startDate,
          dateRange.endDate
        ),
        transactionAPI.getSummary(
          userId,
          dateRange.startDate,
          dateRange.endDate
        ),
      ]);
      setTransactions(transactionsRes.data);
      setFilteredTransactions(transactionsRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error("데이터 로드 실패:", err);
      setError(
        err.response?.data?.message ||
          "데이터를 불러오는 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchKeyword(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleFilterTypeChange = (type) => {
    setFilterType(type);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 금액 검증
    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      setToast({ message: "금액은 0보다 커야 합니다", type: "warning" });
      return;
    }

    // 미래 날짜 경고
    const today = new Date().toISOString().split("T")[0];
    if (formData.transactionDate > today) {
      if (!window.confirm("미래 날짜로 입력하시겠습니까?")) {
        return;
      }
    }

    setIsLoading(true);

    try {
      const submitData = {
        ...formData,
        amount: amount,
      };

      if (editingTransaction) {
        await transactionAPI.delete(editingTransaction.id, userId);
        await transactionAPI.create(userId, submitData);
        setToast({ message: "거래가 수정되었습니다", type: "success" });
      } else {
        await transactionAPI.create(userId, submitData);
        setToast({ message: "거래가 추가되었습니다", type: "success" });
      }

      setFormData({
        type: "EXPENSE",
        amount: "",
        category: "",
        description: "",
        transactionDate: new Date().toISOString().split("T")[0],
      });
      setShowModal(false);
      setEditingTransaction(null);
      await loadData();
    } catch (err) {
      console.error("거래 저장 실패:", err);
      setError(err.response?.data?.message || "거래 저장에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.category || "",
      description: transaction.description || "",
      transactionDate: transaction.transactionDate,
    });
    setShowModal(true);
  };

  const handleDelete = async (transactionId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    setIsLoading(true);
    try {
      await transactionAPI.delete(transactionId, userId);
      setToast({ message: "거래가 삭제되었습니다", type: "success" });
      await loadData();
    } catch (err) {
      console.error("거래 삭제 실패:", err);
      setError(err.response?.data?.message || "거래 삭제에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const openNewTransactionModal = () => {
    setEditingTransaction(null);
    setFormData({
      type: "EXPENSE",
      amount: "",
      category: "",
      description: "",
      transactionDate: new Date().toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  const handleRetry = () => {
    loadData();
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toast 알림 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* 로딩 모달 */}
      {isLoading && <Loading />}

      {/* 에러 모달 */}
      {error && (
        <ErrorModal
          message={error}
          onRetry={handleRetry}
          onClose={handleCloseError}
        />
      )}

      <Header userName={userName} showBackButton={true} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">가계부 관리</h2>
          <button
            onClick={openNewTransactionModal}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition text-base font-medium"
          >
            + 거래 추가
          </button>
        </div>

        {/* 기간 선택 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시작일
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                종료일
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
              />
            </div>
          </div>
        </div>

        {/* 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">총 수입</h3>
            <p className="text-2xl font-bold text-green-600">
              {summary?.totalIncome?.toLocaleString() || 0}원
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">총 지출</h3>
            <p className="text-2xl font-bold text-red-600">
              {summary?.totalExpense?.toLocaleString() || 0}원
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">잔액</h3>
            <p className="text-2xl font-bold text-blue-600">
              {summary?.balance?.toLocaleString() || 0}원
            </p>
          </div>
        </div>

        {/* 검색 & 정렬 & 필터 섹션 */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          {/* 타입 필터 버튼 */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => handleFilterTypeChange("all")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterType === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              전체
            </button>
            <button
              onClick={() => handleFilterTypeChange("INCOME")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterType === "INCOME"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              수입
            </button>
            <button
              onClick={() => handleFilterTypeChange("EXPENSE")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterType === "EXPENSE"
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              지출
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* 검색 */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="카테고리, 설명으로 검색..."
                  value={searchKeyword}
                  onChange={handleSearch}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* 정렬 */}
            <div className="md:w-48">
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
              >
                <option value="date-desc">최신순</option>
                <option value="date-asc">오래된순</option>
                <option value="amount-desc">금액 높은순</option>
                <option value="amount-asc">금액 낮은순</option>
              </select>
            </div>
          </div>

          {/* 검색 결과 카운트 */}
          {(searchKeyword || filterType !== "all") && (
            <div className="mt-3 text-sm text-gray-600">
              {filterType !== "all" &&
                `${filterType === "INCOME" ? "수입" : "지출"} 필터 적용 / `}
              검색 결과: {filteredTransactions.length}개
              {filteredTransactions.length === 0 && " - 검색 결과가 없습니다"}
            </div>
          )}
        </div>

        {/* 거래 내역 */}
        <div className="bg-white rounded-lg shadow">
          {filteredTransactions.length > 0 ? (
            <div className="divide-y">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            transaction.type === "INCOME"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {transaction.type === "INCOME" ? "수입" : "지출"}
                        </span>
                        {transaction.category && (
                          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {transaction.category}
                          </span>
                        )}
                      </div>
                      {transaction.description && (
                        <p className="text-gray-600 mb-2">
                          {transaction.description}
                        </p>
                      )}
                      <div className="text-sm text-gray-500">
                        {transaction.transactionDate}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`text-2xl font-bold ${
                          transaction.type === "INCOME"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "INCOME" ? "+" : "-"}
                        {transaction.amount.toLocaleString()}원
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="text-blue-600 hover:text-blue-800 px-4 py-2 min-h-[44px]"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="text-red-600 hover:text-red-800 px-4 py-2 min-h-[44px]"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              {searchKeyword || filterType !== "all"
                ? "검색 결과가 없습니다"
                : "등록된 거래 내역이 없습니다. 거래를 추가해보세요!"}
            </div>
          )}
        </div>
      </main>

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">
              {editingTransaction ? "거래 수정" : "거래 추가"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  유형 *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                  required
                >
                  <option value="INCOME">수입</option>
                  <option value="EXPENSE">지출</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  금액 *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                  required
                  min="1"
                  step="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  카테고리
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="예: 식비, 교통비, 월급"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  거래 날짜 *
                </label>
                <input
                  type="date"
                  name="transactionDate"
                  value={formData.transactionDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTransaction(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-medium text-base min-h-[48px]"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition font-medium text-base min-h-[48px]"
                >
                  {editingTransaction ? "수정" : "등록"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionsPage;
