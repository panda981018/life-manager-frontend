import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { scheduleAPI } from "../services/api";
import { useAuth } from "../hooks";
import Header from "../components/Header";
import Loading from "../components/Loading";
import ErrorModal from "../components/ErrorModal";
import Toast from "../components/Toast";
import Pagination from "../components/Pagination";

function SchedulesPage() {
  const navigate = useNavigate();
  const { userId, checkAuth } = useAuth();

  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDatetime: "",
    endDatetime: "",
    isAllDay: false,
    category: "",
    color: "#3B82F6",
  });

  useEffect(() => {
    if (!checkAuth()) return;
    loadSchedules();
  }, [currentPage, sortBy]);

  // 클라이언트 사이드 검색 필터링 (페이지네이션된 데이터에 대해)
  useEffect(() => {
    let result = [...schedules];

    if (searchKeyword.trim()) {
      result = result.filter(
        (schedule) =>
          schedule.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          (schedule.description &&
            schedule.description
              .toLowerCase()
              .includes(searchKeyword.toLowerCase())) ||
          (schedule.category &&
            schedule.category
              .toLowerCase()
              .includes(searchKeyword.toLowerCase()))
      );
    }

    setFilteredSchedules(result);
  }, [schedules, searchKeyword]);

  const loadSchedules = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [field, direction] = sortBy.split("-");
      const sortField = field === "date" ? "startDatetime" : "title";
      const sortDirection = direction;

      const response = await scheduleAPI.getAll(
        userId,
        currentPage,
        pageSize,
        sortField,
        sortDirection
      );

      // Spring Boot Page 응답 구조 처리
      const content = response.data.content;
      const totalPagesFromServer = response.data.totalPages;

      setSchedules(content);
      setFilteredSchedules(content);
      setTotalPages(totalPagesFromServer);
      setTotalElements(response.data.totalElements);

      // 현재 페이지가 전체 페이지를 초과하면 마지막 페이지로 이동
      if (totalPagesFromServer > 0 && currentPage >= totalPagesFromServer) {
        setCurrentPage(totalPagesFromServer - 1);
      }
    } catch (err) {
      console.error("일정 조회 실패:", err);
      setError(
        err.response?.data?.message || "일정을 불러오는 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSearch = (e) => {
    setSearchKeyword(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(0); // 정렬 변경 시 첫 페이지로
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    // 종일 체크박스 클릭 시 시간 자동 설정
    if (name === "isAllDay" && checked) {
      // 현재 선택된 날짜가 있으면 그 날짜 사용, 없으면 오늘
      const startDate = formData.startDatetime
        ? formData.startDatetime.split("T")[0]
        : new Date().toISOString().split("T")[0];

      const endDate = formData.endDatetime
        ? formData.endDatetime.split("T")[0]
        : new Date().toISOString().split("T")[0];

      setFormData({
        ...formData,
        isAllDay: true,
        startDatetime: `${startDate}T00:00`,
        endDatetime: `${endDate}T23:59`,
      });
    } else {
      setFormData({
        ...formData,
        [name]: newValue,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (new Date(formData.startDatetime) > new Date(formData.endDatetime)) {
      setToast({
        message: "종료 시간은 시작 시간보다 늦어야 합니다",
        type: "warning",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (editingSchedule) {
        await scheduleAPI.update(editingSchedule.id, userId, formData);
        setToast({ message: "일정이 수정되었습니다", type: "success" });
      } else {
        await scheduleAPI.create(userId, formData);
        setToast({ message: "일정이 추가되었습니다", type: "success" });
      }

      setFormData({
        title: "",
        description: "",
        startDatetime: "",
        endDatetime: "",
        isAllDay: false,
        category: "",
        color: "#3B82F6",
      });
      setShowModal(false);
      setEditingSchedule(null);
      setCurrentPage(0); // 새로 추가/수정 시 첫 페이지로
      await loadSchedules();
    } catch (err) {
      console.error("일정 저장 실패:", err);
      setError(err.response?.data?.message || "일정 저장에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      title: schedule.title,
      description: schedule.description || "",
      startDatetime: schedule.startDatetime.slice(0, 16),
      endDatetime: schedule.endDatetime.slice(0, 16),
      isAllDay: schedule.isAllDay,
      category: schedule.category || "",
      color: schedule.color || "#3B82F6",
    });
    setShowModal(true);
  };

  const handleDelete = async (scheduleId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    setIsLoading(true);
    try {
      await scheduleAPI.delete(scheduleId, userId);
      setToast({ message: "일정이 삭제되었습니다", type: "success" });
      await loadSchedules();
    } catch (err) {
      console.error("일정 삭제 실패:", err);
      setError(err.response?.data?.message || "일정 삭제에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const openNewScheduleModal = () => {
    setEditingSchedule(null);
    setFormData({
      title: "",
      description: "",
      startDatetime: "",
      endDatetime: "",
      isAllDay: false,
      category: "",
      color: "#3B82F6",
    });
    setShowModal(true);
  };

  const handleRetry = () => {
    loadSchedules();
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {isLoading && <Loading />}

      {error && (
        <ErrorModal
          message={error}
          onRetry={handleRetry}
          onClose={handleCloseError}
        />
      )}

      <Header showBackButton={true} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">일정 관리 🗓️</h2>
          <button
            onClick={openNewScheduleModal}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition text-base font-medium"
          >
            + 일정 추가
          </button>
        </div>

        {/* 검색 & 정렬 섹션 */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="제목, 설명, 카테고리로 검색..."
                  value={searchKeyword}
                  onChange={handleSearch}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
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

            <div className="md:w-48">
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              >
                <option value="date-desc">최신순</option>
                <option value="date-asc">오래된순</option>
                <option value="title-asc">제목 ㄱ-ㅎ</option>
                <option value="title-desc">제목 ㅎ-ㄱ</option>
              </select>
            </div>
          </div>

          {searchKeyword && (
            <div className="mt-3 text-sm text-gray-600">
              검색 결과: {filteredSchedules.length}개
              {filteredSchedules.length === 0 && " - 검색 결과가 없습니다"}
            </div>
          )}
        </div>

        {/* 일정 목록 */}
        <div className="bg-white rounded-lg shadow">
          {filteredSchedules.length > 0 ? (
            <>
              <div className="divide-y">
                {filteredSchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="p-4 md:p-6 hover:bg-gray-50 transition"
                  >
                    {/* 모바일: 세로 레이아웃, 데스크톱: 가로 레이아웃 */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                      {/* 일정 정보 */}
                      <div className="flex-1">
                        {/* 제목 + 색상 */}
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-3 h-3 md:w-4 md:h-4 rounded flex-shrink-0"
                            style={{ backgroundColor: schedule.color }}
                          ></div>
                          <h3 className="text-lg md:text-xl font-bold text-gray-800 break-words">
                            {schedule.title}
                          </h3>
                        </div>

                        {/* 카테고리 */}
                        {schedule.category && (
                          <div className="mb-2">
                            <span className="inline-block text-xs md:text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {schedule.category}
                            </span>
                          </div>
                        )}

                        {/* 설명 */}
                        {schedule.description && (
                          <p className="text-sm md:text-base text-gray-600 mb-2 break-words">
                            {schedule.description}
                          </p>
                        )}

                        {/* 날짜 시간 */}
                        <div className="text-xs md:text-sm text-gray-500 space-y-1">
                          <div>
                            시작:{" "}
                            {new Date(schedule.startDatetime).toLocaleString(
                              "ko-KR"
                            )}
                          </div>
                          <div>
                            종료:{" "}
                            {new Date(schedule.endDatetime).toLocaleString(
                              "ko-KR"
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 버튼 그룹 */}
                      <div className="flex md:flex-col gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(schedule)}
                          className="flex-1 md:flex-none text-blue-600 hover:text-blue-800 px-4 py-2 min-h-[44px] border border-blue-600 rounded md:border-0"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="flex-1 md:flex-none text-red-600 hover:text-red-800 px-4 py-2 min-h-[44px] border border-red-600 rounded md:border-0"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!searchKeyword && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalElements={totalElements}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          ) : (
            <div className="p-12 text-center text-gray-500">
              {searchKeyword
                ? "검색 결과가 없습니다"
                : "등록된 일정이 없습니다. 일정을 추가해보세요!"}
            </div>
          )}
        </div>
      </main>

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">
              {editingSchedule ? "일정 수정" : "일정 추가"}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
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
                  className="w-full h-12 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex items-center min-h-[44px]">
                <input
                  type="checkbox"
                  name="isAllDay"
                  checked={formData.isAllDay}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600"
                />
                <label className="ml-3 text-base text-gray-700">종일</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSchedule(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-medium text-base min-h-[48px]"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition font-medium text-base min-h-[48px]"
                >
                  {editingSchedule ? "수정" : "등록"}
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
