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
        <div
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
          onClick={handleLogoClick}
        >
          <img src={logo} alt="Life Manager Logo" className="w-10 h-10" />
          <h1 className="text-2xl font-bold text-gray-800">Life Manager</h1>
        </div>
        <div className="flex items-center gap-4">
          {userName && <span className="text-gray-600">{userName}님</span>}
          {showBackButton && (
            <button
              onClick={handleBack}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
            >
              대시보드
            </button>
          )}
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
