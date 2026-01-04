import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";

function Header({ userName, showBackButton = false }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleLogoClick = () => {
    navigate("/dashboard");
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* 로고 + 텍스트 */}
        <div
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
          onClick={handleLogoClick}
        >
          <img
            src={logo}
            alt="Life Manager Logo"
            className="w-8 h-8 md:w-10 md:h-10"
          />
          {/* 모바일에서는 "LM"만, 태블릿 이상에서는 전체 표시 */}
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            <span className="md:hidden">LM</span>
            <span className="hidden md:inline">Life Manager</span>
          </h1>
        </div>

        {/* 버튼 그룹 */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* 사용자 이름 - 태블릿 이상에서만 */}
          {userName && (
            <span className="hidden md:inline text-gray-600">{userName}님</span>
          )}

          {/* 대시보드 버튼 */}
          {showBackButton && (
            <button
              onClick={handleBack}
              className="bg-gray-500 text-white px-3 py-2 md:px-4 md:py-2 rounded hover:bg-gray-600 transition text-sm md:text-base"
            >
              <span className="md:hidden">홈</span>
              <span className="hidden md:inline">대시보드</span>
            </button>
          )}

          {/* 로그아웃 버튼 */}
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-2 md:px-4 md:py-2 rounded hover:bg-red-600 transition text-sm md:text-base"
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
