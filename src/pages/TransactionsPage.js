import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionAPI } from '../services/api';
import Loading from '../components/Loading';
import ErrorModal from '../components/ErrorModal';

function TransactionsPage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');
  
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [formData, setFormData] = useState({
    type: 'EXPENSE',
    amount: '',
    category: '',
    description: '',
    transactionDate: new Date().toISOString().split('T')[0],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }
    loadTransactions();
  }, [userId, navigate, dateRange]);

  const loadTransactions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [transactionsRes, summaryRes] = await Promise.all([
        transactionAPI.getByDateRange(userId, dateRange.startDate, dateRange.endDate),
        transactionAPI.getSummary(userId, dateRange.startDate, dateRange.endDate),
      ]);
      setTransactions(transactionsRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error('데이터 로드 실패:', err);
      setError(err.response?.data?.message || '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRetry = () => {
    loadTransactions();
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      if (editingTransaction) {
        // 수정 API가 없으므로 삭제 후 재등록
        await transactionAPI.delete(editingTransaction.id, userId);
      }
      
      await transactionAPI.create(userId, submitData);
      
      setFormData({
        type: 'EXPENSE',
        amount: '',
        category: '',
        description: '',
        transactionDate: new Date().toISOString().split('T')[0],
      });
      setShowModal(false);
      setEditingTransaction(null);
      loadTransactions();
    } catch (err) {
      console.error('거래 저장 실패:', err);
      alert('거래 저장에 실패했습니다.');
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.category || '',
      description: transaction.description || '',
      transactionDate: transaction.transactionDate,
    });
    setShowModal(true);
  };

  const handleDelete = async (transactionId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      await transactionAPI.delete(transactionId, userId);
      loadTransactions();
    } catch (err) {
      console.error('거래 삭제 실패:', err);
      alert('거래 삭제에 실패했습니다.');
    }
  };

  const openNewTransactionModal = () => {
    setEditingTransaction(null);
    setFormData({
      type: 'EXPENSE',
      amount: '',
      category: '',
      description: '',
      transactionDate: new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
        {/* 에러 모달 */}
        {error && (
        <ErrorModal 
            message={error}
            onRetry={handleRetry}
            onClose={handleCloseError}
        />
        )}
        {/* 헤더 */}
        <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Life Manager</h1>
            <div className="flex items-center gap-4">
            <span className="text-gray-600">{userName}님</span>
            <button
                onClick={() => navigate('/dashboard')}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
            >
                대시보드
            </button>
            </div>
        </div>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">가계부 관리</h2>
            <button
            onClick={openNewTransactionModal}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
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
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
            </div>
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                종료일
                </label>
                <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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

        {/* 거래 내역 */}
        <div className="bg-white rounded-lg shadow">
            {transactions.length > 0 ? (
            <div className="divide-y">
                {transactions.map((transaction) => (
                <div key={transaction.id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                        <span
                            className={`px-3 py-1 rounded text-sm font-medium ${
                            transaction.type === 'INCOME'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                        >
                            {transaction.type === 'INCOME' ? '수입' : '지출'}
                        </span>
                        {transaction.category && (
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {transaction.category}
                            </span>
                        )}
                        </div>
                        {transaction.description && (
                        <p className="text-gray-600 mb-2">{transaction.description}</p>
                        )}
                        <div className="text-sm text-gray-500">
                        {transaction.transactionDate}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span
                        className={`text-2xl font-bold ${
                            transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                        }`}
                        >
                        {transaction.type === 'INCOME' ? '+' : '-'}
                        {transaction.amount.toLocaleString()}원
                        </span>
                        <div className="flex gap-2">
                        <button
                            onClick={() => handleEdit(transaction)}
                            className="text-blue-600 hover:text-blue-800 px-3 py-1"
                        >
                            수정
                        </button>
                        <button
                            onClick={() => handleDelete(transaction.id)}
                            className="text-red-600 hover:text-red-800 px-3 py-1"
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
                등록된 거래 내역이 없습니다. 거래를 추가해보세요!
            </div>
            )}
        </div>
        </main>

        {/* 모달 */}
        {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h3 className="text-2xl font-bold mb-6">
                {editingTransaction ? '거래 수정' : '거래 추가'}
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                    min="0"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                    취소
                </button>
                <button
                    type="submit"
                    className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                >
                    {editingTransaction ? '수정' : '등록'}
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