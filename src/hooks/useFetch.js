import { useState, useEffect, useCallback } from "react";

export const useFetch = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiCall();
      setData(response.data);
    } catch (err) {
      console.error("데이터 로드 실패:", err);
      setError(
        err.response?.data?.message ||
          "데이터를 불러오는 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = () => {
    fetchData();
  };

  return {
    data,
    isLoading,
    error,
    refetch,
    setData,
  };
};
