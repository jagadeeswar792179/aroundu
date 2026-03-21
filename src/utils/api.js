import axios from "axios";

const server = process.env.REACT_APP_SERVER;

const api = axios.create({
  baseURL: server,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;