import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { scheduleAPI, transactionAPI } from '../services/api';
import Loading from '../components/Loading';
import ErrorModal from '../components/ErrorModal';
import Header from '../components/Header';

function DashboardPage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }
    setUserName(localStorage.getItem('userName') || '사용자');
    loadData();
  }, [userId, navigate]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const scheduleRes = await scheduleAPI.getAll(userId);
      const now = new Date();
      const upcomingSchedules = scheduleRes.data
        .filter(schedule => new Date(schedule.endDatetime) > now)
        .slice(0, 5);
      setSchedules(upcomingSchedules);

      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const summaryRes = await transactionAPI.getSummary(
        userId,
        firstDay.toISOString().split('T')[0],
        lastDay.toISOString().split('T')[0]
      );
      setSummary(summaryRes.data);
    } catch (err) {
      console.error('데이터 로드 실패:', err);
      setError(err.response?.data?.message || '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    loadData();
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {isLoading && <Loading />}
      
      {error && (
        <ErrorModal 
          message={error}
          onRetry={handleRetry}
          onClose={handleCloseError}
        />
      )}

      <Header userName={userName} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">대시보드</h2>

        {/* 가계부 요약 */}
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

        {/* 최근 일정 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">다가오는 일정</h3>
            <button
              onClick={() => navigate('/schedules')}
              className="text-blue-500 hover:text-blue-600"
            >
              전체 보기 →
            </button>
          </div>
          {schedules.length > 0 ? (
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="border-l-4 pl-4 py-2"
                  style={{ borderLeftColor: schedule.color || '#3B82F6' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-800">{schedule.title}</h4>
                    {schedule.category && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {schedule.category}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(schedule.startDatetime).toLocaleString('ko-KR')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              등록된 일정이 없습니다
            </div>
          )}
        </div>

        {/* 메뉴 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate('/schedules')}
            className="bg-blue-500 text-white p-8 rounded-lg hover:bg-blue-600 transition shadow"
          >
            <h3 className="text-2xl font-bold mb-2">일정 관리</h3>
            <p className="text-blue-100">일정을 등록하고 관리하세요</p>
          </button>
          <button
            onClick={() => navigate('/transactions')}
            className="bg-green-500 text-white p-8 rounded-lg hover:bg-green-600 transition shadow"
          >
            <h3 className="text-2xl font-bold mb-2">가계부 관리</h3>
            <p className="text-green-100">수입과 지출을 기록하세요</p>
          </button>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;