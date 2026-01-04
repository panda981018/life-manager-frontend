import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import logo from "../assets/logo.svg";

function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [error, setError] = useState("");

  // 탭 전환 시 폼 초기화
  useEffect(() => {
    setFormData({
      email: "",
      password: "",
      name: "",
    });
    setError("");
  }, [isLogin]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      let response;
      if (isLogin) {
        // 로그인
        response = await authAPI.login({
          email: formData.email,
          password: formData.password,
        });
      } else {
        // 회원가입
        response = await authAPI.signup(formData);
      }

      // 토큰 및 사용자 정보 저장
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.userId);
      localStorage.setItem("userName", response.data.name);

      // 대시보드로 이동
      navigate("/dashboard");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "오류가 발생했습니다";
      setError(errorMessage);
    }
  };

  return (
    <div
      style={{ minHeight: "100vh" }}
      className="bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* 로고 */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Life Manager Logo" className="w-20 h-20" />
        </div>

        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Life Manager
        </h1>

        {/* 탭 전환 (form 밖으로 이동하거나 type="button" 명시) */}
        <div className="flex mb-6">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-center ${
              isLogin ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
            } rounded-l-lg transition`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-center ${
              !isLogin ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
            } rounded-r-lg transition`}
          >
            회원가입
          </button>
        </div>

        {/* 로그인/회원가입 폼 */}
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              required
              minLength={8}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition font-medium text-base min-h-[48px]"
          >
            {isLogin ? "로그인" : "회원가입"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
