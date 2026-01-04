import React from "react";
import { useAuth } from "../hooks";
import logo from "../assets/logo.svg";

function Header({ showBackButton = false }) {
  const { userName, logout } = useAuth();

  const handleBack = () => {
    window.location.href = "/dashboard";
  };

  const handleLogoClick = () => {
    window.location.href = "/dashboard";
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
          onClick={handleLogoClick}
        >
          <img
            src={logo}
            alt="Life Manager Logo"
            className="w-8 h-8 md:w-10 md:h-10"
          />
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            <span className="md:hidden">LM</span>
            <span className="hidden md:inline">Life Manager</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {userName && (
            <span className="hidden md:inline text-gray-600">{userName}님</span>
          )}

          {showBackButton && (
            <button
              onClick={handleBack}
              className="bg-gray-500 text-white px-3 py-2 md:px-4 md:py-2 rounded hover:bg-gray-600 transition text-sm md:text-base"
            >
              <span className="md:hidden">홈</span>
              <span className="hidden md:inline">대시보드</span>
            </button>
          )}

          <button
            onClick={logout}
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
