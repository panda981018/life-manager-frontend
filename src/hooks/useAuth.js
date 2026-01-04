import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");
  const token = localStorage.getItem("token");

  const isAuthenticated = !!token && !!userId;

  const login = (token, userId, userName) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("userName", userName);
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const checkAuth = () => {
    if (!isAuthenticated) {
      navigate("/");
      return false;
    }
    return true;
  };

  return {
    userId,
    userName,
    token,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };
};
