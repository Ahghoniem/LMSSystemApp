import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../Constants/axiosInstance";

export function useFetchData({
  baseUrl,
  queryKey,
  params = {},
  options = {},
  // eslint-disable-next-line no-unused-vars
  token,
}) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get(baseUrl, { params });

        return data;
      } catch (error) {
        console.error("API Error:", {
          url: baseUrl,
          params,
          status: error?.response?.status,
          data: error?.response?.data,
        });

        throw error; 
      }
    },
    retry: false,
    ...options,
  });
}
