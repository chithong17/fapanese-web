import axios from "axios";

const API_URL = "https://85e7dd680e50.ngrok-free.app/fapanese/api/courses";

export const getAllCourses = async (token: string) => {
  console.log("Token gửi đi:", token);
  const res = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.result;
};

export const createCourse = async (data: any, token: string) => {
  const res = await axios.post(API_URL, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.result;
};

export const updateCourse = async (id: number, data: any, token: string) => {
  console.log("🟡 Sending PUT to:", `${API_URL}/${id}`);
  console.log("Token gửi đi:", token);
  console.log("📦 Payload:", data);
  const res = await axios.put(`${API_URL}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.result;
};

export const deleteCourse = async (id: number, token: string) => {
  await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
