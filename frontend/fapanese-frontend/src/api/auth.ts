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

// Đăng nhập
export const login = async (credentials: { email: string; password: string }) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return handleResponse(res);
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
