import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { useAuth, useForm } from "../hooks";
import logo from "../assets/logo.svg";
import Loading from "../components/Loading";
import Toast from "../components/Toast";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const {
    values: formData,
    handleChange,
    resetForm,
    setValues,
  } = useForm({
    email: "",
    password: "",
    name: "",
  });

  useEffect(() => {
    resetForm();
  }, [isLogin]);

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

        login(response.data.token, response.data.userId, response.data.name);

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
          setValues({
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

  // 소셜 로그인
  const handleSocialLogin = (provider) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    window.location.href = `${backendUrl}/api/oauth2/authorization/${provider}`;
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

        {/* 소셜 로그인 섹션 */}
        {isLogin && (
          <>
            {/* 구분선 */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-grey-500">또는</span>
                </div>
              </div>
            </div>

            {/* 소셜 로그인 버튼들 */}
            <div className="mt-6 space-y-3">
              {/* Kakao */}
              <button
                type="button"
                onClick={() => handleSocialLogin("kakao")}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-[#FEE500] text-gray-900 py-3 rounded-lg hover:bg-[#FDD835] transition font-medium min-h-[48px] disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"
                  />
                </svg>
                카카오로 계속하기
              </button>

              {/* Naver */}
              <button
                type="button"
                onClick={() => handleSocialLogin("naver")}
                className="w-full flex items-center justify-center gap-3 bg-[#03A94D] text-white py-3 rounded-lg hover:bg-[#02B350] transition font-medium min-h-[48px]"
              >
                <img src="/naver-icon.png" alt="Naver" className="w-6 h-6" />
                네이버로 계속하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
