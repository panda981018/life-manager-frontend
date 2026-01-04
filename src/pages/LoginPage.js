import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import logo from "../assets/logo.svg";
import Loading from "../components/Loading";
import Toast from "../components/Toast";

function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setFormData({
      email: "",
      password: "",
      name: "",
    });
  }, [isLogin]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let response;
      if (isLogin) {
        response = await authAPI.login({
          email: formData.email,
          password: formData.password,
        });

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userId", response.data.userId);
        localStorage.setItem("userName", response.data.name);

        setToast({ message: "로그인 성공!", type: "success" });
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        response = await authAPI.signup(formData);

        setToast({
          message: "회원가입 성공! 로그인해주세요.",
          type: "success",
        });
        setTimeout(() => {
          setIsLogin(true);
          setFormData({
            email: formData.email,
            password: "",
            name: "",
          });
        }, 1500);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "오류가 발생했습니다";
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div
      style={{ minHeight: "100vh" }}
      className="bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4"
    >
      {/* 로딩 오버레이 */}
      {isLoading && <Loading />}

      {/* Toast 알림 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Life Manager Logo" className="w-20 h-20" />
        </div>

        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Life Manager
        </h1>

        <div className="flex mb-6">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            disabled={isLoading}
            className={`flex-1 py-2 text-center ${
              isLogin ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
            } rounded-l-lg transition disabled:opacity-50`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            disabled={isLoading}
            className={`flex-1 py-2 text-center ${
              !isLogin ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
            } rounded-r-lg transition disabled:opacity-50`}
          >
            회원가입
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base disabled:bg-gray-100"
                required={!isLogin}
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base disabled:bg-gray-100"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base disabled:bg-gray-100"
              required
              minLength={8}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition font-medium text-base min-h-[48px] disabled:opacity-50"
          >
            {isLoading ? "처리 중..." : isLogin ? "로그인" : "회원가입"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
