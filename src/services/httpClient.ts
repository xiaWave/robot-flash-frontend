import axios from "axios";

export const httpClient = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);
