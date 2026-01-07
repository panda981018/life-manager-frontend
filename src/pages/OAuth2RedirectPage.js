import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Loading from "../components/Loading";
import Toast from "../components/Toast";

function OAuth2RedirectPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userId = params.get("userId");
    const name = params.get("name");
    const error = params.get("error");

    if (error) {
      setToast({
        message: "소셜 로그인에 실패했습니다: " + error,
        type: "error",
      });
      setTimeout(() => navigate("/"), 2000);
      return;
    }

    if (!token || !userId || !name) {
      setToast({ message: "로그인 정보가 올바르지 않습니다.", type: "error" });
      setTimeout(() => navigate("/"), 2000);
      return;
    }

    try {
      const decodedName = decodeURIComponent(name);

      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("userName", decodedName);

      setToast({ message: "로그인 성공!", type: "success" });

      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (err) {
      console.error("OAuth2 redirect error:", err);
      setToast({
        message: "로그인 처리 중 오류가 발생했습니다.",
        type: "error",
      });
      setTimeout(() => navigate("/"), 2000);
    }
  }, [navigate, location]);

  return (
    <>
      <Loading />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

export default OAuth2RedirectPage;
