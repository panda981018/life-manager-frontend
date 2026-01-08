import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI } from "../services/api";
import { useAuth } from "../hooks";
import Header from "../components/Header";
import Loading from "../components/Loading";
import Toast from "../components/Toast";

function ProfilePage() {
  const navigate = useNavigate();
  const { userId, checkAuth } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });
  const [nameForm, setNameForm] = useState({ name: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!checkAuth()) return;
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    setIsLoading(true);
    try {
      const response = await userAPI.getUser(userId); // userId 제거
      setUserInfo(response.data);
      setNameForm({ name: response.data.name });
    } catch (err) {
      console.error("사용자 정보 로드 실패:", err);
      setToast({ message: "사용자 정보를 불러올 수 없습니다", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameChange = (e) => {
    setNameForm({ name: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleNameSubmit = async (e) => {
    e.preventDefault();

    if (!nameForm.name.trim()) {
      setToast({ message: "이름을 입력해주세요", type: "warning" });
      return;
    }

    setIsLoading(true);
    try {
      await userAPI.updateUser(userId, { name: nameForm.name }); // userId 제거

      localStorage.setItem("userName", nameForm.name);

      setToast({ message: "이름이 변경되었습니다", type: "success" });
      await loadUserInfo();
    } catch (err) {
      console.error("이름 변경 실패:", err);
      setToast({
        message: err.response?.data?.message || "이름 변경에 실패했습니다",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      setToast({ message: "현재 비밀번호를 입력해주세요", type: "warning" });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setToast({
        message: "새 비밀번호는 8자 이상이어야 합니다",
        type: "warning",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setToast({ message: "새 비밀번호가 일치하지 않습니다", type: "warning" });
      return;
    }

    setIsLoading(true);
    try {
      await userAPI.changePassword(userId, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setToast({ message: "비밀번호가 변경되었습니다", type: "success" });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("비밀번호 변경 실패:", err);
      setToast({
        message: err.response?.data?.message || "비밀번호 변경에 실패했습니다",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {isLoading && <Loading />}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Header showBackButton={true} />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">프로필 관리</h2>

        {/* 사용자 정보 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">계정 정보</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-500">
                이메일
              </label>
              <p className="text-base text-gray-800 mt-1">{userInfo.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                이름
              </label>
              <p className="text-base text-gray-800 mt-1">{userInfo.name}</p>
            </div>
          </div>
        </div>

        {/* 이름 변경 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">이름 변경</h3>
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                새 이름
              </label>
              <input
                type="text"
                value={nameForm.name}
                onChange={handleNameChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                placeholder="새 이름을 입력하세요"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition font-medium min-h-[48px] disabled:opacity-50"
            >
              이름 변경
            </button>
          </form>
        </div>

        {/* 비밀번호 변경 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            비밀번호 변경
          </h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                현재 비밀번호
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                placeholder="현재 비밀번호"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                새 비밀번호 (8자 이상)
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                placeholder="새 비밀번호"
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                새 비밀번호 확인
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                placeholder="새 비밀번호 확인"
                minLength={8}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition font-medium min-h-[48px] disabled:opacity-50"
            >
              비밀번호 변경
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
