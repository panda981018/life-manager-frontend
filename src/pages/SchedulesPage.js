import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { scheduleAPI } from '../services/api';

function SchedulesPage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');
  
  const [schedules, setSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDatetime: '',
    endDatetime: '',
    isAllDay: false,
    category: '',
    color: '#3B82F6',
  });

  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }
    loadSchedules();
  }, [userId, navigate]);

  const loadSchedules = async () => {
    try {
      const response = await scheduleAPI.getAll(userId);
      setSchedules(response.data);
    } catch (err) {
      console.error('일정 조회 실패:', err);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingSchedule) {
        // 수정
        await scheduleAPI.update(editingSchedule.id, userId, formData);
      } else {
        // 등록
        await scheduleAPI.create(userId, formData);
      }
      
      // 폼 초기화
      setFormData({
        title: '',
        description: '',
        startDatetime: '',
        endDatetime: '',
        isAllDay: false,
        category: '',
        color: '#3B82F6',
      });
      setShowModal(false);
      setEditingSchedule(null);
      loadSchedules();
    } catch (err) {
      console.error('일정 저장 실패:', err);
      alert('일정 저장에 실패했습니다.');
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      title: schedule.title,
      description: schedule.description || '',
      startDatetime: schedule.startDatetime.slice(0, 16),
      endDatetime: schedule.endDatetime.slice(0, 16),
      isAllDay: schedule.isAllDay,
      category: schedule.category || '',
      color: schedule.color || '#3B82F6',
    });
    setShowModal(true);
  };

  const handleDelete = async (scheduleId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      await scheduleAPI.delete(scheduleId, userId);
      loadSchedules();
    } catch (err) {
      console.error('일정 삭제 실패:', err);
      alert('일정 삭제에 실패했습니다.');
    }
  };

  const openNewScheduleModal = () => {
    setEditingSchedule(null);
    setFormData({
      title: '',
      description: '',
      startDatetime: '',
      endDatetime: '',
      isAllDay: false,
      category: '',
      color: '#3B82F6',
    });
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
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
          <h2 className="text-3xl font-bold text-gray-800">일정 관리</h2>
          <button
            onClick={openNewScheduleModal}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            + 일정 추가
          </button>
        </div>

        {/* 일정 목록 */}
        <div className="bg-white rounded-lg shadow">
          {schedules.length > 0 ? (
            <div className="divide-y">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: schedule.color }}
                        ></div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {schedule.title}
                        </h3>
                        {schedule.category && (
                          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {schedule.category}
                          </span>
                        )}
                      </div>
                      {schedule.description && (
                        <p className="text-gray-600 mb-2">{schedule.description}</p>
                      )}
                      <div className="text-sm text-gray-500">
                        {new Date(schedule.startDatetime).toLocaleString('ko-KR')}
                        {' ~ '}
                        {new Date(schedule.endDatetime).toLocaleString('ko-KR')}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(schedule)}
                        className="text-blue-600 hover:text-blue-800 px-3 py-1"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(schedule.id)}
                        className="text-red-600 hover:text-red-800 px-3 py-1"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              등록된 일정이 없습니다. 일정을 추가해보세요!
            </div>
          )}
        </div>
      </main>

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h3 className="text-2xl font-bold mb-6">
              {editingSchedule ? '일정 수정' : '일정 추가'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제목 *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  시작 일시 *
                </label>
                <input
                  type="datetime-local"
                  name="startDatetime"
                  value={formData.startDatetime}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  종료 일시 *
                </label>
                <input
                  type="datetime-local"
                  name="endDatetime"
                  value={formData.endDatetime}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
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
                  placeholder="예: 회의, 개인, 업무"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  색상
                </label>
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full h-10 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isAllDay"
                  checked={formData.isAllDay}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600"
                />
                <label className="ml-2 text-sm text-gray-700">
                  종일
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSchedule(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  {editingSchedule ? '수정' : '등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SchedulesPage;