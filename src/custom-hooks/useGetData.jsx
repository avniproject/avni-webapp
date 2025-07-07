import { useEffect, useState } from "react";
import { httpClient as http } from "../common/utils/httpClient";

export default function useGetData(url) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const callApi = async () => {
    try {
      const response = await http.get(url);
      if (response.statusText && response.statusText !== "OK") {
        setError(response.data);
      } else {
        const newData = await response.data;
        setData(newData);
      }
    } catch (error) {
      setError(error);
    }
  };

  useEffect(() => {
    callApi();
  }, []);

  return [data, error];
}
