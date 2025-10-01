import axios from "axios";

const API_URL = "http://localhost:8080/fapanese/api";

const handleResponse = async (res: Response) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

// Lấy token từ localStorage
const getToken = () => localStorage.getItem("token");

// Đăng ký
export const signup = async (userData: any) => {
  const res = await fetch(`${API_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return handleResponse(res);
};

// Hàm xử lý đăng nhập
export const login = async (username: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username,
      password,
    });
    return response.data; // Trả về dữ liệu từ API
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

// Hàm xử lý đăng ký
export const register = async (username: string, password: string, email: string) => {
  try {
    const response = await axios.post(`${API_URL}/users/register`, {
      username,
      password,
      email,
    });
    return response.data; // Trả về dữ liệu từ API
  } catch (error) {
    console.error("Registration failed:", error);
    throw error;
  }
};

// ✅ Lấy thông tin user hiện tại
export const getCurrentUser = async () => {
  const token = getToken();
  if (!token) throw new Error("No token found");

  const res = await fetch(`${API_URL}/users/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  return handleResponse(res);
};
